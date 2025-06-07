import { useEffect, useState } from 'react';
import { PaymentDelegate } from '../../dist';
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
  const [delegate, setDelegate] = useState<PaymentDelegate | null>(null);
  
  const [formParams, setFormParams] = useState({
    tokenAddress: '0x540126734dee9B0e623c71c2a9ED44Ef4387A81F',
    to: '0xa8666442fA7583F783a169CC9F5449ec660295E8',
    amount: '50000000000000000000', // 50 tokens
    spender: '0xB805f94b483bAB6658CA7164FBe02dcB5cA1D332', // 合约地址作为spender
    seq: '',
    deadlineSeconds: '3600' // 1小时过期时间
  });

  // 初始化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const paymentDelegate = new PaymentDelegate({ 
        useMetaMask: true,
        publicKey: '0x7A135109F5aAC103045342237511ae658ecFc1A7',
        contractAddress: '0xB805f94b483bAB6658CA7164FBe02dcB5cA1D332'
      });
      setDelegate(paymentDelegate);
      
      // 设置默认 seq 为当前时间戳
      setFormParams(prev => ({
        ...prev,
        seq: String(Math.floor(Date.now() / 1000))
      }));
    }
  }, []);

  const handleConnect = async () => {
    if (!delegate) return;
    
    setLoading(true);
    setError('');
    try {
      const addr = await delegate.connectWallet();
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

  const handleApprove = async () => {
    if (!delegate || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const txHash = await delegate.token.approveToken(
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
    if (!delegate || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const relayedData = await delegate.relayedPayment.preparePayment(
        formParams.to,
        BigInt(formParams.amount),
        formParams.tokenAddress,
        BigInt(formParams.seq),
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
    if (!delegate || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const allowance = await delegate.token.checkAllowance(
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
              placeholder="输入过期时间（秒），默认3600秒"
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

        <div style={{ marginTop: '40px' }}>
          <h3>使用说明:</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li>点击"连接钱包"按钮连接MetaMask</li>
            <li>填写代币地址、授权给的合约地址、接收方地址等信息</li>
            <li>点击"查询授权额度"查看当前授权情况</li>
            <li>点击"授权代币"进行代币授权（用户付gas费）</li>
            <li>点击"生成签名"创建Meta Transaction签名数据</li>
            <li>将签名数据发送给Relayer服务进行代付gas执行</li>
          </ol>
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '4px'
          }}>
            <strong>注意：</strong>Meta Transaction只生成签名数据，不执行实际交易。需要将签名数据发送给Relayer服务来代付gas费执行交易。
          </div>
        </div>
      </div>
    </Layout>
  );
} 