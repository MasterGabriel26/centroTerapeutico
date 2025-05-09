import { create } from 'zustand';
import { supabase, Usuario } from '../utils/supabase';

interface AuthState {
  usuario: Usuario | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
  
    const usuarioFalso: Usuario = {
      id: 'demo-001',
      email,
      nombre_completo: 'Usuario Demo',
      tipo: 'admin',
      created_at: new Date().toISOString(),
    };
  
    await new Promise((res) => setTimeout(res, 300));
  
    set({
      usuario: usuarioFalso,
      isLoading: false,
      error: null,
    });

  },
  
  // login: async (email: string, password: string) => {
  //   try {
  //     set({ isLoading: true, error: null });
      
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email,
  //       password,
  //     });

  //     if (error) throw error;

  //     if (data.user) {
  //       const { data: usuarioData, error: profileError } = await supabase
  //         .from('usuarios')
  //         .select('*')
  //         .eq('id', data.user.id)
  //         .single();

  //       if (profileError) throw profileError;
        
  //       set({ usuario: usuarioData as Usuario, isLoading: false });
  //     }
  //   } catch (error) {
  //     console.error('Error de inicio de sesión:', error);
  //     set({ 
  //       error: error instanceof Error ? error.message : 'Error al iniciar sesión', 
  //       isLoading: false 
  //     });
  //   }
  // },

  logout: async () => {
    try {
      set({ isLoading: true });
      await supabase.auth.signOut();
      set({ usuario: null, isLoading: false });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Error al cerrar sesión', 
        isLoading: false 
      });
    }
  },

  checkSession: async () => {
    try {
      set({ isLoading: true });
      
      const { data } = await supabase.auth.getSession();
      
      if (data.session?.user) {
        const { data: usuarioData } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        set({ usuario: usuarioData as Usuario, isLoading: false });
      } else {
        set({ usuario: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      set({ 
        usuario: null, 
        error: error instanceof Error ? error.message : 'Error al verificar sesión',
        isLoading: false 
      });
    }
  },
}));