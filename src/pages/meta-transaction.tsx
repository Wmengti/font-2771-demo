import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

// 定义RelayedRequestData类型
interface RelayedRequestData {
  from: string;
  to: string;
  value: string;
  gas: string;
  nonce: string;
  deadline: string;
  data: string;
  signature?: string;
}

export default function MetaTransaction() {
  const [address, setAddress] = useState<string>('');
  const [result, setResult] = useState<RelayedRequestData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [services, setServices] = useState<any>(null);
  
  const [formParams, setFormParams] = useState({
    tokenAddress: '0xc6AdC53079AC67aD9A03Cbd0978CB9aF63AdFda1',
    to: '0xa8666442fA7583F783a169CC9F5449ec660295E8',
    amount: '50000000000000000000', // 50 tokens
    spender: '0xA03337a0CFa75f2ED53b2b5cb5E5cF22819De6dA', // 合约地址作为spender
    seq: '',
    deadlineSeconds: '1850297516' // 1小时过期时间
  });

  // 初始化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // 导入需要的服务
        const { WalletService, TransactionService, BlockchainService } = require('../../dist');
        
        // 创建区块链服务
        const config = {
    
        };
        
        // 创建服务实例
        const blockchainService = new BlockchainService(config);
        const txService = new TransactionService(blockchainService);
        
        // 保存服务实例
        setServices({
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
    if (!services?.blockchainService) return;
    
    setLoading(true);
    setError('');
    try {
      const addr = await services.blockchainService.connectWallet();
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

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const handleApprove = async () => {
    console.log('[MetaTx] approveToken 参数:', formParams, 'address:', address);
    if (!services?.txService || !address) {
      setError('请先连接钱包');
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
      
      alert(`授权成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`授权失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareMetaTransaction = async () => {
    console.log('[MetaTx] prepareRelayedPayment 参数:', formParams, 'address:', address);
    if (!services?.txService || !address) {
      setError('请先连接钱包');
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

    setLoading(true);
    setError('');
    try {
      const relayedData = await services.txService.prepareRelayedPayment(
        formParams.to,
        BigInt(formParams.amount),
        BigInt(formParams.seq),
        formParams.tokenAddress,
        parseInt(formParams.deadlineSeconds)
      );
      
      setResult(relayedData);
      alert('Meta Transaction签名成功！');
    } catch (e: any) {
      console.error(e);
      setError(`签名失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAllowance = async () => {
    console.log('[MetaTx] checkAllowance 参数:', formParams, 'address:', address);
    if (!services?.txService || !address) {
      setError('请先连接钱包');
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
      
      alert(`当前授权额度: ${allowance.toString()} Wei`);
    } catch (e: any) {
      console.error(e);
      setError(`查询失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      alert('签名数据已复制到剪贴板！');
    }
  };

  return (
    <Layout title="Meta Transaction - 代付Gas签名">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Meta Transaction（代付Gas签名）</h1>
        
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
          
          <div className="form-group">
            <label className="form-label">过期时间（秒）</label>
            <input
              type="text"
              name="deadlineSeconds"
              className="form-input"
              value={formParams.deadlineSeconds}
              onChange={handleInputChange}
              placeholder="输入过期时间（秒），默认1850297516秒"
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
              onClick={handlePrepareMetaTransaction}
              disabled={loading || !address}
              style={{ flex: 1 }}
            >
              {loading ? '处理中...' : '生成签名'}
            </button>
          </div>
        </div>

        {result && (
          <div className="card" style={{ 
            backgroundColor: '#f0f5ff', 
            border: '1px solid #adc6ff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>Meta Transaction签名数据:</h3>
              <button 
                className="btn btn-secondary"
                onClick={copyToClipboard}
                style={{ fontSize: '12px', padding: '5px 10px' }}
              >
                复制数据
              </button>
            </div>
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '15px',
              borderRadius: '4px',
              fontSize: '14px',
              overflow: 'auto'
            }}>
              <div style={{ marginBottom: '10px' }}><strong>from:</strong> {result.from}</div>
              <div style={{ marginBottom: '10px' }}><strong>to:</strong> {result.to}</div>
              <div style={{ marginBottom: '10px' }}><strong>value:</strong> {result.value}</div>
              <div style={{ marginBottom: '10px' }}><strong>gas:</strong> {result.gas}</div>
              <div style={{ marginBottom: '10px' }}><strong>nonce:</strong> {result.nonce}</div>
              <div style={{ marginBottom: '10px' }}><strong>deadline:</strong> {result.deadline}</div>
              <div style={{ marginBottom: '10px' }}><strong>data:</strong> <code>{result.data}</code></div>
              {result.signature && (
                <div><strong>signature:</strong> <code>{result.signature}</code></div>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px' }}>
          <h3>使用说明:</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li>点击"连接钱包"按钮连接MetaMask</li>
            <li>输入交易信息并点击"授权代币"按钮授权</li>
            <li>点击"生成Meta Transaction"按钮创建交易</li>
            <li>将签名数据发送给中继器服务进行代付gas执行</li>
          </ol>
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '4px'
          }}>
            <strong>注意：</strong>Meta Transaction只生成签名数据，不执行实际交易。需要将签名数据发送给中继器服务来代付gas费执行交易。
          </div>
        </div>
      </div>
    </Layout>
  );
} 