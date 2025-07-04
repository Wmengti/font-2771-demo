import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';

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
  const { sdk, address, isConnecting, error, connectWallet } = useWeb3();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [allowanceStatus, setAllowanceStatus] = useState({ checked: false, sufficient: false, value: '0' });
  const [formParams, setFormParams] = useState({
    tokenAddress: '',
    to: '',
    amount: '',
    spender: '',
    seq: String(Math.floor(Date.now() / 1000)),
    deadlineSeconds: '1850297516'
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

  const isValidAddress = (addr: string) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const checkAllowance = async () => {
    console.log('[支付] checkAllowance 参数:', formParams, 'address:', address);
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
    try {
      const allowance = await sdk.checkAllowance(
        formParams.tokenAddress,
        address,
        formParams.spender
      );
      const allowanceStr = allowance.toString();
      const isAllowanceSufficient = BigInt(allowanceStr) >= BigInt(formParams.amount);
      setAllowanceStatus({ checked: true, sufficient: isAllowanceSufficient, value: allowanceStr });
      setResult({ type: 'allowance', value: allowanceStr });
      alert(`当前授权额度: ${allowanceStr} Wei${isAllowanceSufficient ? '，授权充足' : '，授权不足，请先授权'}`);
      return isAllowanceSufficient;
    } catch (e: any) {
      alert(`查询失败: ${e.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDirectPay = async () => {
    console.log('[支付] userPayDirect 参数:', formParams, 'address:', address);
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
    try {
      // 先检查授权额度
      const isAllowanceSufficient = await checkAllowance();
      if (!isAllowanceSufficient) {
        // 如果授权不足，提示用户先授权
        if (confirm('授权额度不足，需要先进行授权操作。点击确定进行授权。')) {
          try {
            const txHash = await sdk.approveToken(
              formParams.tokenAddress,
              formParams.spender,
              BigInt(formParams.amount)
            );
            alert(`授权成功！交易哈希: ${txHash}，请等待授权交易确认后再进行支付。`);
            setResult({ type: 'approve', txHash });
            setAllowanceStatus({
              checked: true,
              sufficient: true,
              value: formParams.amount
            });
            setLoading(false);
            return;
          } catch (e: any) {
            alert(`授权失败: ${e.message}`);
            setLoading(false);
            return;
          }
        } else {
          setLoading(false);
          return;
        }
      }
      // 授权充足，继续支付
      const txHash = await sdk.userPayDirect(
        formParams.to,
        BigInt(formParams.amount),
        formParams.tokenAddress,
        BigInt(formParams.seq)
      );
      setResult({ type: 'direct_payment', txHash });
      alert(`支付成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      alert(`支付失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    console.log('[支付] approveToken 参数:', formParams, 'address:', address);
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
    try {
      const txHash = await sdk.approveToken(
        formParams.tokenAddress,
        formParams.spender,
        BigInt(formParams.amount)
      );
      setResult({ type: 'approve', txHash });
      alert(`授权成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      alert(`授权失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareMetaTransaction = async () => {
    console.log('[MetaTx] prepareRelayedPayment 参数:', formParams, 'address:', address);
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
    setLoading(true);
    try {
      // 参数校验与日志
      const to = formParams.to;
      const amount = BigInt(formParams.amount);
      const tokenAddress = formParams.tokenAddress;
      const seq = BigInt(formParams.seq);
      const deadline = parseInt(formParams.deadlineSeconds);
      if (!to.startsWith('0x') || to.length !== 42) throw new Error('接收方地址格式错误');
      if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) throw new Error('代币地址格式错误');
      if (amount <= 0n) throw new Error('金额必须大于0');
      if (seq <= 0n) throw new Error('序列号必须大于0');
      if (isNaN(deadline) || deadline <= 0) throw new Error('过期时间必须为正整数');
      console.log('前端准备代付gas支付请求:');
      console.log('接收方:', to);
      console.log('金额:', amount.toString());
      console.log('代币地址:', tokenAddress);
      console.log('序列号:', seq.toString());
      console.log('过期时间(秒):', deadline);
      const relayedData = await sdk.prepareRelayedPayment(
        to,
        amount,
        seq,
        tokenAddress,
        BigInt(deadline)
      );
      setResult({ 
        type: 'meta_transaction', 
        data: relayedData 
      });
      alert('Meta Transaction签名成功！');
    } catch (e: any) {
      alert(`签名失败: ${e.message}`);
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
              {(error.includes('MetaMask') || error.includes('连接') || error.includes('超时')) && (
                <div style={{ marginTop: '10px' }}>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      // 重置MetaMask状态并刷新页面
                      if (window.ethereum) {
                        try {
                          console.log('正在重置MetaMask连接状态...');
                          window.localStorage.removeItem('WALLET_CONNECT');
                          window.localStorage.removeItem('WALLET_CONNECTED');
                          window.location.reload();
                        } catch (e) {
                          console.error('重置失败:', e);
                          window.location.reload(); // 无论如何都刷新页面
                        }
                      } else {
                        window.location.reload();
                      }
                    }}
                    style={{ width: '100%', fontSize: '14px' }}
                  >
                    重置MetaMask状态并刷新页面
                  </button>
                </div>
              )}
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
            <div>
              <div style={{ 
                padding: '10px',
                marginBottom: '15px',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                <p style={{ margin: '0' }}>
                  <strong>提示：</strong> 在支付前会自动检查授权额度，如果授权不足会提示您进行授权操作。
                </p>
              </div>
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