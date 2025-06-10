import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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

enum PaymentTab {
  DirectPayment = 'direct',
  MetaTransaction = 'meta'
}

export default function Payment() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PaymentTab>(PaymentTab.DirectPayment);
  const [address, setAddress] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [services, setServices] = useState<any>(null);
  
  const [formParams, setFormParams] = useState({
    tokenAddress: '0x540126734dee9B0e623c71c2a9ED44Ef4387A81F',
    to: '0xa8666442fA7583F783a169CC9F5449ec660295E8',
    amount: '50000000000000000000', // 50 tokens
    spender: '0xB805f94b483bAB6658CA7164FBe02dcB5cA1D332', // 合约地址作为spender
    seq: String(Math.floor(Date.now() / 1000)),
    deadlineSeconds: '3600' // 1小时过期时间
  });

  // 从URL参数读取tab
  useEffect(() => {
    if (router.isReady) {
      const { tab } = router.query;
      if (tab === 'meta') {
        setActiveTab(PaymentTab.MetaTransaction);
      } else if (tab === 'direct') {
        setActiveTab(PaymentTab.DirectPayment);
      }
    }
  }, [router.isReady, router.query]);

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
          contractAddress: '0xB805f94b483bAB6658CA7164FBe02dcB5cA1D332'
        };
        
        // 创建区块链服务
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
    if (!services?.walletService) {
      setError('服务未初始化');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const addr = await services.walletService.connectWallet();
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

  const handleTabChange = (tab: PaymentTab) => {
    setActiveTab(tab);
    setResult(null); // 切换Tab时清空结果
  };

  const handleApprove = async () => {
    if (!services?.txService || !address) {
      setError('请先连接钱包');
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

  const handleDirectPay = async () => {
    if (!services?.txService || !address) {
      setError('请先连接钱包');
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
      
      setResult({ type: 'direct_payment', txHash });
      alert(`支付成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`支付失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareMetaTransaction = async () => {
    if (!services?.txService || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const relayedData = await services.txService.prepareRelayedPayment(
        formParams.to,
        BigInt(formParams.amount),
        formParams.tokenAddress,
        BigInt(formParams.seq),
        parseInt(formParams.deadlineSeconds)
      );
      
      setResult({ 
        type: 'meta_transaction', 
        data: relayedData 
      });
      alert('Meta Transaction签名成功！');
    } catch (e: any) {
      console.error(e);
      setError(`签名失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAllowance = async () => {
    if (!services?.txService || !address) {
      setError('请先连接钱包');
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
      alert(`当前授权额度: ${allowance.toString()} Wei`);
    } catch (e: any) {
      console.error(e);
      setError(`查询失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result && result.type === 'meta_transaction' && result.data) {
      navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
      alert('签名数据已复制到剪贴板！');
    }
  };

  return (
    <Layout title="支付操作">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>支付操作</h1>
        
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
              className="btn btn-secondary"
              onClick={checkAllowance}
              disabled={loading || !address}
            >
              查询授权额度
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

          {/* 选项卡切换 */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '1px solid #f0f0f0', 
            marginBottom: '20px' 
          }}>
            <div 
              onClick={() => handleTabChange(PaymentTab.DirectPayment)}
              style={{ 
                padding: '10px 20px', 
                cursor: 'pointer',
                borderBottom: activeTab === PaymentTab.DirectPayment ? '2px solid #1890ff' : 'none',
                color: activeTab === PaymentTab.DirectPayment ? '#1890ff' : 'inherit',
                fontWeight: activeTab === PaymentTab.DirectPayment ? 'bold' : 'normal'
              }}
            >
              直接支付（用户付Gas）
            </div>
            <div 
              onClick={() => handleTabChange(PaymentTab.MetaTransaction)}
              style={{ 
                padding: '10px 20px', 
                cursor: 'pointer',
                borderBottom: activeTab === PaymentTab.MetaTransaction ? '2px solid #1890ff' : 'none',
                color: activeTab === PaymentTab.MetaTransaction ? '#1890ff' : 'inherit',
                fontWeight: activeTab === PaymentTab.MetaTransaction ? 'bold' : 'normal'
              }}
            >
              Meta Transaction（代付Gas）
            </div>
          </div>

          {/* 通用表单字段 */}
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
              placeholder="输入序列号（可防止重放攻击）"
              required
            />
          </div>

          {/* Meta Transaction特有字段 */}
          {activeTab === PaymentTab.MetaTransaction && (
            <>
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
                <label className="form-label">过期时间（秒）</label>
                <input
                  type="text"
                  name="deadlineSeconds"
                  className="form-input"
                  value={formParams.deadlineSeconds}
                  onChange={handleInputChange}
                  placeholder="输入过期时间，单位为秒"
                  required
                />
              </div>
            </>
          )}

          {/* 直接支付操作按钮 */}
          {activeTab === PaymentTab.DirectPayment && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-success"
                onClick={handleDirectPay}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '执行支付'}
              </button>
            </div>
          )}

          {/* Meta Transaction操作按钮 */}
          {activeTab === PaymentTab.MetaTransaction && (
            <>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button 
                  className="btn btn-warning"
                  onClick={handleApprove}
                  disabled={loading || !address}
                  style={{ flex: 1 }}
                >
                  {loading ? '处理中...' : '授权代币'}
                </button>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handlePrepareMetaTransaction}
                  disabled={loading || !address}
                  style={{ flex: 1 }}
                >
                  {loading ? '处理中...' : '生成Meta Transaction'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="card" style={{ 
            backgroundColor: result.type === 'meta_transaction' ? '#f0f5ff' : '#f6ffed',
            border: result.type === 'meta_transaction' ? '1px solid #adc6ff' : '1px solid #b7eb8f',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>操作结果:</h3>
              {result.type === 'meta_transaction' && (
                <button 
                  className="btn btn-secondary"
                  onClick={copyToClipboard}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  复制数据
                </button>
              )}
            </div>
            {result.type === 'meta_transaction' ? (
              <div style={{ 
                backgroundColor: '#f5f5f5',
                padding: '15px',
                borderRadius: '4px',
                fontSize: '14px',
                overflow: 'auto'
              }}>
                <div style={{ marginBottom: '10px' }}><strong>from:</strong> {result.data.from}</div>
                <div style={{ marginBottom: '10px' }}><strong>to:</strong> {result.data.to}</div>
                <div style={{ marginBottom: '10px' }}><strong>value:</strong> {result.data.value}</div>
                <div style={{ marginBottom: '10px' }}><strong>gas:</strong> {result.data.gas}</div>
                <div style={{ marginBottom: '10px' }}><strong>nonce:</strong> {result.data.nonce}</div>
                <div style={{ marginBottom: '10px' }}><strong>deadline:</strong> {result.data.deadline}</div>
                <div style={{ marginBottom: '10px' }}><strong>data:</strong> <code>{result.data.data}</code></div>
                {result.data.signature && (
                  <div><strong>signature:</strong> <code>{result.data.signature}</code></div>
                )}
              </div>
            ) : (
              <pre style={{ 
                backgroundColor: '#f5f5f5',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}

        <div style={{ marginTop: '40px' }}>
          <h3>使用说明:</h3>
          <ol style={{ paddingLeft: '20px' }}>
            <li><strong>直接支付流程（用户付Gas）:</strong></li>
            <ul>
              <li>点击"连接钱包"按钮连接MetaMask</li>
              <li>填写支付信息（代币地址、接收方地址、金额和序列号）</li>
              <li>点击"执行支付"完成支付（需要支付Gas费）</li>
            </ul>
            
            <li><strong>Meta Transaction支付流程（代付Gas）:</strong></li>
            <ul>
              <li>点击"连接钱包"按钮连接MetaMask</li>
              <li>填写支付信息和授权信息</li>
              <li>点击"授权代币"授权ERC20代币使用权限给支付合约</li>
              <li>点击"生成Meta Transaction"创建支付签名数据</li>
              <li>点击"复制数据"复制签名结果</li>
              <li>将签名数据发送给中继器服务进行代付gas执行</li>
            </ul>
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