import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';

export default function ConfigPage() {
  const { config, setConfig } = useWeb3();
  const [form, setForm] = useState({
    vaultContractAddress: '',
    paymentContractAddress: '',
    forwarderAddress: ''
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setForm(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.vaultContractAddress || !form.paymentContractAddress || !form.forwarderAddress) {
      setMsg('所有字段均为必填');
      return;
    }
    setConfig(form);
    localStorage.setItem('delegate_config', JSON.stringify(form));
    setMsg('配置已保存并全局生效！');
  };

  return (
    <Layout title="全局合约配置">
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>全局合约配置</h1>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="form-group">
            <label className="form-label">Vault 合约地址</label>
            <input
              type="text"
              name="vaultContractAddress"
              className="form-input"
              value={form.vaultContractAddress}
              onChange={handleChange}
              placeholder="0x..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Payment 合约地址</label>
            <input
              type="text"
              name="paymentContractAddress"
              className="form-input"
              value={form.paymentContractAddress}
              onChange={handleChange}
              placeholder="0x..."
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Forwarder 合约地址</label>
            <input
              type="text"
              name="forwarderAddress"
              className="form-input"
              value={form.forwarderAddress}
              onChange={handleChange}
              placeholder="0x..."
              required
            />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSave}>
            保存配置
          </button>
          {msg && <div style={{ marginTop: 16, color: '#52c41a', textAlign: 'center' }}>{msg}</div>}
        </div>
      </div>
    </Layout>
  );
} 