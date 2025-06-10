import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = '支付委托演示' }: LayoutProps) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Web3支付委托演示" />
        <link rel="icon" href="/favicon.ico" />
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f0f2f5;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 15px;
            }
            .header {
              background-color: #1677ff;
              color: white;
              padding: 15px 0;
              margin-bottom: 30px;
            }
            .card {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              padding: 20px;
              margin-bottom: 20px;
            }
            .form-group {
              margin-bottom: 15px;
            }
            .form-label {
              display: block;
              margin-bottom: 5px;
              font-weight: 500;
            }
            .form-input {
              width: 100%;
              padding: 8px 10px;
              border: 1px solid #d9d9d9;
              border-radius: 4px;
              box-sizing: border-box;
            }
            .btn {
              padding: 8px 16px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 14px;
              transition: all 0.3s;
            }
            .btn:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
            .btn-primary {
              background-color: #1890ff;
              color: white;
            }
            .btn-primary:hover {
              background-color: #40a9ff;
            }
            .btn-success {
              background-color: #52c41a;
              color: white;
            }
            .btn-success:hover {
              background-color: #73d13d;
            }
            .btn-warning {
              background-color: #faad14;
              color: white;
            }
            .btn-warning:hover {
              background-color: #ffc53d;
            }
            .btn-secondary {
              background-color: #f0f0f0;
              color: #333;
            }
            .btn-secondary:hover {
              background-color: #d9d9d9;
            }
            .footer {
              text-align: center;
              margin: 40px 0 20px;
              color: #666;
            }
          `}
        </style>
      </Head>

      <header className="header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>支付委托演示</h2>
          <nav style={{ display: 'flex', gap: '15px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
              首页
            </Link>
            <Link href="/payment" style={{ color: 'white', textDecoration: 'none' }}>
              支付
            </Link>
            <Link href="/vault-operations" style={{ color: 'white', textDecoration: 'none' }}>
              金库操作
            </Link>
            <Link href="/relayer" style={{ color: 'white', textDecoration: 'none' }}>
              中继器
            </Link>
            <Link href="/merchant-management" style={{ color: 'white', textDecoration: 'none' }}>
              操作员管理
            </Link>
            <Link href="/merchant-config" style={{ color: 'white', textDecoration: 'none' }}>
              商户配置
            </Link>
          </nav>
        </div>
      </header>

      <main className="container">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>© {new Date().getFullYear()} 支付委托演示 - 基于重构架构的Web3支付解决方案</p>
        </div>
      </footer>
    </div>
  );
} 