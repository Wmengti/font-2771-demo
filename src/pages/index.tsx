import { useEffect, useState } from 'react';
import { PaymentDelegate, TransferParams } from '../../dist';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home() {
  const [address, setAddress] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 在组件挂载时将PaymentDelegate挂载到window对象上
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.PaymentDelegate = PaymentDelegate;
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const delegateConfig = { 
        useMetaMask: true,
        publicKey: '0x7A135109F5aAC103045342237511ae658ecFc1A7',
        contractAddress: '0xA31a2dE4845e4fe869067618F2ABf0Cad279472F'
      };
      const paymentDelegate = new PaymentDelegate(delegateConfig);
      const addr = await paymentDelegate.connectWallet();
      setAddress(addr);
    } catch (e: any) {
      console.error(e);
      setError(`连接失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessTransfer = async () => {
    if (!address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const delegateConfig = { 
        useMetaMask: true,
        publicKey: '0x7A135109F5aAC103045342237511ae658ecFc1A7',
        contractAddress: '0xA31a2dE4845e4fe869067618F2ABf0Cad279472F'
      };
      const transferParams: TransferParams = {
        tokenAddress: '0x7A135109F5aAC103045342237511ae658ecFc1A7',
        to: '0xA31a2dE4845e4fe869067618F2ABf0Cad279472F',
        amount: BigInt('50000000000000000000'),
        gasFee: BigInt('1000100000000000000'),
        seq: BigInt(Math.floor((Date.now() + 6 * 60 * 60 * 1000) / 1000))
      };
      
      const paymentDelegate = new PaymentDelegate(delegateConfig);
      const res = await paymentDelegate.processTransfer(transferParams);
      setResult(res);
      alert('MetaTx已处理！');
    } catch (e: any) {
      console.error(e);
      setError(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="支付委托演示 - 基础版">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>基础版演示</h1>
        
        <div className="card">
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button 
              className="btn btn-primary"
              onClick={handleConnect} 
              disabled={loading}
              style={{ marginRight: '10px' }}
            >
              {loading ? '处理中...' : '连接钱包'}
            </button>

            <button 
              className="btn btn-success"
              onClick={handleProcessTransfer} 
              disabled={loading || !address}
            >
              {loading ? '处理中...' : '处理转账'}
            </button>
          </div>

          {address && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#f6ffed', 
              border: '1px solid #b7eb8f',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0' }}>已连接: {address}</p>
            </div>
          )}

          {error && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#fff2f0', 
              border: '1px solid #ffccc7',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0', color: '#f5222d' }}>{error}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="card" style={{ 
            backgroundColor: '#f0f5ff', 
            border: '1px solid #adc6ff',
            overflow: 'auto'
          }}>
            <h3>处理结果:</h3>
            <pre style={{ 
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ marginTop: '40px' }}>
          <h3>使用说明:</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li>点击"连接钱包"按钮连接MetaMask</li>
            <li>连接成功后，点击"处理转账"按钮</li>
            <li>在MetaMask中确认签名请求</li>
            <li>签名成功后，页面将显示交易的结果</li>
          </ol>
          <p style={{ marginTop: '10px' }}>
            如需自定义转账参数，请<Link href="/advanced">前往高级版</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
} 