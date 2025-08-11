import { useEffect, useState } from 'react';
import MetaMaskOnboarding from '@metamask/onboarding';
import { detectEthereumProvider } from '@metamask/detect-provider';

interface Web3LoginProps {
  onLogin: (address: string) => void;
}

const Web3Login = ({ onLogin }: Web3LoginProps) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onboarding = new MetaMaskOnboarding();

  useEffect(() => {
    const checkMetaMask = async () => {
      const provider = await detectEthereumProvider();
      setIsMetaMaskInstalled(!!provider);
    };
    checkMetaMask();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    
    try {
      // Request account access
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        // Switch to Monad testnet
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '10143', // Monad testnet chain ID (replace with actual)
              chainName: 'Monad Testnet',
              nativeCurrency: {
                name: 'Monad',
                symbol: 'MONAD',
                decimals: 18
              },
              rpcUrls: ['https://testnet-rpc.monad.xyz'], // Replace with actual RPC
              blockExplorerUrls: ['https://testnet-explorer.monad.xyz'] // Replace
            }]
          });
        } catch (switchError) {
          console.error('Failed to switch to Monad testnet:', switchError);
          // Continue even if network switch fails - user might be on correct network
        }
        
        onLogin(accounts[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleInstallMetaMask = () => {
    onboarding.startOnboarding();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">Dungeon Crawler</h1>
      
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Connect Wallet</h2>
        <p className="mb-6">Connect with MetaMask to play using your wallet address as your player name.</p>
        
        {error && (
          <div className="mb-4 p-2 bg-red-700 text-white rounded text-sm">
            {error}
          </div>
        )}
        
        {isMetaMaskInstalled ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className={`w-full py-3 rounded-lg font-bold text-lg transition-colors ${
              isConnecting ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
          </button>
        ) : (
          <button
            onClick={handleInstallMetaMask}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold text-lg transition-colors"
          >
            Install MetaMask
          </button>
        )}
        
        <div className="mt-6 text-sm text-gray-400">
          <p>We'll use your wallet address as your in-game name.</p>
          <p className="mt-2">Make sure you're connected to Monad Testnet.</p>
        </div>
      </div>
    </div>
  );
};

export default Web3Login;