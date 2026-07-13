'use client';

import { useState } from 'react';
import { useMetaMask } from '@/lib/web3/useMetaMask';
import { BlockchainTransactionService } from '@/lib/web3/blockchainTransactionService';
import { publishPassport, type BatteryPassport } from '@/lib/api/passports';
import { AlertCircle, CheckCircle, Loader, Wallet, ArrowRight } from 'lucide-react';

interface PublishWithBlockchainDialogProps {
  passport: BatteryPassport;
  onSuccess?: (passport: BatteryPassport) => void;
  onCancel?: () => void;
}

export function PublishWithBlockchainDialog({
  passport,
  onSuccess,
  onCancel,
}: PublishWithBlockchainDialogProps) {
  const { account, connectWallet, isMetaMaskAvailable, isConnecting } = useMetaMask();
  const [step, setStep] = useState<'wallet' | 'confirm' | 'signing' | 'submitting' | 'success' | 'error'>('wallet');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConnectWallet = async () => {
    setError(null);
    const result = await connectWallet();
    if (result) {
      setStep('confirm');
    } else {
      setError('Failed to connect wallet. Please try again.');
      setStep('error');
    }
  };

  const handlePublishWithBlockchain = async () => {
    if (!account) {
      setError('Wallet not connected');
      setStep('error');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStep('signing');

    try {
      // Initialize blockchain service
      const blockchainService = new BlockchainTransactionService();

      // Generate data hash (same as backend)
      const dataHash = generatePassportHash(passport);

      console.log('Publishing passport with blockchain transaction...');
      console.log('Passport ID:', passport.passportId);
      console.log('Data Hash:', dataHash);
      console.log('Wallet:', account.address);

      setStep('signing');

      // Submit blockchain transaction (user signs with MetaMask)
      const { txHash: blockchainTx } = await blockchainService.submitPassportTransaction(
        passport.passportId,
        dataHash,
        account.address,
        'local'
      );

      console.log('Blockchain transaction submitted:', blockchainTx);
      setTxHash(blockchainTx);
      setStep('submitting');

      // Now publish on backend with blockchain transaction hash
      const updatedPassport = await publishPassport(passport.id, {
        walletAddress: account.address,
        blockchainTxHash: blockchainTx,
        isBlockchainPublish: true,
      });

      console.log('Passport published successfully:', updatedPassport);
      setStep('success');
      setIsProcessing(false);

      // Call success callback
      if (onSuccess) {
        setTimeout(() => onSuccess(updatedPassport), 2000);
      }
    } catch (err: any) {
      console.error('Publication error:', err);
      const errorMessage = err?.message || 'Failed to publish passport with blockchain';
      setError(errorMessage);
      setStep('error');
      setIsProcessing(false);
    }
  };

  if (!isMetaMaskAvailable) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">MetaMask Required</h2>
          </div>
          <p className="text-gray-600 mb-6">
            MetaMask wallet is not installed. Please install MetaMask to publish this passport on the blockchain.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors text-center"
            >
              Install MetaMask
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">Publish on Blockchain</h2>
          <p className="text-sm text-gray-600 mt-1">
            Passport: <span className="font-mono">{passport.passportId}</span>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'wallet' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Connect your MetaMask wallet to anchor this battery passport on the blockchain.
                </p>
              </div>
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-green-900">Wallet Connected</p>
                <p className="text-xs text-green-700 font-mono">
                  {account?.address.substring(0, 6)}...{account?.address.substring((account?.address.length || 0) - 4)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-900">Publication Details</p>
                <div className="space-y-1 text-xs text-gray-700">
                  <p>Passport ID: <span className="font-mono">{passport.passportId}</span></p>
                  <p>Status: {passport.status} → PUBLISHED</p>
                  <p>Storage Mode: Local</p>
                </div>
              </div>
              <button
                onClick={handlePublishWithBlockchain}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                {isProcessing ? 'Processing...' : 'Sign & Publish'}
              </button>
            </>
          )}

          {step === 'signing' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="animate-spin">
                <Loader className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Waiting for Signature</p>
                <p className="text-sm text-gray-600 mt-1">Please sign the transaction in MetaMask</p>
              </div>
            </div>
          )}

          {step === 'submitting' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="animate-spin">
                <Loader className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Submitting to Backend</p>
                <p className="text-sm text-gray-600 mt-1">Publishing passport...</p>
                {txHash && (
                  <p className="text-xs text-gray-500 font-mono mt-2">
                    {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
              <div className="text-center">
                <p className="font-medium text-gray-900">Published Successfully</p>
                <p className="text-sm text-gray-600 mt-1">Passport is now on the blockchain</p>
                {txHash && (
                  <p className="text-xs text-gray-500 font-mono mt-2 break-all">{txHash}</p>
                )}
              </div>
            </div>
          )}

          {step === 'error' && (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-900">{error}</p>
              </div>
              <button
                onClick={() => {
                  setStep('confirm');
                  setError(null);
                }}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-2">
          {step !== 'success' && (
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          {step === 'success' && (
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Generate data hash for passport (same logic as backend)
 */
function generatePassportHash(passport: BatteryPassport): string {
  // This should match the backend's computeDataHash function
  const crypto = require('crypto');
  const data = JSON.stringify({
    passportId: passport.passportId,
    serialNumber: passport.serialNumber,
    model: passport.model,
    chemistry: passport.chemistry,
    carbonFootprint: passport.carbonFootprintKgCo2eKwh,
    materialComposition: passport.materials,
  });
  return crypto.createHash('sha256').update(data).digest('hex');
}
