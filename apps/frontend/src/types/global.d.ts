/**
 * Global browser type augmentations for MetaMask / EIP-1193 provider.
 * This extends the built-in Window interface so that `window.ethereum`
 * is recognised by TypeScript without installing a separate @types package.
 */

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  selectedAddress?: string | null;
  chainId?: string;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};
