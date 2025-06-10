import { useEffect, useState } from 'react';
import { MerchantManager } from '../../dist';
import Layout from '../components/Layout';

interface MerchantParams {
  merchantName: string;
  merchantId: string;
  operatorAddress: string;
  paymentAddress: string;
}

export default function MerchantManagement() {
  const [address, setAddress] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [merchantManager, setMerchantManager] = useState<MerchantManager | null>(null);
  const [merchantParams, setMerchantParams] = useState<MerchantParams>({
    merchantName: '',
    merchantId: '',
    operatorAddress: '',
    paymentAddress: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initMerchantManager = async () => {
        try {
          const config = { 
            useMetaMask: true,
            publicKey: '0x7A135109F5aAC103045342237511ae658ecFc1A7',
            contractAddress: '0x9fAb129F2a9CC1756772B73797ec4F37B86Ffc14'
          };
          const manager = new MerchantManager(config);
          setMerchantManager(manager);
        } catch (e) {
          console.error('初始化MerchantManager失败', e);
        }
      };
      
      initMerchantManager();
    }
  }, []);

  const handleConnect = async () => {
    if (!merchantManager) return;
    
    setLoading(true);
    setError('');
    try {
      const addr = await merchantManager.connectWallet();
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
    setMerchantParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateMerchantId = () => {
    if (!merchantManager || !merchantParams.merchantName) {
      setError('请先输入商家名称');
      return;
    }
    
    try {
      const id = merchantManager.generateMerchantId(merchantParams.merchantName);
      setMerchantParams(prev => ({
        ...prev,
        merchantId: id
      }));
      setResult({ type: 'generate_id', id });
    } catch (e: any) {
      console.error(e);
      setError(`生成ID失败: ${e.message}`);
    }
  };

  const handleAddOperator = async () => {
    if (!merchantManager || !address) {
      setError('请先连接钱包');
      return;
    }

    if (!merchantParams.merchantId || !merchantParams.operatorAddress) {
      setError('请输入商家ID和操作员地址');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await merchantManager.addOperator(
        merchantParams.merchantId,
        merchantParams.operatorAddress
      );
      
      setResult({ type: 'add_operator', result });
      if (result.success) {
        alert('添加操作员成功！');
      } else {
        setError(`添加操作员失败: ${result.message}`);
      }
    } catch (e: any) {
      console.error(e);
      setError(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPaymentAddress = async () => {
    if (!merchantManager || !address) {
      setError('请先连接钱包');
      return;
    }

    if (!merchantParams.merchantId || !merchantParams.paymentAddress) {
      setError('请输入商家ID和收款地址');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await merchantManager.setMerchantAddress(
        merchantParams.merchantId,
        merchantParams.paymentAddress
      );
      
      setResult({ type: 'set_payment_address', result });
      if (result.success) {
        alert('设置收款地址成功！');
      } else {
        setError(`设置收款地址失败: ${result.message}`);
      }
    } catch (e: any) {
      console.error(e);
      setError(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkOperatorPermission = async () => {
    if (!merchantManager || !address) {
      setError('请先连接钱包');
      return;
    }

    if (!merchantParams.merchantId || !merchantParams.operatorAddress) {
      setError('请输入商家ID和操作员地址');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await merchantManager.checkOperatorPermission(
        merchantParams.merchantId,
        merchantParams.operatorAddress
      );
      
      setResult({ type: 'check_permission', result });
      alert(`检查结果: ${result.success ? '有权限' : '无权限'}`);
    } catch (e: any) {
      console.error(e);
      setError(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkMerchantAddress = async () => {
    if (!merchantManager || !address) {
      setError('请先连接钱包');
      return;
    }

    if (!merchantParams.merchantId) {
      setError('请输入商家ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await merchantManager.checkMerchantAddress(
        merchantParams.merchantId
      );
      
      setResult({ type: 'check_address', result });
      if (result.success) {
        alert(`商家收款地址: ${result.data}`);
      } else {
        setError(`查询收款地址失败: ${result.message}`);
      }
    } catch (e: any) {
      console.error(e);
      setError(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="商家管理">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>商家管理</h1>
        
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

          {/* 商家ID生成 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#f0f9ff' }}>
            <h3>商家ID生成</h3>
            <div className="form-group">
              <label className="form-label">商家名称</label>
              <input
                type="text"
                name="merchantName"
                className="form-input"
                value={merchantParams.merchantName}
                onChange={handleInputChange}
                placeholder="输入商家名称"
              />
            </div>
            <button 
              className="btn btn-primary"
              onClick={generateMerchantId}
              style={{ width: '100%' }}
            >
              生成商家ID
            </button>
            {merchantParams.merchantId && (
              <div style={{ 
                marginTop: '10px', 
                padding: '10px', 
                backgroundColor: '#f6ffed', 
                border: '1px solid #b7eb8f',
                borderRadius: '4px'
              }}>
                <p style={{ margin: '0' }}>生成的商家ID: {merchantParams.merchantId}</p>
              </div>
            )}
          </div>

          {/* 操作员管理 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#fff7e6' }}>
            <h3>操作员管理</h3>
            <div className="form-group">
              <label className="form-label">商家ID</label>
              <input
                type="text"
                name="merchantId"
                className="form-input"
                value={merchantParams.merchantId}
                onChange={handleInputChange}
                placeholder="输入商家ID"
              />
            </div>
            <div className="form-group">
              <label className="form-label">操作员地址</label>
              <input
                type="text"
                name="operatorAddress"
                className="form-input"
                value={merchantParams.operatorAddress}
                onChange={handleInputChange}
                placeholder="输入操作员地址"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-warning"
                onClick={checkOperatorPermission}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '检查权限'}
              </button>
              <button 
                className="btn btn-success"
                onClick={handleAddOperator}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '添加操作员'}
              </button>
            </div>
          </div>

          {/* 收款地址设置 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#f6ffed' }}>
            <h3>收款地址设置</h3>
            <div className="form-group">
              <label className="form-label">商家ID</label>
              <input
                type="text"
                name="merchantId"
                className="form-input"
                value={merchantParams.merchantId}
                onChange={handleInputChange}
                placeholder="输入商家ID"
              />
            </div>
            <div className="form-group">
              <label className="form-label">收款地址</label>
              <input
                type="text"
                name="paymentAddress"
                className="form-input"
                value={merchantParams.paymentAddress}
                onChange={handleInputChange}
                placeholder="输入收款地址"
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-warning"
                onClick={checkMerchantAddress}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '查询收款地址'}
              </button>
              <button 
                className="btn btn-success"
                onClick={handleSetPaymentAddress}
                disabled={loading || !address}
                style={{ flex: 1 }}
              >
                {loading ? '处理中...' : '设置收款地址'}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="card" style={{ 
            backgroundColor: '#f0f5ff', 
            border: '1px solid #adc6ff',
            overflow: 'auto'
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
            <li>使用"商家ID生成"功能创建新的商家ID</li>
            <li>使用"操作员管理"功能添加或检查操作员权限</li>
            <li>使用"收款地址设置"功能设置或查询商家收款地址</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
} 