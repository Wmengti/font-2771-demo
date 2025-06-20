import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';

export default function DirectPayment() {
  const { sdk, address } = useWeb3();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [services, setServices] = useState<any>(null);
  
  const [formParams, setFormParams] = useState({
    tokenAddress: '0xc6AdC53079AC67aD9A03Cbd0978CB9aF63AdFda1',
    to: '0xa8666442fA7583F783a169CC9F5449ec660295E8',
    amount: '50000000000000000000', // 50 tokens
    spender: '0xA03337a0CFa75f2ED53b2b5cb5E5cF22819De6dA', // 合约地址作为spender
    seq: ''
  });

  // 初始化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // 导入需要的服务
        const { WalletService, TransactionService, BlockchainService } = require('../../dist');
        
        // 创建钱包服务
        const walletService = new WalletService({ useMetaMask: true });
        
        // 创建区块链服务
        const config = {
          useMetaMask: true,  // 确保设置为true
          publicKey: '0x7A135109F5aAC103045342237511ae658ecFc1A7',
          contractAddress: '0xA03337a0CFa75f2ED53b2b5cb5E5cF22819De6dA'
        };
        
        // 直接使用WalletService作为第一个参数
        const blockchainService = new BlockchainService(config);
        
        // 创建交易服务
        const txService = new TransactionService(blockchainService);
        
        // 保存服务实例
        setServices({
          walletService,
          blockchainService,
          txService
        });
        
        // 设置默认 seq 为当前时间戳
        setFormParams(prev => ({
          ...prev,
          seq: String(Math.floor(Date.now() / 1000))
        }));
      } catch (error) {
        console.error('初始化服务失败', error);
        setError(`初始化失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }, []);

  const handleConnect = async () => {
    if (!services?.walletService) return;
    
    setLoading(true);
    setError('');
    try {
      const addr = await services.walletService.connectWallet();
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

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleApprove = async () => {
    console.log('[直接支付] approveToken 参数:', formParams, 'address:', address);
    if (!sdk || !address) {
      alert('请先连接钱包');
      return;
    }
    if (!isValidAddress(formParams.tokenAddress)) {
      alert('代币地址不能为空且必须为42位0x开头的地址');
      return;
    }
    if (!isValidAddress(formParams.spender)) {
      alert('spender地址不能为空且必须为42位0x开头的地址');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const txHash = await services.txService.approveToken(
        formParams.tokenAddress,
        formParams.spender,
        BigInt(formParams.amount)
      );
      
      setResult({ type: 'approve', txHash });
      alert(`授权成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`授权失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    console.log('[直接支付] userPayDirect 参数:', formParams, 'address:', address);
    if (!sdk || !address) {
      alert('请先连接钱包');
      return;
    }
    if (!isValidAddress(formParams.tokenAddress)) {
      alert('代币地址不能为空且必须为42位0x开头的地址');
      return;
    }
    if (!isValidAddress(formParams.to)) {
      alert('接收方地址不能为空且必须为42位0x开头的地址');
      return;
    }
    if (!isValidAddress(formParams.spender)) {
      alert('spender地址不能为空且必须为42位0x开头的地址');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const txHash = await services.txService.userPayDirect(
        formParams.to,
        BigInt(formParams.amount),
        formParams.tokenAddress,
        BigInt(formParams.seq)
      );
      
      setResult({ type: 'payment', txHash });
      alert(`支付成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`支付失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAllowance = async () => {
    console.log('[直接支付] checkAllowance 参数:', formParams, 'address:', address);
    if (!sdk || !address) {
      alert('请先连接钱包');
      return;
    }
    if (!isValidAddress(formParams.tokenAddress)) {
      alert('代币地址不能为空且必须为42位0x开头的地址');
      return;
    }
    if (!isValidAddress(formParams.spender)) {
      alert('spender地址不能为空且必须为42位0x开头的地址');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const allowance = await services.txService.checkAllowance(
        formParams.tokenAddress,
        address,
        formParams.spender
      );
      
      setResult({ type: 'allowance', value: allowance.toString() });
    } catch (e: any) {
      console.error(e);
      setError(`查询失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="直接支付 - 用户付Gas">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>直接支付（用户付Gas）</h1>
        
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

          <div className="form-group">
            <label className="form-label">代币地址</label>
            <input
              type="text"
              name="tokenAddress"
              className="form-input"
              value={formParams.tokenAddress}
              onChange={handleInputChange}
              placeholder="输入代币合约地址"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">授权给（Spender）</label>
            <input
              type="text"
              name="spender"
              className="form-input"
              value={formParams.spender}
              onChange={handleInputChange}
              placeholder="输入要授权的合约地址"
              required
            />
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
            <label className="form-label">序列号</label>
            <input
              type="text"
              name="seq"
              className="form-input"
              value={formParams.seq}
              onChange={handleInputChange}
              placeholder="输入序列号"
              required
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              className="btn btn-secondary"
              onClick={checkAllowance}
              disabled={loading || !address}
              style={{ flex: 1 }}
            >
              查询授权额度
            </button>
            <button 
              className="btn btn-warning"
              onClick={handleApprove}
              disabled={loading || !address}
              style={{ flex: 1 }}
            >
              {loading ? '处理中...' : '授权代币'}
            </button>
            <button 
              className="btn btn-success"
              onClick={handlePay}
              disabled={loading || !address}
              style={{ flex: 1 }}
            >
              {loading ? '处理中...' : '直接支付'}
            </button>
          </div>
        </div>

        {result && (
          <div className="card" style={{ 
            backgroundColor: '#f0f5ff', 
            border: '1px solid #adc6ff'
          }}>
            <h3>操作结果:</h3>
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
            <li>填写代币地址、授权给的合约地址、接收方地址等信息</li>
            <li>点击"查询授权额度"查看当前授权情况</li>
            <li>点击"授权代币"进行代币授权（用户付gas费）</li>
            <li>点击"直接支付"进行转账支付（用户付gas费）</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
} 