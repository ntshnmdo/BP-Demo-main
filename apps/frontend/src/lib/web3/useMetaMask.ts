import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';

export interface MetaMaskAccount {
  address: string;
  chainId: number;
  isConnected: boolean;
}

export function useMetaMask() {
  const [account, setAccount] = useState<MetaMaskAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is available
  const isMetaMaskAvailable = useCallback(() => {
    return typeof window !== 'undefined' && 'ethereum' in window;
  }, []);

  // Request account access
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskAvailable()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum!);
      
      // Request account access
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please enable MetaMask access.');
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      const accountInfo: MetaMaskAccount = {
        address,
        chainId: Number(network.chainId),
        isConnected: true,
      };

      setAccount(accountInfo);
      return accountInfo;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to connect MetaMask wallet';
      setError(errorMessage);
      console.error('MetaMask connection error:', err);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [isMetaMaskAvailable]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setError(null);
  }, []);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskAvailable()) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum!);
        const accounts = await provider.listAccounts();
        
        if (accounts && accounts.length > 0) {
          const network = await provider.getNetwork();
          setAccount({
            address: accounts[0].address,
            chainId: Number(network.chainId),
            isConnected: true,
          });
        }
      } catch (err) {
        console.error('Failed to check wallet connection:', err);
      }
    };

    checkConnection();
  }, [isMetaMaskAvailable]);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskAvailable()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setAccount((prev) => prev ? { ...prev, address: accounts[0] } : null);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setAccount((prev) => prev ? { ...prev, chainId: parseInt(chainId, 16) } : null);
    };

    window.ethereum!.on('accountsChanged', handleAccountsChanged);
    window.ethereum!.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum!.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskAvailable, disconnectWallet]);

  return {
    account,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    isMetaMaskAvailable: isMetaMaskAvailable(),
  };
}
