import { useEffect, useState } from 'react';
import { MerchantConfigManager } from '../../dist';
import Layout from '../components/Layout';

interface ConfigParams {
  merchantId: string;
  promoTiersEnabled: boolean;
  discountEnabled: boolean;
  discountBase: string;
  discountRate: string;
  cashbackPointEnabled: boolean;
  cashbackPointBase: string;
  cashbackPointAmount: string;
  cashbackVoucherEnabled: boolean;
  cashbackVoucherBase: string;
  cashbackVoucherAmount: string;
  voucherExpirePeriod: string;
}

interface PromoTier {
  minAmount: string;
  discountRate: string;
  voucherAmount: string;
  pointAmount: string;
}

// 用于在JSON输出中处理BigInt类型
const bigintReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

// 检查值是否为零
const isZeroValue = (value: any): boolean => {
  if (value === undefined || value === null) return true;
  if (value === '0') return true;
  if (typeof value === 'bigint' && value === 0n) return true;
  if (typeof value === 'number' && value === 0) return true;
  return false;
};

// 检查配置是否为空配置
const isEmptyConfig = (config: any): boolean => {
  if (!config || typeof config !== 'object') return true;
  
  // 检查数据中的关键字段是否均为空值或默认值
  const hasBasicConfig = 
    config.promoTiersEnabled || 
    config.discountEnabled ||
    config.discountBase !== '0' ||
    (config.discountRate !== '0' && config.discountRate !== '100') ||
    config.cashbackPointEnabled ||
    config.cashbackPointBase !== '0' ||
    config.cashbackPointAmount !== '0' ||
    config.cashbackVoucherEnabled ||
    config.cashbackVoucherBase !== '0' ||
    config.cashbackVoucherAmount !== '0';
    
  // 检查promoTiers是否有效
  const hasValidPromoTiers = 
    config.promoTiers && 
    Array.isArray(config.promoTiers) && 
    config.promoTiers.length > 0 &&
    config.promoTiers.some((tier: any) => 
      tier && typeof tier === 'object' && 
      (tier.minAmount !== '0' || 
       tier.discountRate !== '100' || 
       tier.voucherAmount !== '0' || 
       tier.pointAmount !== '0')
    );
  
  console.log('基本配置有效:', hasBasicConfig);
  console.log('促销层级有效:', hasValidPromoTiers);
  
  // 如果基本配置为空，且没有有效的促销层级，则认为是空配置
  return !hasBasicConfig && !hasValidPromoTiers;
};

// 创建默认PromoTier层级
const createDefaultPromoTiers = (): PromoTier[] => {
  return [
    {
      minAmount: '10', // 消费满10单位
      discountRate: '90', // 90%折扣率 
      voucherAmount: '10', // 返10代金券
      pointAmount: '50'    // 返50积分
    },
    {
      minAmount: '20', // 消费满20单位
      discountRate: '80', // 80%折扣率
      voucherAmount: '20', // 返20代金券 
      pointAmount: '150'   // 返150积分
    }
  ];
};

export default function MerchantConfig() {
  const [address, setAddress] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [configManager, setConfigManager] = useState<MerchantConfigManager | null>(null);
  const [configParams, setConfigParams] = useState<ConfigParams>({
    merchantId: '',
    promoTiersEnabled: true,        // 启用促销分档
    discountEnabled: false,          // 禁用普通折扣
    discountBase: '500',             // 满500享受折扣
    discountRate: '95',              // 95%折扣率
    cashbackPointEnabled: false,     // 禁用返积分
    cashbackPointBase: '300',        // 满300返积分
    cashbackPointAmount: '30',       // 返30积分
    cashbackVoucherEnabled: false,   // 禁用返券
    cashbackVoucherBase: '800',      // 满800返券
    cashbackVoucherAmount: '50',     // 返50代金券
    voucherExpirePeriod: '2592000'   // 券有效期30天（秒）
  });
  const [promoTiers, setPromoTiers] = useState<PromoTier[]>([
    {
      minAmount: '10', // 消费满10单位
      discountRate: '90', // 90%折扣率 
      voucherAmount: '10', // 返10代金券
      pointAmount: '50'    // 返50积分
    },
    {
      minAmount: '20', // 消费满20单位
      discountRate: '80', // 80%折扣率
      voucherAmount: '20', // 返20代金券 
      pointAmount: '150'   // 返150积分
    }
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initConfigManager = async () => {
        try {
          const config = { 
            useMetaMask: true,
            publicKey: '0x7A135109F5aAC103045342237511ae658ecFc1A7',
            contractAddress: '0x9fAb129F2a9CC1756772B73797ec4F37B86Ffc14'
          };
          const manager = new MerchantConfigManager(config);
          setConfigManager(manager);
        } catch (e) {
          console.error('初始化MerchantConfigManager失败', e);
        }
      };
      
      initConfigManager();
    }
  }, []);

  const handleConnect = async () => {
    if (!configManager) return;
    
    setLoading(true);
    setError('');
    try {
      const addr = await configManager.connectWallet();
      setAddress(addr);
    } catch (e: any) {
      console.error(e);
      setError(`连接失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfigParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePromoTierChange = (index: number, field: keyof PromoTier, value: string) => {
    const newTiers = [...promoTiers];
    newTiers[index] = {
      ...newTiers[index],
      [field]: value
    };
    setPromoTiers(newTiers);
  };

  const addPromoTier = () => {
    setPromoTiers([
      ...promoTiers,
      {
        minAmount: '30', // 消费满30单位
        discountRate: '70', // 70%折扣率
        voucherAmount: '30', // 返30代金券
        pointAmount: '200' // 返200积分
      }
    ]);
  };

  const removePromoTier = (index: number) => {
    if (promoTiers.length > 1) {
      const newTiers = [...promoTiers];
      newTiers.splice(index, 1);
      setPromoTiers(newTiers);
    }
  };

  const handleCreateConfig = async () => {
    if (!configManager || !address) {
      setError('请先连接钱包');
      return;
    }

    if (!configParams.merchantId) {
      setError('请输入商家ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const contractConfig = {
        promoTiersEnabled: configParams.promoTiersEnabled,
        promoTiers: promoTiers.map(tier => ({
          minAmount: BigInt(tier.minAmount),
          discountRate: BigInt(tier.discountRate),
          voucherAmount: BigInt(tier.voucherAmount),
          pointAmount: BigInt(tier.pointAmount)
        })),
        discountEnabled: configParams.discountEnabled,
        discountBase: BigInt(configParams.discountBase),
        discountRate: BigInt(configParams.discountRate),
        cashbackPointEnabled: configParams.cashbackPointEnabled,
        cashbackPointBase: BigInt(configParams.cashbackPointBase),
        cashbackPointAmount: BigInt(configParams.cashbackPointAmount),
        cashbackVoucherEnabled: configParams.cashbackVoucherEnabled,
        cashbackVoucherBase: BigInt(configParams.cashbackVoucherBase),
        cashbackVoucherAmount: BigInt(configParams.cashbackVoucherAmount),
        voucherExpirePeriod: BigInt(configParams.voucherExpirePeriod)
      };

      const result = await configManager.createMerchantConfig(
        configParams.merchantId,
        contractConfig
      );
      
      setResult({ type: 'create_config', result });
      if (result.success) {
        alert('创建商家配置成功！');
      } else {
        setError(`创建商家配置失败: ${result.message}`);
      }
    } catch (e: any) {
      console.error(e);
      setError(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetConfig = async () => {
    if (!configManager || !address) {
      setError('请先连接钱包');
      return;
    }

    if (!configParams.merchantId) {
      setError('请输入商家ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await configManager.getMerchantConfig(
        configParams.merchantId
      );
      
      setResult({ type: 'get_config', result });
      console.log('获取的配置原始数据:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        // 检查API返回的数据是否为空
        if (!result.data) {
          console.log('API返回成功但数据为空，使用当前设置');
          
          // 设置默认的促销层级
          if (promoTiers.length === 0) {
            setPromoTiers(createDefaultPromoTiers());
          }
          
          alert('该商家ID尚未配置，请设置后保存');
          return;
        }
        
        // 更新表单数据
        const config = result.data;
        console.log('配置数据类型:', typeof config);
        console.log('配置数据结构:', Object.keys(config));
        console.log('配置数据详情:', JSON.stringify(config, bigintReplacer, 2));
        
        // 检查配置是否为空
        if (isEmptyConfig(config)) {
          console.log('获取到空配置，使用当前表单值');
          
          // 如果当前没有设置促销层级，则设置默认的促销层级
          if (promoTiers.length === 0) {
            setPromoTiers(createDefaultPromoTiers());
          }
          
          alert('该商家ID尚未配置，请设置后保存');
          return;
        }
        
        // 配置有效，更新表单
        console.log('获取到有效配置，更新表单');
        
        // 更新配置参数
        setConfigParams({
          merchantId: configParams.merchantId,
          promoTiersEnabled: config.promoTiersEnabled || false,
          discountEnabled: config.discountEnabled || false,
          discountBase: config.discountBase || configParams.discountBase,
          discountRate: config.discountRate || configParams.discountRate,
          cashbackPointEnabled: config.cashbackPointEnabled || false,
          cashbackPointBase: config.cashbackPointBase || configParams.cashbackPointBase,
          cashbackPointAmount: config.cashbackPointAmount || configParams.cashbackPointAmount,
          cashbackVoucherEnabled: config.cashbackVoucherEnabled || false,
          cashbackVoucherBase: config.cashbackVoucherBase || configParams.cashbackVoucherBase,
          cashbackVoucherAmount: config.cashbackVoucherAmount || configParams.cashbackVoucherAmount,
          voucherExpirePeriod: config.voucherExpirePeriod || configParams.voucherExpirePeriod
        });

        // 更新促销层级
        if (config.promoTiers && Array.isArray(config.promoTiers) && config.promoTiers.length > 0) {
          console.log('原始促销层级:', JSON.stringify(config.promoTiers, bigintReplacer, 2));
          
          const formattedTiers = config.promoTiers
            .filter((tier: any) => tier !== null && tier !== undefined) // 过滤掉null值
            .map((tier: any) => ({
              minAmount: tier.minAmount || '0',
              discountRate: tier.discountRate || '100',
              voucherAmount: tier.voucherAmount || '0',
              pointAmount: tier.pointAmount || '0'
            }));
          
          if (formattedTiers.length > 0) {
            console.log('处理后的促销层级:', formattedTiers);
            setPromoTiers(formattedTiers);
          } else {
            console.log('处理后的促销层级为空，使用默认设置');
            setPromoTiers(createDefaultPromoTiers());
          }
        } else {
          console.log('没有促销层级数据，使用默认设置');
          setPromoTiers(createDefaultPromoTiers());
        }
        
        alert('获取商家配置成功！');
      } else {
        console.log('返回结果失败，使用当前表单值');
        
        // 如果当前没有设置促销层级，则设置默认的促销层级
        if (promoTiers.length === 0) {
          setPromoTiers(createDefaultPromoTiers());
        }
        
        alert('未找到该商家配置，请设置后保存');
      }
    } catch (e: any) {
      console.error('获取配置出错:', e);
      setError(`操作失败: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="商家配置管理">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>商家配置管理</h1>
        
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
            <label className="form-label">商家ID</label>
            <input
              type="text"
              name="merchantId"
              className="form-input"
              value={configParams.merchantId}
              onChange={handleInputChange}
              placeholder="输入商家ID"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button 
              className="btn btn-warning"
              onClick={handleGetConfig}
              disabled={loading || !address}
              style={{ flex: 1 }}
            >
              {loading ? '处理中...' : '获取配置'}
            </button>
            <button 
              className="btn btn-success"
              onClick={handleCreateConfig}
              disabled={loading || !address}
              style={{ flex: 1 }}
            >
              {loading ? '处理中...' : '保存配置'}
            </button>
          </div>

          {/* 分层促销设置 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#f0f9ff' }}>
            <h3>分层促销设置</h3>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="promoTiersEnabled"
                  checked={configParams.promoTiersEnabled}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                启用分层促销
              </label>
            </div>

            {configParams.promoTiersEnabled && (
              <div>
                {promoTiers.map((tier, index) => (
                  <div key={index} style={{ 
                    border: '1px dashed #d9d9d9', 
                    padding: '10px', 
                    marginBottom: '10px',
                    borderRadius: '4px'
                  }}>
                    <h4>层级 {index + 1}</h4>
                    <div className="form-group">
                      <label className="form-label">最低消费金额</label>
                      <input
                        type="text"
                        value={tier.minAmount}
                        onChange={(e) => handlePromoTierChange(index, 'minAmount', e.target.value)}
                        className="form-input"
                        placeholder="输入最低消费金额"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">折扣率 (%)</label>
                      <input
                        type="text"
                        value={tier.discountRate}
                        onChange={(e) => handlePromoTierChange(index, 'discountRate', e.target.value)}
                        className="form-input"
                        placeholder="输入折扣率，如90表示90%"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">代金券金额</label>
                      <input
                        type="text"
                        value={tier.voucherAmount}
                        onChange={(e) => handlePromoTierChange(index, 'voucherAmount', e.target.value)}
                        className="form-input"
                        placeholder="输入代金券金额"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">积分数量</label>
                      <input
                        type="text"
                        value={tier.pointAmount}
                        onChange={(e) => handlePromoTierChange(index, 'pointAmount', e.target.value)}
                        className="form-input"
                        placeholder="输入积分数量"
                      />
                    </div>
                    {promoTiers.length > 1 && (
                      <button 
                        className="btn btn-warning"
                        onClick={() => removePromoTier(index)}
                        style={{ width: '100%' }}
                      >
                        删除此层级
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  className="btn btn-primary"
                  onClick={addPromoTier}
                  style={{ width: '100%' }}
                >
                  添加层级
                </button>
              </div>
            )}
          </div>

          {/* 折扣设置 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#fff7e6' }}>
            <h3>折扣设置</h3>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="discountEnabled"
                  checked={configParams.discountEnabled}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                启用折扣
              </label>
            </div>

            {configParams.discountEnabled && (
              <>
                <div className="form-group">
                  <label className="form-label">基准金额</label>
                  <input
                    type="text"
                    name="discountBase"
                    className="form-input"
                    value={configParams.discountBase}
                    onChange={handleInputChange}
                    placeholder="输入基准金额"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">折扣率 (%)</label>
                  <input
                    type="text"
                    name="discountRate"
                    className="form-input"
                    value={configParams.discountRate}
                    onChange={handleInputChange}
                    placeholder="输入折扣率，如95表示95%"
                  />
                </div>
              </>
            )}
          </div>

          {/* 积分返现设置 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#f6ffed' }}>
            <h3>积分返现设置</h3>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="cashbackPointEnabled"
                  checked={configParams.cashbackPointEnabled}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                启用积分返现
              </label>
            </div>

            {configParams.cashbackPointEnabled && (
              <>
                <div className="form-group">
                  <label className="form-label">基准金额</label>
                  <input
                    type="text"
                    name="cashbackPointBase"
                    className="form-input"
                    value={configParams.cashbackPointBase}
                    onChange={handleInputChange}
                    placeholder="输入基准金额"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">返还积分数量</label>
                  <input
                    type="text"
                    name="cashbackPointAmount"
                    className="form-input"
                    value={configParams.cashbackPointAmount}
                    onChange={handleInputChange}
                    placeholder="输入返还积分数量"
                  />
                </div>
              </>
            )}
          </div>

          {/* 代金券返现设置 */}
          <div className="card" style={{ margin: '20px 0', backgroundColor: '#e6f7ff' }}>
            <h3>代金券返现设置</h3>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  name="cashbackVoucherEnabled"
                  checked={configParams.cashbackVoucherEnabled}
                  onChange={handleInputChange}
                  style={{ marginRight: '8px' }}
                />
                启用代金券返现
              </label>
            </div>

            {configParams.cashbackVoucherEnabled && (
              <>
                <div className="form-group">
                  <label className="form-label">基准金额</label>
                  <input
                    type="text"
                    name="cashbackVoucherBase"
                    className="form-input"
                    value={configParams.cashbackVoucherBase}
                    onChange={handleInputChange}
                    placeholder="输入基准金额"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">代金券金额</label>
                  <input
                    type="text"
                    name="cashbackVoucherAmount"
                    className="form-input"
                    value={configParams.cashbackVoucherAmount}
                    onChange={handleInputChange}
                    placeholder="输入代金券金额"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">代金券有效期 (秒)</label>
                  <input
                    type="text"
                    name="voucherExpirePeriod"
                    className="form-input"
                    value={configParams.voucherExpirePeriod}
                    onChange={handleInputChange}
                    placeholder="输入代金券有效期，单位为秒"
                  />
                </div>
              </>
            )}
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
            <li>输入商家ID</li>
            <li>点击"获取配置"按钮查询现有配置</li>
            <li>根据需要设置分层促销、折扣、积分和代金券规则</li>
            <li>点击"保存配置"按钮提交设置</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
} 