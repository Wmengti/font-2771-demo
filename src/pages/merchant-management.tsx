import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';
import { MerchantConfigManager } from '../../dist';

interface MerchantParams {
  merchantName: string;
  merchantId: string;
  operatorAddress: string;
}

export default function MerchantManagement() {
  const { sdk, address } = useWeb3();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [merchantParams, setMerchantParams] = useState<MerchantParams>({
    merchantName: '',
    merchantId: '',
    operatorAddress: ''
  });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  // config 与 Web3Context 保持一致
  const config = {
    vaultContractAddress: '0x236dFEF2F00118d3A8Ddc9191B7Ed217a5318Ec9',
    paymentContractAddress: '0x7Eaa7EB537587AfC84eDfCDF8C624848bf9985F3',
    forwarderAddress: '0x1B2f0Ada16d1586273576668c39CACdC8abe72f3',
  };
  // 实例化商家管理器
  const merchantManager = new MerchantConfigManager(config);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMerchantParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddOperator = async () => {
    if (!address) {
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
      const result = await merchantManager.setMerchantOperator(
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

  const handleSetOperator = async () => {
    if (!merchantParams.merchantId || !merchantParams.operatorAddress) {
      setError('请输入商户ID和操作员地址');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await merchantManager.setMerchantOperator(
        merchantParams.merchantId,
        merchantParams.operatorAddress
      );
      setResult(result);
      alert('操作员已设置');
    } catch (e: any) {
      setError('设置失败: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  const checkOperatorPermission = async () => {
    if (!address) {
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
      const result = await merchantManager.checkMerchantOperator(
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

  return (
    <Layout title="商家管理">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>商家管理</h1>
        
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
          <li>使用"操作员管理"功能添加或检查操作员权限</li>
        </ol>
      </div>
    </Layout>
  );
} 