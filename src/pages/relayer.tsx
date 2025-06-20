import { useState, useEffect } from 'react';
import { RelayerService, OperationType } from '../../dist';
import { SimpleRelayerRequest } from '../../dist/core/relayer-service';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';

interface RelayerParams {
  requestData: string;
  operationType: OperationType;
}

export default function Relayer() {
  const { address, config } = useWeb3();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [relayerService, setRelayerService] = useState<RelayerService | null>(null);
  const [relayerParams, setRelayerParams] = useState<RelayerParams>({
    requestData: '',
    operationType: OperationType.Payment
  });

  // 自动初始化 relayerService
  useEffect(() => {
    if (address) {
      setRelayerService(new RelayerService(config));
    } else {
      setRelayerService(null);
    }
  }, [address, config]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRelayerParams({
      ...relayerParams,
      requestData: e.target.value
    });
  };

  const handleOperationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRelayerParams({
      ...relayerParams,
      operationType: e.target.value as OperationType
    });
  };

  const handleSubmitRequest = async () => {
    if (!relayerService || !address) {
      setError('请先连接钱包');
      return;
    }

    if (!relayerParams.requestData) {
      setError('请输入请求数据');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 解析JSON数据
      const jsonData = JSON.parse(relayerParams.requestData);
      
      // 增强验证必要字段，确保地址字段有效
      if (!jsonData.from || !jsonData.to || !jsonData.data || !jsonData.signature) {
        throw new Error('请求数据缺少必要字段');
      }
      
      // 验证地址字段格式
      if (typeof jsonData.from !== 'string' || !jsonData.from.startsWith('0x') || jsonData.from.length !== 42) {
        throw new Error('发送方地址格式无效');
      }
      
      if (typeof jsonData.to !== 'string' || !jsonData.to.startsWith('0x') || jsonData.to.length !== 42) {
        throw new Error('接收方地址格式无效');
      }
      
      // 确保数值字段存在且格式正确
      if (!jsonData.nonce || isNaN(Number(jsonData.nonce))) {
        throw new Error('序列号(nonce)格式无效');
      }
      
      if (!jsonData.deadline || isNaN(Number(jsonData.deadline))) {
        throw new Error('截止时间(deadline)格式无效');
      }
      
      // 创建符合SimpleRelayerRequest接口的对象
      const requestData: SimpleRelayerRequest = {
        from: jsonData.from,
        to: jsonData.to,
        gas: jsonData.gas || '3000000',
        value: jsonData.value || '0',
        deadline: jsonData.deadline,
        signature: jsonData.signature,
        data: jsonData.data
      };

      console.log('发送中继器请求:', requestData);
      console.log('操作类型:', relayerParams.operationType);
      
      // 执行中继请求，使用sendSimpleRequest方法
      const result = await relayerService.sendSimpleRequest(
        relayerParams.operationType,
        requestData
      );
      
      if (!result.success) {
        throw new Error(result.error || '交易失败');
      }
      
      setResult({
        type: 'relay_transaction',
        operationType: relayerParams.operationType,
        txHash: result.txHash,
        request: jsonData // 保留原始数据用于显示
      });
      
      alert(`交易已提交，交易哈希: ${result.txHash}`);
    } catch (e: any) {
      console.error('中继器请求错误:', e);
      setError(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRelayerParams({
        ...relayerParams,
        requestData: text
      });
    } catch (e: any) {
      setError(`从剪贴板粘贴失败: ${e.message}`);
    }
  };

  const clearForm = () => {
    setRelayerParams({
      ...relayerParams,
      requestData: ''
    });
    setResult(null);
  };

  return (
    <Layout title="中继器服务">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>中继器服务</h1>
        
        <div className="card">
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

          <div className="card" style={{ margin: '20px 0', backgroundColor: '#f0f9ff' }}>
            <h3>请求数据</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                操作类型：
              </label>
              <select 
                value={relayerParams.operationType}
                onChange={handleOperationTypeChange}
                className="form-input"
                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
              >
                <option value={OperationType.Payment}>支付操作 (Payment)</option>
                <option value={OperationType.Consume}>消费操作 (Consume)</option>
                <option value={OperationType.Deposit}>存款操作 (Deposit)</option>
                <option value={OperationType.Withdraw}>提款操作 (Withdraw)</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <button 
                className="btn btn-secondary"
                onClick={pasteFromClipboard}
                style={{ flex: 1 }}
              >
                从剪贴板粘贴
              </button>
              <button 
                className="btn btn-warning"
                onClick={clearForm}
                style={{ flex: 1 }}
              >
                清空表单
              </button>
            </div>
            <div className="form-group">
              <textarea
                className="form-input"
                value={relayerParams.requestData}
                onChange={handleTextareaChange}
                placeholder="粘贴Meta Transaction请求数据（JSON格式）"
                style={{ 
                  height: '200px', 
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}
              />
            </div>
            <button 
              className="btn btn-success"
              onClick={handleSubmitRequest}
              disabled={loading || !address}
              style={{ width: '100%' }}
            >
              {loading ? '处理中...' : '提交请求'}
            </button>
          </div>

          <div className="card" style={{ margin: '20px 0', backgroundColor: '#fff7e6' }}>
            <h3>请求数据格式说明</h3>
            <pre style={{ 
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
{`{
  "from": "0x...",  // 发送方地址
  "to": "0x...",    // 接收方地址
  "value": "0",     // 发送的ETH数量（通常为0）
  "gas": "1000000", // Gas限制
  "nonce": "123",   // 序列号
  "deadline": "1234567890", // 过期时间
  "data": "0x...",  // 调用数据
  "signature": "0x..." // EIP-712签名
}`}
            </pre>
            <p style={{ marginTop: '10px' }}>
              <strong>操作类型说明：</strong>
            </p>
            <ul>
              <li><strong>Payment</strong>: 支付操作 - 从用户钱包直接支付到接收方地址</li>
              <li><strong>Consume</strong>: 消费操作 - 使用金库中的代币进行消费</li>
              <li><strong>Deposit</strong>: 存款操作 - 向金库中存入代币</li>
              <li><strong>Withdraw</strong>: 提款操作 - 从金库中提取代币</li>
            </ul>
          </div>
        </div>

        {result && (
          <div className="card" style={{ 
            backgroundColor: '#f0f5ff', 
            border: '1px solid #adc6ff',
            overflow: 'auto'
          }}>
            <h3>交易结果:</h3>
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
            <li>点击"连接钱包"按钮连接MetaMask（需要是中继器操作员）</li>
            <li>选择合适的操作类型（支付、消费、存款或提款）</li>
            <li>从Meta Transaction页面复制签名数据</li>
            <li>点击"从剪贴板粘贴"按钮或手动粘贴到文本框</li>
            <li>点击"提交请求"按钮发送交易</li>
            <li>在MetaMask中确认交易（中继器将支付gas费）</li>
          </ol>
          <div style={{ 
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff7e6',
            border: '1px solid #ffd591',
            borderRadius: '4px'
          }}>
            <strong>注意：</strong>只有授权的中继器操作员才能执行这些请求。请确保您的钱包地址已被授权为中继器操作员。
          </div>
        </div>
      </div>
    </Layout>
  );
} 