'use client';

import { useEffect, useState } from 'react';
import { useMetaMask } from '@/lib/web3/useMetaMask';
import { useWalletStore } from '@/lib/store/walletStore';
import { AlertCircle, Wallet, LogOut, CheckCircle } from 'lucide-react';

export function MetaMaskLoginButton() {
  const { account, connectWallet, disconnectWallet, isMetaMaskAvailable, isConnecting, error } = useMetaMask();
  const { address, isConnected, setAddress, setIsConnected, setError } = useWalletStore();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (account) {
      setAddress(account.address);
      setIsConnected(true);
    }
  }, [account, setAddress, setIsConnected]);

  useEffect(() => {
    if (error) {
      setError(error);
    }
  }, [error, setError]);

  const handleConnect = async () => {
    const result = await connectWallet();
    if (result) {
      setAddress(result.address);
      setIsConnected(true);
      setError(null);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setAddress(null);
    setIsConnected(false);
  };

  if (!isMetaMaskAvailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          MetaMask not installed. <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Install MetaMask</a> to use blockchain features.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isConnected && address ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-sm">
                <div className="font-semibold text-green-900">Wallet Connected</div>
                <div className="text-xs text-green-700 font-mono mt-1">
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
                </div>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 rounded transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Disconnect
            </button>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-2 text-xs text-green-600 hover:text-green-800 underline"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
          {showDetails && (
            <div className="mt-2 pt-2 border-t border-green-200 text-xs text-green-700 space-y-1">
              <div>Full Address: {address}</div>
              <div>Status: Ready for transactions</div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          <Wallet className="w-4 h-4" />
          {isConnecting ? 'Connecting...' : 'Connect MetaMask Wallet'}
        </button>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
    </div>
  );
}
