import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  setAddress: (address: string | null) => void;
  setChainId: (chainId: number | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      setAddress: (address) => set({ address }),
      setChainId: (chainId) => set({ chainId }),
      setIsConnected: (connected) => set({ isConnected: connected }),
      setIsConnecting: (connecting) => set({ isConnecting: connecting }),
      setError: (error) => set({ error }),
      reset: () => set({
        address: null,
        chainId: null,
        isConnected: false,
        isConnecting: false,
        error: null,
      }),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        address: state.address,
        chainId: state.chainId,
        isConnected: state.isConnected,
      }),
    }
  )
);
