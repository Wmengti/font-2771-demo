import { useState } from 'react';
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

interface DepositParams {
  merchantId: string;
  tokenAddress: string;
  amount: string;
}

interface WithdrawParams {
  merchantId: string;
  tokenAddress: string;
  amount: string;
  deadlineSeconds: string;
}

interface ConsumeParams {
  merchantId: string;
  tokenAddress: string;
  amount: string;
  voucherId: string;
  pointToUse: string;
  seq: string;
  deadlineSeconds: string;
  recipient: string;
  idx: string;
}

// 工具函数：统一 merchantId 格式
function normalizeMerchantId(input: string, sdk: any) {
  if (input.startsWith('0x') && input.length === 66) {
    return input;
  }
  if (sdk?.merchantConfigManager?.stringToBytes32) {
    return sdk.merchantConfigManager.stringToBytes32(input);
  }
  let hex = '';
  try {
    hex = Buffer.from(input, 'utf8').toString('hex');
  } catch {
    hex = Array.from(input).map((c: string) => c.charCodeAt(0).toString(16)).join('');
  }
  return '0x' + hex.padEnd(64, '0');
}

export default function VaultOperations() {
  const { sdk, address } = useWeb3();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [services, setServices] = useState<any>(null);
  
  const [depositParams, setDepositParams] = useState<DepositParams>({
    merchantId: '0x00000000000000000000000000000000000000000000000000000063686c6f65',
    tokenAddress: '0xc6AdC53079AC67aD9A03Cbd0978CB9aF63AdFda1',
    amount: '1000000000000000000'
  });

  const [withdrawParams, setWithdrawParams] = useState<WithdrawParams>({
    merchantId: '0x00000000000000000000000000000000000000000000000000000063686c6f65',
    tokenAddress: '0xc6AdC53079AC67aD9A03Cbd0978CB9aF63AdFda1',
    amount: '1000000000000000000',
    deadlineSeconds: '3600'
  });

  const [consumeParams, setConsumeParams] = useState<ConsumeParams>({
    merchantId: '0x00000000000000000000000000000000000000000000000000000063686c6f65',
    tokenAddress: '0xc6AdC53079AC67aD9A03Cbd0978CB9aF63AdFda1',
    amount: '1000000000000000000',
    voucherId: '0',
    pointToUse: '0',
    seq: String(Math.floor(Date.now() / 1000)),
    deadlineSeconds: '3600',
    recipient: '',
    idx: '0'
  });

  // 初始化
  const handleConnect = async () => {
    if (!sdk) return;
    
    setLoading(true);
    setError('');
    try {
      const addr = await sdk.connectWallet();
    } catch (e: any) {
      console.error(e);
      setError(`连接失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 处理表单输入变化
  const handleDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDepositParams(prev => ({ ...prev, [name]: value }));
  };

  const handleWithdrawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWithdrawParams(prev => ({ ...prev, [name]: value }));
  };

  const handleConsumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConsumeParams(prev => ({ ...prev, [name]: value }));
  };

  // 存款前先授权
  const handleApproveForDeposit = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 授权给UnifiedVault合约
      const vaultAddress = '0x0dfe1ad373bfcc5b32d22d7da81cac97ef72d7da'; // UnifiedVault地址
      const txHash = await sdk.approveToken(
        depositParams.tokenAddress,
        vaultAddress,
        BigInt(depositParams.amount)
      );
      
      setResult({ type: 'approve_deposit', txHash });
      alert(`存款授权成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`授权失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 存款操作
  const handleDeposit = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const merchantId = normalizeMerchantId(depositParams.merchantId, sdk);
      const txHash = await sdk.depositToVault(
        merchantId,
        depositParams.tokenAddress,
        BigInt(depositParams.amount)
      );
      setResult({ type: 'deposit', txHash });
      alert(`存款成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`存款失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 提现操作
  const handleWithdraw = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const merchantId = normalizeMerchantId(withdrawParams.merchantId, sdk);
      const txHash = await sdk.withdrawFromVault(
        merchantId,
        withdrawParams.tokenAddress,
        BigInt(withdrawParams.amount)
      );
      setResult({ type: 'withdraw', txHash });
      alert(`提现成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`提现失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 直接消费（用户付gas）
  const handleConsumeDirect = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }
    if (!consumeParams.recipient) {
      setError('请输入收款地址');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const merchantId = normalizeMerchantId(consumeParams.merchantId, sdk);
      const txHash = await sdk.consumeFromVault(
        merchantId,
        consumeParams.tokenAddress,
        BigInt(consumeParams.amount),
        consumeParams.voucherId ? BigInt(consumeParams.voucherId) : 0n,
        consumeParams.pointToUse ? BigInt(consumeParams.pointToUse) : 0n,
        BigInt(consumeParams.idx),
        BigInt(consumeParams.seq),
        consumeParams.recipient
      );
      
      setResult({ type: 'consume_direct', txHash });
      alert(`消费成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`消费失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 消费前授权（如果需要）
  const handleApproveForConsume = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 授权给UnifiedVault合约
      const vaultAddress = '0x0dfe1ad373bfcc5b32d22d7da81cac97ef72d7da'; // UnifiedVault地址
      const txHash = await sdk.approveToken(
        consumeParams.tokenAddress,
        vaultAddress,
        BigInt(consumeParams.amount)
      );
      
      setResult({ type: 'approve_consume', txHash });
      alert(`消费授权成功！交易哈希: ${txHash}`);
    } catch (e: any) {
      console.error(e);
      setError(`授权失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 准备Meta存款（代付gas）
  const handlePrepareMetaDeposit = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const merchantId = normalizeMerchantId(depositParams.merchantId, sdk);
      const relayedData = await sdk.prepareRelayedDeposit(
        merchantId,
        depositParams.tokenAddress,
        BigInt(depositParams.amount),
        BigInt(3600)
      );
      setResult({ type: 'meta_deposit', data: relayedData });
      alert('Meta存款签名成功！');
    } catch (e: any) {
      console.error(e);
      setError(`签名失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 准备Meta提现（代付gas）
  const handlePrepareMetaWithdraw = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const merchantId = normalizeMerchantId(withdrawParams.merchantId, sdk);
      const relayedData = await sdk.prepareRelayedWithdraw(
        merchantId,
        withdrawParams.tokenAddress,
        BigInt(withdrawParams.amount),
        BigInt(withdrawParams.deadlineSeconds)
      );
      setResult({ type: 'meta_withdraw', data: relayedData });
      alert('Meta提现签名成功！');
    } catch (e: any) {
      console.error(e);
      setError(`签名失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 准备Meta消费（代付gas）
  const handlePrepareMetaConsume = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 参数校验与日志
      const merchantId = normalizeMerchantId(consumeParams.merchantId, sdk);
      const tokenAddress = consumeParams.tokenAddress;
      const amount = BigInt(consumeParams.amount);
      const voucherId = consumeParams.voucherId ? BigInt(consumeParams.voucherId) : 0n;
      const pointToUse = consumeParams.pointToUse ? BigInt(consumeParams.pointToUse) : 0n;
      const idx = consumeParams.idx ? BigInt(consumeParams.idx) : 0n;
      const seq = consumeParams.seq ? BigInt(consumeParams.seq) : undefined;
      const recipient = consumeParams.recipient;
      const deadlineSeconds = consumeParams.deadlineSeconds ? BigInt(consumeParams.deadlineSeconds) : 3600n;
      
      console.log('准备Meta消费请求:');
      console.log('商户ID:', merchantId);
      console.log('代币地址:', tokenAddress);
      console.log('金额:', amount.toString());
      console.log('代金券ID:', voucherId?.toString() || '无');
      console.log('使用积分:', pointToUse?.toString() || '无');
      console.log('促销档位编号idx:', idx.toString());
      console.log('序列号:', seq?.toString() || '无');
      console.log('收款地址:', recipient);
      console.log('过期时间(秒):', deadlineSeconds.toString());
      
      const relayedData = await sdk.prepareRelayedConsume(
        merchantId,
        tokenAddress,
        amount,
        voucherId,
        pointToUse,
        idx,
        seq,
        recipient,
        deadlineSeconds
      );
      
      setResult({ type: 'meta_consume', data: relayedData });
      alert('Meta消费签名成功！');
    } catch (e: any) {
      console.error(e);
      setError(`签名失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 查询金库余额
  const handleCheckVaultBalance = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const merchantId = normalizeMerchantId(depositParams.merchantId, sdk);
      const balance = await sdk.vault.getUserBalance(
        address,
        merchantId,
        depositParams.tokenAddress
      );
      setResult({ type: 'balance', value: balance.toString() });
      alert(`金库余额: ${balance.toString()} Wei`);
    } catch (e: any) {
      console.error(e);
      setError(`查询余额失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result && result.data) {
      navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
      alert('签名数据已复制到剪贴板！');
    }
  };

  return (
    <Layout title="金库操作 - Vault Operations">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>金库操作（Vault Operations）</h1>
        
        <div className="card">
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button 
              className="btn btn-secondary"
              onClick={handleCheckVaultBalance}
              disabled={loading || !address}
            >
              查询金库余额
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

          {/* 存款操作 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#f0f9ff' }}>
            <h3>存款操作</h3>
            <div className="form-group">
              <label className="form-label">商家ID</label>
              <input
                type="text"
                name="merchantId"
                className="form-input"
                value={depositParams.merchantId}
                onChange={handleDepositChange}
                placeholder="输入商家ID（bytes32）"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">代币地址</label>
              <input
                type="text"
                name="tokenAddress"
                className="form-input"
                value={depositParams.tokenAddress}
                onChange={handleDepositChange}
                placeholder="输入代币合约地址"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">存款金额 (Wei)</label>
              <input
                type="text"
                name="amount"
                className="form-input"
                value={depositParams.amount}
                onChange={handleDepositChange}
                placeholder="输入存款金额，单位为Wei"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button 
                className="btn btn-warning"
                onClick={handleApproveForDeposit}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '授权存款'}
              </button>
              <button 
                className="btn btn-success"
                onClick={handleDeposit}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '执行存款（用户付Gas）'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary"
                onClick={handlePrepareMetaDeposit}
                disabled={loading || !address}
                style={{ width: '100%' }}
              >
                {loading ? '处理中...' : '生成Meta Transaction存款'}
              </button>
            </div>
          </div>

          {/* 提现操作 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#fff7e6' }}>
            <h3>提现操作</h3>
            <div className="form-group">
              <label className="form-label">商家ID</label>
              <input
                type="text"
                name="merchantId"
                className="form-input"
                value={withdrawParams.merchantId}
                onChange={handleWithdrawChange}
                placeholder="输入商家ID（bytes32）"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">代币地址</label>
              <input
                type="text"
                name="tokenAddress"
                className="form-input"
                value={withdrawParams.tokenAddress}
                onChange={handleWithdrawChange}
                placeholder="输入代币合约地址"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">提现金额 (Wei)</label>
              <input
                type="text"
                name="amount"
                className="form-input"
                value={withdrawParams.amount}
                onChange={handleWithdrawChange}
                placeholder="输入提现金额，单位为Wei"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">过期时间（秒）- 仅Meta Transaction</label>
              <input
                type="text"
                name="deadlineSeconds"
                className="form-input"
                value={withdrawParams.deadlineSeconds}
                onChange={handleWithdrawChange}
                placeholder="输入过期时间（秒），默认3600秒"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button 
                className="btn btn-success"
                onClick={handleWithdraw}
                disabled={loading || !address}
                style={{ width: '100%' }}
              >
                {loading ? '处理中...' : '执行提现（用户付Gas）'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary"
                onClick={handlePrepareMetaWithdraw}
                disabled={loading || !address}
                style={{ width: '100%' }}
              >
                {loading ? '处理中...' : '生成Meta Transaction提现'}
              </button>
            </div>
          </div>

          {/* 消费操作 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#f6ffed' }}>
            <h3>消费操作</h3>
            <div className="form-group">
              <label className="form-label">商家ID</label>
              <input
                type="text"
                name="merchantId"
                className="form-input"
                value={consumeParams.merchantId}
                onChange={handleConsumeChange}
                placeholder="输入商家地址"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">代币地址</label>
              <input
                type="text"
                name="tokenAddress"
                className="form-input"
                value={consumeParams.tokenAddress}
                onChange={handleConsumeChange}
                placeholder="输入代币合约地址"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">消费金额 (Wei)</label>
              <input
                type="text"
                name="amount"
                className="form-input"
                value={consumeParams.amount}
                onChange={handleConsumeChange}
                placeholder="输入消费金额，单位为Wei"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">代金券ID（可选）</label>
              <input
                type="text"
                name="voucherId"
                className="form-input"
                value={consumeParams.voucherId}
                onChange={handleConsumeChange}
                placeholder="输入代金券ID，0表示不使用"
              />
            </div>
            <div className="form-group">
              <label className="form-label">使用积分（可选）</label>
              <input
                type="text"
                name="pointToUse"
                className="form-input"
                value={consumeParams.pointToUse}
                onChange={handleConsumeChange}
                placeholder="输入使用的积分，0表示不使用"
              />
            </div>
            <div className="form-group">
              <label className="form-label">序列号</label>
              <input
                type="text"
                name="seq"
                className="form-input"
                value={consumeParams.seq}
                onChange={handleConsumeChange}
                placeholder="输入序列号"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">过期时间（秒）- 仅Meta Transaction</label>
              <input
                type="text"
                name="deadlineSeconds"
                className="form-input"
                value={consumeParams.deadlineSeconds}
                onChange={handleConsumeChange}
                placeholder="输入过期时间（秒），默认3600秒"
              />
            </div>
            <div className="form-group">
              <label className="form-label">收款地址（recipient）</label>
              <input
                type="text"
                name="recipient"
                className="form-input"
                value={consumeParams.recipient}
                onChange={handleConsumeChange}
                placeholder="输入收款地址"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">促销档位编号（idx）</label>
              <input
                type="number"
                name="idx"
                className="form-input"
                value={consumeParams.idx}
                onChange={handleConsumeChange}
                placeholder="输入促销档位编号（如0、1、2）"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button 
                className="btn btn-success"
                onClick={handleConsumeDirect}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '直接消费（用户付Gas）'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-warning"
                onClick={handleApproveForConsume}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '授权（Meta Transaction）'}
              </button>
              <button 
                className="btn btn-primary"
                onClick={handlePrepareMetaConsume}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '生成Meta Transaction'}
              </button>
            </div>
          </div>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="card" style={{ 
            backgroundColor: result.type === 'meta_consume' ? '#f0f5ff' : '#f6ffed',
            border: result.type === 'meta_consume' ? '1px solid #adc6ff' : '1px solid #b7eb8f'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3>操作结果:</h3>
              {result.type === 'meta_consume' && (
                <button 
                  className="btn btn-secondary"
                  onClick={copyToClipboard}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  复制数据
                </button>
              )}
            </div>
            {result.type === 'meta_consume' ? (
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
            <li><strong>存款流程（用户付Gas）：</strong>先点击"授权存款"授权代币给金库合约，然后点击"执行存款"</li>
            <li><strong>存款流程（Meta Transaction）：</strong>先点击"授权存款"授权代币给金库合约，然后点击"生成Meta Transaction存款"创建签名数据</li>
            <li><strong>提现流程（用户付Gas）：</strong>直接点击"执行提现"从金库提取代币到钱包</li>
            <li><strong>提现流程（Meta Transaction）：</strong>点击"生成Meta Transaction提现"创建签名数据</li>
            <li><strong>直接消费：</strong>点击"直接消费"从金库余额中扣除并支付给商家（用户付gas）</li>
            <li><strong>Meta Transaction消费：</strong>先点击"授权"授权给Forwarder合约，然后点击"生成Meta Transaction"创建签名数据</li>
            <li><strong>查询余额：</strong>点击"查询金库余额"查看当前用户在金库中的代币余额</li>
            <li><strong>使用签名数据：</strong>生成Meta Transaction后，复制签名数据并粘贴到中继器服务页面进行执行</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
} 