import { create } from 'zustand';
import { supabase } from '../supabase';

interface UserState {
  user: any | null;
  loading: boolean;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
})); 