import { create } from 'zustand';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db} from '../utils/firebase';
import { Usuario } from '../utils/supabase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthState {
  usuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nombre: string, telefono: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}


export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const user: User = credentials.user;

      // Obtener datos del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        throw new Error('No se encontró perfil de usuario.');
      }

      const data = userDoc.data();

      const usuario: Usuario = {
        id: user.uid,
        email: data.email,
        nombre_completo: data.nombre_completo,
        tipo: data.tipo,
        created_at: data.created_at,
      };

      set({ usuario, isLoading: false });
    } catch (err: any) {
      console.error('Error de login:', err.message);
      set({ error: 'Correo o contraseña incorrectos o sin perfil', isLoading: false });
    }
  },
 
  logout: async () => {
    set({ isLoading: true });
    await signOut(auth);
    set({ usuario: null, isLoading: false });
  },

  register: async (email, password, nombre, telefono) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // Creamos el perfil en Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        password,
        nombre_completo: nombre,
        tipo: 'familiar',
        telefono,      
        created_at: new Date().toLocaleDateString('es-MX'),
        imagen_perfil: null,
        imagenes_extra: [],
        descripcion: null,
        paciente_id: null,
        auth_uid: user.uid
      });
      // Dejamos logueado al familiar (puedes cambiar si prefieres volver al admin)
      set({
        usuario: {
          id: user.uid,
          email,
          password,
          nombre_completo: nombre,
          tipo: 'familiar',
          telefono,
          creado_por: 'admin',
          created_at: new Date().toLocaleDateString('es-MX')
        },
        isLoading: false
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          set({ usuario: null, isLoading: false });
          return;
        }

        const data = userDoc.data();

        const usuario: Usuario = {
          id: user.uid,
          email: data.email,
          nombre_completo: data.nombre_completo,
          tipo: data.tipo,
          created_at: data.created_at,
        };

        set({ usuario, isLoading: false });
      } else {
        set({ usuario: null, isLoading: false });
      }
    });
  },
}));
