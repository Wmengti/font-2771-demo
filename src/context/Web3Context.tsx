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
  setConfig: (cfg: any) => void;
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
  setConfig: () => {},
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

  // config 支持从 localStorage 读取和保存
  const [config, setConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('delegate_config');
      if (saved) return JSON.parse(saved);
    }
    return {}; // 清除默认配置，改为空对象
  });

  // config 变化时自动重建 sdk
  useEffect(() => {
    try {
      const instance = new Web3Delegate(config);
      setSdk(instance);
    } catch (e: any) {
      setError('SDK初始化失败: ' + (e.message || String(e)));
    }
  }, [config]);

  // config 变化时自动保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('delegate_config', JSON.stringify(config));
    }
  }, [config]);

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
      setAddress('');
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.request({ method: 'eth_chainId' }).then(setChainId).catch(() => {});
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const resetError = () => setError('');

  return (
    <Web3Context.Provider value={{ sdk, address, chainId, isConnecting, error, connectWallet, resetError, config, setConfig }}>
      {children}
    </Web3Context.Provider>
  );
}; 