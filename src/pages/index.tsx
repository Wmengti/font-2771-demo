import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useWeb3 } from '../context/Web3Context';

export default function Home() {
  const { sdk, address } = useWeb3();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 丰富日志示例
  if (sdk) console.log('[首页] Web3Delegate SDK 已初始化:', sdk);
  if (address) console.log('[首页] 当前钱包地址:', address);

  return (
    <Layout>
      <div className="container">
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Web3 支付委托演示</h1>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
            这是一个基于重构后架构的Web3支付演示应用，提供了多种不同的支付场景和管理功能：
          </p>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px',
          marginBottom: '40px' 
        }}>
          {/* 直接支付卡片 */}
          <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
            <h2 style={{ color: '#1890ff', marginBottom: '20px' }}>直接支付</h2>
            <p style={{ color: '#666', marginBottom: '20px', minHeight: '60px' }}>
              用户自己付gas费，先进行代币授权，然后执行直接支付操作
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '30px', paddingLeft: '20px' }}>
              <li>✅ 代币授权（approve）</li>
              <li>✅ 直接支付（pay）</li>
              <li>✅ 用户承担所有gas费用</li>
              <li>✅ 查询授权额度</li>
            </ul>
            <Link href="/payment?tab=direct" className="btn btn-primary" style={{ 
              display: 'inline-block',
              textDecoration: 'none',
              color: 'white',
              width: '100%'
            }}>
              开始直接支付
            </Link>
          </div>
          {/* Meta Transaction卡片 */}
          <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
            <h2 style={{ color: '#52c41a', marginBottom: '20px' }}>Meta Transaction</h2>
            <p style={{ color: '#666', marginBottom: '20px', minHeight: '60px' }}>
              用户先授权，然后签名生成Meta Transaction数据，由Relayer代付gas执行
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '30px', paddingLeft: '20px' }}>
              <li>✅ 代币授权（用户付gas）</li>
              <li>✅ 生成签名数据</li>
              <li>✅ Relayer代付gas执行</li>
              <li>✅ 可配置过期时间</li>
            </ul>
            <Link href="/payment?tab=meta" className="btn btn-success" style={{ 
              display: 'inline-block',
              textDecoration: 'none',
              color: 'white',
              width: '100%'
            }}>
              开始Meta Transaction
            </Link>
          </div>
          {/* 金库操作卡片 */}
          <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
            <h2 style={{ color: '#fa8c16', marginBottom: '20px' }}>金库操作</h2>
            <p style={{ color: '#666', marginBottom: '20px', minHeight: '60px' }}>
              UnifiedVault相关操作：存款、提现、消费，支持直接操作和Meta Transaction
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '30px', paddingLeft: '20px' }}>
              <li>✅ 存款（deposit）</li>
              <li>✅ 提现（withdraw）</li>
              <li>✅ 直接消费</li>
              <li>✅ Meta Transaction消费</li>
            </ul>
            <Link href="/vault-operations" className="btn btn-warning" style={{ 
              display: 'inline-block',
              textDecoration: 'none',
              color: 'white',
              width: '100%'
            }}>
              开始金库操作
            </Link>
          </div>
          {/* 商家管理卡片 */}
          <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
            <h2 style={{ color: '#722ed1', marginBottom: '20px' }}>商家管理</h2>
            <p style={{ color: '#666', marginBottom: '20px', minHeight: '60px' }}>
              商家ID生成、操作员管理和收款地址设置
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '30px', paddingLeft: '20px' }}>
              <li>✅ 商家ID生成</li>
              <li>✅ 操作员管理</li>
              <li>✅ 收款地址设置</li>
              <li>✅ 权限检查</li>
            </ul>
            <Link href="/merchant-management" className="btn btn-secondary" style={{ 
              display: 'inline-block',
              textDecoration: 'none',
              color: 'white',
              width: '100%',
              backgroundColor: '#722ed1'
            }}>
              商家管理
            </Link>
          </div>
          {/* 商家配置卡片 */}
          <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
            <h2 style={{ color: '#eb2f96', marginBottom: '20px' }}>商家配置</h2>
            <p style={{ color: '#666', marginBottom: '20px', minHeight: '60px' }}>
              设置商家的促销活动、折扣、积分和代金券规则
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '30px', paddingLeft: '20px' }}>
              <li>✅ 分层促销设置</li>
              <li>✅ 折扣设置</li>
              <li>✅ 积分返现设置</li>
              <li>✅ 代金券返现设置</li>
            </ul>
            <Link href="/merchant-config" className="btn btn-danger" style={{ 
              display: 'inline-block',
              textDecoration: 'none',
              color: 'white',
              width: '100%'
            }}>
              商家配置
            </Link>
          </div>
          {/* Relayer服务卡片 */}
          <div className="card" style={{ textAlign: 'center', padding: '30px' }}>
            <h2 style={{ color: '#13c2c2', marginBottom: '20px' }}>中继器服务</h2>
            <p style={{ color: '#666', marginBottom: '20px', minHeight: '60px' }}>
              处理Meta Transaction请求，代付gas费用执行交易
            </p>
            <ul style={{ textAlign: 'left', marginBottom: '30px', paddingLeft: '20px' }}>
              <li>✅ 处理签名请求</li>
              <li>✅ 代付gas费</li>
              <li>✅ 验证签名有效性</li>
              <li>✅ 执行链上交易</li>
            </ul>
            <Link href="/relayer" className="btn" style={{
              display: 'inline-block',
              textDecoration: 'none',
              color: 'white',
              width: '100%',
              backgroundColor: '#13c2c2'
            }}>
              中继器服务
            </Link>
          </div>
        </div>
        <div className="card" style={{ backgroundColor: '#f6f8fa', padding: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>架构特点</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            <div>
              <h4 style={{ color: '#1890ff', marginBottom: '10px' }}>🔧 模块化设计</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>
                将Token操作、直接支付、Meta Transaction、金库操作等功能分别封装成独立模块
              </p>
            </div>
            <div>
              <h4 style={{ color: '#52c41a', marginBottom: '10px' }}>📝 统一签名格式</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>
                所有Meta Transaction都返回统一的RelayedRequestData格式，包含from、to、value、gas、nonce、deadline、data
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fa8c16', marginBottom: '10px' }}>⏰ 可配置过期时间</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>
                支持自定义deadline秒数，灵活控制Meta Transaction的有效期
              </p>
            </div>
            <div>
              <h4 style={{ color: '#722ed1', marginBottom: '10px' }}>🚀 高度解耦</h4>
              <p style={{ color: '#666', fontSize: '14px' }}>
                各个操作类相互独立，便于前端灵活调用和后续扩展
              </p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ color: '#666' }}>
            选择上方任意一个场景开始体验Web3支付委托功能
          </p>
        </div>
      </div>
    </Layout>
  );
}

// 为TypeScript添加全局类型声明
declare global {
  interface Window {
    WalletService: typeof import('../../dist').WalletService;
    TransactionService: typeof import('../../dist').TransactionService;
    BlockchainService: typeof import('../../dist').BlockchainService;
    ethereum: any;
  }
} 