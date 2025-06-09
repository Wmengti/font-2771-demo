import { useEffect, useState } from 'react';
import { PaymentDelegate, TransferParams } from '../../dist';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Advanced() {
  const [address, setAddress] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formParams, setFormParams] = useState({
    tokenAddress: '0x540126734dee9B0e623c71c2a9ED44Ef4387A81F',
    to: '0xa8666442fA7583F783a169CC9F5449ec660295E8',
    amount: '50000000000000000000',
    gasFee: '1000100000000000000',
    seq: '',
    contractAddress: '0xA31a2dE4845e4fe869067618F2ABf0Cad279472F',
    publicKey: '0x7A135109F5aAC103045342237511ae658ecFc1A7'
  });

  // 在组件挂载时将PaymentDelegate挂载到window对象上
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.PaymentDelegate = PaymentDelegate;
      
      // 默认设置 seq 为 6小时后的时间戳
      setFormParams(prev => ({
        ...prev,
        seq: String(Math.floor((Date.now() + 6 * 60 * 60 * 1000) / 1000))
      }));
    }
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    try {
      const delegateConfig = { 
        useMetaMask: true,
        publicKey: formParams.publicKey,
        contractAddress: formParams.contractAddress
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProcessTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const delegateConfig = { 
        useMetaMask: true,
        publicKey: formParams.publicKey,
        contractAddress: formParams.contractAddress
      };
      
      const transferParams: TransferParams = {
        tokenAddress: formParams.tokenAddress,
        to: formParams.to,
        amount: BigInt(formParams.amount),
        gasFee: BigInt(formParams.gasFee),
        seq: BigInt(formParams.seq),
        contractAddress: formParams.contractAddress,
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
    <Layout title="支付委托演示 - 高级版">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>高级版演示</h1>
        
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

          <form onSubmit={handleProcessTransfer}>
            <div className="form-group">
              <label className="form-label">公钥</label>
              <input
                type="text"
                name="publicKey"
                className="form-input"
                value={formParams.publicKey}
                onChange={handleInputChange}
                placeholder="输入公钥地址"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">合约地址</label>
              <input
                type="text"
                name="contractAddress"
                className="form-input"
                value={formParams.contractAddress}
                onChange={handleInputChange}
                placeholder="输入合约地址"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">代币地址</label>
              <input
                type="text"
                name="tokenAddress"
                className="form-input"
                value={formParams.tokenAddress}
                onChange={handleInputChange}
                placeholder="输入代币合约地址，留空表示ETH"
              />
              <small style={{ color: '#888', fontSize: '12px' }}>留空表示使用ETH</small>
            </div>
            
            <div className="form-group">
              <label className="form-label">接收方地址</label>
              <input
                type="text"
                name="to"
                className="form-input"
                value={formParams.to}
                onChange={handleInputChange}
                placeholder="输入接收方地址"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">金额 (Wei)</label>
              <input
                type="text"
                name="amount"
                className="form-input"
                value={formParams.amount}
                onChange={handleInputChange}
                placeholder="输入金额，单位为Wei"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Gas费用 (Wei)</label>
              <input
                type="text"
                name="gasFee"
                className="form-input"
                value={formParams.gasFee}
                onChange={handleInputChange}
                placeholder="输入Gas费用，单位为Wei"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">序列号 (时间戳)</label>
              <input
                type="text"
                name="seq"
                className="form-input"
                value={formParams.seq}
                onChange={handleInputChange}
                placeholder="输入序列号，默认为6小时后的时间戳"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="btn btn-success"
              disabled={loading || !address}
              style={{ width: '100%' }}
            >
              {loading ? '处理中...' : '处理转账'}
            </button>
          </form>
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
            <li>根据需要修改表单中的转账参数</li>
            <li>点击"处理转账"按钮</li>
            <li>在MetaMask中确认签名请求</li>
            <li>签名成功后，页面将显示交易的结果</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
} 