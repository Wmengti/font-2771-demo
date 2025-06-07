import Head from 'next/head';
import Link from 'next/link';
import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function Layout({ children, title = '支付委托演示' }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="使用MetaMask和EIP-712签名实现元交易演示" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header style={{ 
        backgroundColor: '#1677ff', 
        color: 'white',
        padding: '10px 20px',
        marginBottom: '20px'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>支付委托演示</h2>
          <nav style={{ display: 'flex', gap: '15px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
              首页
            </Link>
            <Link href="/direct-payment" style={{ color: 'white', textDecoration: 'none' }}>
              直接支付
            </Link>
            <Link href="/meta-transaction" style={{ color: 'white', textDecoration: 'none' }}>
              Meta Transaction
            </Link>
            <Link href="/vault-operations" style={{ color: 'white', textDecoration: 'none' }}>
              金库操作
            </Link>
          </nav>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer style={{ 
        textAlign: 'center', 
        padding: '20px', 
        marginTop: '40px', 
        borderTop: '1px solid #eaeaea',
        color: '#888'
      }}>
        <div className="container">
          <p>© {new Date().getFullYear()} 支付委托演示 - 基于重构架构的Web3支付解决方案</p>
        </div>
      </footer>
    </>
  );
} 