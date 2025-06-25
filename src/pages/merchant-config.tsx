import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';

interface ConfigParams {
  merchantId: string;
  promoTiersEnabled?: boolean;
  discountEnabled?: boolean;
  discountBase?: string;
  discountRate?: string;
  cashbackPointEnabled?: boolean;
  cashbackPointBase?: string;
  cashbackPointAmount?: string;
  cashbackVoucherEnabled?: boolean;
  cashbackVoucherBase?: string;
  cashbackVoucherAmount?: string;
  voucherExpirePeriod?: string;
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
      pointAmount: '50',    // 返50积分
      startTime: '',
      endTime: '',
      voucherExpirePeriod: '',
      enabled: true
    },
    {
      minAmount: '20', // 消费满20单位
      discountRate: '80', // 80%折扣率
      voucherAmount: '20', // 返20代金券 
      pointAmount: '150',   // 返150积分
      startTime: '',
      endTime: '',
      voucherExpirePeriod: '',
      enabled: true
    }
  ];
};

// 增加活动配置类型
interface PromoTier {
  minAmount: string;
  discountRate: string;
  voucherAmount: string;
  pointAmount: string;
  startTime: string;
  endTime: string;
  voucherExpirePeriod: string;
  enabled: boolean;
}

export default function MerchantConfig() {
  const { sdk, address, config } = useWeb3();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [configParams, setConfigParams] = useState<ConfigParams>({
    merchantId: '',
  });

  const [promoTiers, setPromoTiers] = useState<PromoTier[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('merchant_promoTiers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    // 默认2档
    return [
      { minAmount: '', discountRate: '', voucherAmount: '', pointAmount: '', startTime: '', endTime: '', voucherExpirePeriod: '', enabled: true },
      { minAmount: '', discountRate: '', voucherAmount: '', pointAmount: '', startTime: '', endTime: '', voucherExpirePeriod: '', enabled: true }
    ];
  });

  // 每次 promoTiers 变化自动保存到 localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('merchant_promoTiers', JSON.stringify(promoTiers));
    }
  }, [promoTiers]);

  // 新增：当前编辑的档位
  const [editingTier, setEditingTier] = useState<PromoTier>({ minAmount: '', discountRate: '', voucherAmount: '', pointAmount: '', startTime: '', endTime: '', voucherExpirePeriod: '', enabled: true });
  const [editingIdx, setEditingIdx] = useState<number | null>(null); // null表示新增，数字表示编辑某一档

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfigParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // 提交当前档位
  const handleSubmitTier = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }
    let merchantIdBigint: bigint;
    try {
      merchantIdBigint = BigInt(configParams.merchantId);
    } catch {
      setError('商家ID必须为合法的数字或16进制字符串');
      return;
    }
    if (merchantIdBigint === BigInt(0)) {
      setError('请输入商家ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const idx = editingIdx === null ? promoTiers.length : editingIdx;
      await sdk.merchantConfigManager.setPromoTier(
        merchantIdBigint,
        idx,
        BigInt(editingTier.minAmount || '0'),
        BigInt(editingTier.discountRate || '0'),
        BigInt(editingTier.voucherAmount || '0'),
        BigInt(editingTier.pointAmount || '0'),
        BigInt(editingTier.startTime || '0'),
        BigInt(editingTier.endTime || '0'),
        BigInt(editingTier.voucherExpirePeriod || '0'),
        !!editingTier.enabled
      );
      let newTiers = [...promoTiers];
      if (editingIdx === null) {
        newTiers.push(editingTier);
      } else {
        newTiers[editingIdx] = editingTier;
      }
      setPromoTiers(newTiers);
      localStorage.setItem('merchant_promoTiers', JSON.stringify(newTiers));
      setEditingTier({ minAmount: '', discountRate: '', voucherAmount: '', pointAmount: '', startTime: '', endTime: '', voucherExpirePeriod: '', enabled: true });
      setEditingIdx(null);
      alert('档位已保存到链上！');
    } catch (e: any) {
      setError('保存失败: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  // 删除档位
  const handleDeleteTier = async (idx: number) => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }
    let merchantIdBigint: bigint;
    try {
      merchantIdBigint = BigInt(configParams.merchantId);
    } catch {
      setError('商家ID必须为合法的数字或16进制字符串');
      return;
    }
    if (merchantIdBigint === BigInt(0)) {
      setError('请输入商家ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 这里链上可用 setPromoTier(..., enabled=false) 禁用该档位
      const t = promoTiers[idx];
      await sdk.merchantConfigManager.setPromoTier(
        merchantIdBigint,
        idx,
        BigInt(t.minAmount || '0'),
        BigInt(t.discountRate || '0'),
        BigInt(t.voucherAmount || '0'),
        BigInt(t.pointAmount || '0'),
        BigInt(t.startTime || '0'),
        BigInt(t.endTime || '0'),
        BigInt(t.voucherExpirePeriod || '0'),
        false // 禁用
      );
      const newTiers = promoTiers.filter((_, i) => i !== idx);
      setPromoTiers(newTiers);
      localStorage.setItem('merchant_promoTiers', JSON.stringify(newTiers));
      alert('档位已删除！');
    } catch (e: any) {
      setError('删除失败: ' + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  };

  // 编辑档位
  const handleEditTier = (idx: number) => {
    setEditingTier(promoTiers[idx]);
    setEditingIdx(idx);
  };

  const handleGetConfig = async () => {
    if (!sdk || !address) {
      setError('请先连接钱包');
      return;
    }
    let merchantIdBigint: bigint;
    try {
      merchantIdBigint = BigInt(configParams.merchantId);
    } catch {
      setError('商家ID必须为合法的数字或16进制字符串');
      return;
    }
    if (merchantIdBigint === BigInt(0)) {
      setError('请输入商家ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const tiers: PromoTier[] = [];
      for (let idx = 0; idx < 20; idx++) { // 最多查20档
        try {
          const res = await sdk.vault.getPromoTier(merchantIdBigint, idx);
          if (!res || !res.minAmount) break;
          tiers.push({
            minAmount: res.minAmount?.toString() || '',
            discountRate: res.discountRate?.toString() || '',
            voucherAmount: res.voucherAmount?.toString() || '',
            pointAmount: res.pointAmount?.toString() || '',
            startTime: res.startTime?.toString() || '',
            endTime: res.endTime?.toString() || '',
            voucherExpirePeriod: res.voucherExpirePeriod?.toString() || '',
            enabled: !!res.enabled
          });
        } catch {
          break;
        }
      }
      setPromoTiers(tiers.length ? tiers : [{ minAmount: '', discountRate: '', voucherAmount: '', pointAmount: '', startTime: '', endTime: '', voucherExpirePeriod: '', enabled: true }]);
      localStorage.setItem('merchant_promoTiers', JSON.stringify(tiers));
      alert('链上活动配置已同步！');
    } catch (e: any) {
      setError('获取失败: ' + (e.message || e.toString()));
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
            {/* 连接钱包按钮已全局化，这里不再显示 */}
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

          <div className="form-group">
            <label className="form-label" style={{ fontSize: 15, marginBottom: 6 }}>{editingIdx === null ? '新增活动档位' : `编辑第${editingIdx + 1}档位`}</label>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 14, background: '#f9fafb', boxShadow: '0 1px 4px rgba(106,130,251,0.04)', marginBottom: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 500, color: '#6a82fb', fontSize: 13 }}>满多少（minAmount）</label>
                  <input type="number" value={editingTier.minAmount} onChange={e => setEditingTier(t => ({ ...t, minAmount: e.target.value }))} placeholder="如 10" style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14 }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 500, color: '#6a82fb', fontSize: 13 }}>折扣率（discountRate）</label>
                  <input type="number" value={editingTier.discountRate} onChange={e => setEditingTier(t => ({ ...t, discountRate: e.target.value }))} placeholder="如 90" style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14 }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 500, color: '#6a82fb', fontSize: 13 }}>返券（voucherAmount）</label>
                  <input type="number" value={editingTier.voucherAmount} onChange={e => setEditingTier(t => ({ ...t, voucherAmount: e.target.value }))} placeholder="如 10" style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14 }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 500, color: '#6a82fb', fontSize: 13 }}>返积分（pointAmount）</label>
                  <input type="number" value={editingTier.pointAmount} onChange={e => setEditingTier(t => ({ ...t, pointAmount: e.target.value }))} placeholder="如 50" style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14 }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 500, color: '#6a82fb', fontSize: 13 }}>开始时间（startTime, 秒）</label>
                  <input type="number" value={editingTier.startTime} onChange={e => setEditingTier(t => ({ ...t, startTime: e.target.value }))} placeholder="如 0" style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14 }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 500, color: '#6a82fb', fontSize: 13 }}>结束时间（endTime, 秒）</label>
                  <input type="number" value={editingTier.endTime} onChange={e => setEditingTier(t => ({ ...t, endTime: e.target.value }))} placeholder="如 0" style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14 }} />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 500, color: '#6a82fb', fontSize: 13 }}>券有效期（voucherExpirePeriod, 秒）</label>
                  <input type="number" value={editingTier.voucherExpirePeriod} onChange={e => setEditingTier(t => ({ ...t, voucherExpirePeriod: e.target.value }))} placeholder="如 0" style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid #e0e0e0', fontSize: 14 }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 500, color: '#6a82fb', fontSize: 13 }}>启用（enabled）</label>
                  <input type="checkbox" checked={editingTier.enabled} onChange={e => setEditingTier(t => ({ ...t, enabled: e.target.checked }))} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button type="button" onClick={handleSubmitTier} style={{ flex: 1, background: 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>{editingIdx === null ? '新增档位' : '保存修改'}</button>
                  {editingIdx !== null && <button type="button" onClick={() => { setEditingTier({ minAmount: '', discountRate: '', voucherAmount: '', pointAmount: '', startTime: '', endTime: '', voucherExpirePeriod: '', enabled: true }); setEditingIdx(null); }} style={{ flex: 1, background: '#f5f5f5', color: '#888', border: '1px solid #e0e0e0', borderRadius: 6, padding: '6px 0', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>取消</button>}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <label className="form-label" style={{ fontSize: 15, marginBottom: 6 }}>已配置档位</label>
              {promoTiers.length === 0 && <div style={{ color: '#aaa', fontSize: 14 }}>暂无档位</div>}
              {promoTiers.map((tier, idx) => (
                <div key={idx} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 10, marginBottom: 8, background: '#fff' }}>
                  <div style={{ fontSize: 14, color: '#333' }}>
                    <b>满{tier.minAmount}</b>，折扣{tier.discountRate}%，返券{tier.voucherAmount}，返积分{tier.pointAmount}，有效期{tier.startTime}-{tier.endTime}，券期{tier.voucherExpirePeriod}秒，{tier.enabled ? '启用' : '禁用'}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button type="button" onClick={() => handleEditTier(idx)} style={{ background: '#f0f5ff', color: '#3056d3', border: 'none', borderRadius: 5, padding: '2px 12px', fontSize: 13, cursor: 'pointer' }}>编辑</button>
                    <button type="button" onClick={() => handleDeleteTier(idx)} style={{ background: '#fff0f0', color: '#d32f2f', border: 'none', borderRadius: 5, padding: '2px 12px', fontSize: 13, cursor: 'pointer' }}>删除</button>
                  </div>
                </div>
              ))}
            </div>
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