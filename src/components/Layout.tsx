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
          <nav>
            <Link href="/" style={{ color: 'white', marginRight: '15px' }}>
              首页
            </Link>
            <Link href="/advanced" style={{ color: 'white' }}>
              高级版
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
          <p>© {new Date().getFullYear()} 支付委托演示 - 使用MetaMask和EIP-712签名</p>
        </div>
      </footer>
    </>
  );
} 