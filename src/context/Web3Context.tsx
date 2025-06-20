import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Web3Delegate } from '../../dist';
import { rpc } from 'viem/utils';

interface Web3ContextProps {
  sdk: Web3Delegate | null;
  address: string;
  chainId: string;
  isConnecting: boolean;
  error: string;
  connectWallet: () => Promise<void>;
  resetError: () => void;
  config: any;
}

const Web3Context = createContext<Web3ContextProps>({
  sdk: null,
  address: '',
  chainId: '',
  isConnecting: false,
  error: '',
  connectWallet: async () => {},
  resetError: () => {},
  config: {},
});

export const useWeb3 = () => useContext(Web3Context);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  const [sdk, setSdk] = useState<Web3Delegate | null>(null);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // 这里请根据你的实际合约配置填写
  const config = {
    vaultContractAddress: '0x236dFEF2F00118d3A8Ddc9191B7Ed217a5318Ec9',
    paymentContractAddress: '0x7Eaa7EB537587AfC84eDfCDF8C624848bf9985F3',
    forwarderAddress: '0x1B2f0Ada16d1586273576668c39CACdC8abe72f3',
  };

  // 初始化 sdk
  useEffect(() => {
    try {
      const instance = new Web3Delegate(config);
      setSdk(instance);
    } catch (e: any) {
      setError('SDK初始化失败: ' + (e.message || String(e)));
    }
  }, []);

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (!sdk) {
      setError('SDK未初始化');
      return;
    }
    setIsConnecting(true);
    setError('');
    try {
      const addr = await sdk.connectWallet();
      setAddress(addr);
      // 获取链ID
      if (window.ethereum) {
        const chain = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(chain);
      }
    } catch (e: any) {
      setError('连接失败: ' + (e.message || String(e)));
    } finally {
      setIsConnecting(false);
    }
  }, [sdk]);

  // 监听账户/链切换
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts[0] || '');
    };
    const handleChainChanged = (chainId: string) => {
      setChainId(chainId);
      // 可选：自动断开/重连
      setAddress('');
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    // 初始化时获取当前链ID
    window.ethereum.request({ method: 'eth_chainId' }).then(setChainId).catch(() => {});
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const resetError = () => setError('');

  return (
    <Web3Context.Provider value={{ sdk, address, chainId, isConnecting, error, connectWallet, resetError, config }}>
      {children}
    </Web3Context.Provider>
  );
}; 