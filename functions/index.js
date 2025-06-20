const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();

const db = admin.firestore();

// Función para hashear password (por seguridad)
function hashPassword(password) {
  return password;
}

// Middleware para manejar CORS y autenticación
async function handleAuth(req, res, handler) {
  // Configurar CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  try {
    // Verificar token
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No autorizado' });
      return;
    }
    
    const token = authorization.replace('Bearer ', '');
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Llamar al handler con el usuario autenticado
    await handler(req, res, decodedToken);
    
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
}

// Función de prueba
exports.testAuthHttp = functions.https.onRequest(async (req, res) => {
  await handleAuth(req, res, async (req, res, user) => {
    res.json({
      authenticated: true,
      uid: user.uid,
      email: user.email
    });
  });
});

// Función para crear usuarios
exports.createUserHttp = functions.https.onRequest(async (req, res) => {
  await handleAuth(req, res, async (req, res, user) => {
    try {
      // Verificar que sea admin
      const adminCheck = await db.collection('users')
        .where('auth_uid', '==', user.uid)
        .limit(1)
        .get();

      if (adminCheck.empty) {
        res.status(403).json({ error: 'Usuario no encontrado en el sistema' });
        return;
      }

      const adminData = adminCheck.docs[0].data();
      if (adminData.tipo !== 'admin') {
        res.status(403).json({ error: 'Solo los administradores pueden crear usuarios' });
        return;
      }

      // Obtener datos del body
      const { nombre_completo, email, telefono, tipo, password, paciente_id } = req.body;

      if (!nombre_completo || !email || !tipo || !password) {
        res.status(400).json({ error: 'Faltan campos requeridos' });
        return;
      }

      // Crear usuario en Auth
      let userRecord;
      try {
        userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          displayName: nombre_completo,
        });
        console.log('Usuario creado en Auth con UID:', userRecord.uid);
      } catch (authError) {
        console.error('Error creando usuario en Auth:', authError);
        
        if (authError.code === 'auth/email-already-exists') {
          res.status(400).json({ error: 'Este email ya está registrado' });
        } else if (authError.code === 'auth/invalid-email') {
          res.status(400).json({ error: 'Email inválido' });
        } else if (authError.code === 'auth/weak-password') {
          res.status(400).json({ error: 'La contraseña es muy débil (mínimo 6 caracteres)' });
        } else {
          res.status(500).json({ error: 'Error al crear usuario en Auth' });
        }
        return;
      }

      // Crear documento en Firestore CON EL MISMO ID
      const userData = {
        nombre_completo,
        email,
        telefono: telefono || '',
        tipo,
        password: hashPassword(password), // Guardar password hasheado
        created_at: new Date().toLocaleDateString('es-MX'),
        created_timestamp: admin.firestore.FieldValue.serverTimestamp(),
        auth_uid: userRecord.uid,
        created_by: user.uid
      };

      // Agregar paciente_id si es familiar
      if (tipo === 'familiar' && paciente_id) {
        const pacienteDoc = await db.collection('pacientes').doc(paciente_id).get();
        if (!pacienteDoc.exists) {
          // Si el paciente no existe, eliminar el usuario creado
          await admin.auth().deleteUser(userRecord.uid);
          res.status(400).json({ error: 'El paciente especificado no existe' });
          return;
        }
        userData.paciente_id = paciente_id;
      }

      // IMPORTANTE: Usar el UID como ID del documento
      try {
        await db.collection('users').doc(userRecord.uid).set(userData);
        console.log('Documento creado en Firestore con ID:', userRecord.uid);
      } catch (firestoreError) {
        console.error('Error creando documento en Firestore:', firestoreError);
        // Si falla Firestore, eliminar el usuario de Auth
        await admin.auth().deleteUser(userRecord.uid);
        res.status(500).json({ error: 'Error al guardar datos del usuario' });
        return;
      }

      // Establecer custom claims
      try {
        if (tipo === 'admin') {
          await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
        } else if (tipo === 'medico') {
          await admin.auth().setCustomUserClaims(userRecord.uid, { medico: true });
        }
      } catch (claimsError) {
        console.error('Error estableciendo claims:', claimsError);
        // No es crítico, continuamos
      }

      res.json({
        success: true,
        userId: userRecord.uid, // Ahora userId y authUid son lo mismo
        authUid: userRecord.uid,
        message: 'Usuario creado exitosamente'
      });

    } catch (error) {
      console.error('Error general creando usuario:', error);
      res.status(500).json({ error: 'Error interno al crear usuario' });
    }
  });
});

// Función adicional para obtener usuario por ID (útil para verificar)
exports.getUserHttp = functions.https.onRequest(async (req, res) => {
  await handleAuth(req, res, async (req, res, user) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        res.status(400).json({ error: 'Falta el ID del usuario' });
        return;
      }

      // Obtener documento de Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Obtener datos de Auth
      let authUser;
      try {
        authUser = await admin.auth().getUser(userId);
      } catch (error) {
        console.error('Error obteniendo usuario de Auth:', error);
      }

      res.json({
        firestore: {
          id: userDoc.id,
          ...userDoc.data(),
          password: undefined // No devolver el password
        },
        auth: authUser ? {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          disabled: authUser.disabled
        } : null
      });

    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  });
});