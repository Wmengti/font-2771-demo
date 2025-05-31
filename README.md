# 支付委托演示

这是一个使用Next.js构建的支付委托演示项目，展示了如何使用MetaMask和EIP-712签名实现元交易（Meta Transaction）。

## 功能特点

- 支持MetaMask钱包连接
- 支持EIP-712签名
- 支持代币和原生代币(ETH)转账
- 提供基础版和高级版界面
- 自定义转账参数

## 技术栈

- Next.js
- React
- TypeScript
- Viem (以太坊交互库)
- Ethers.js

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 构建项目

```bash
npm run build
# 或
yarn build
```

### 启动生产服务

```bash
npm run start
# 或
yarn start
```

## 项目结构

```
├── public/
├── src/
│   ├── config/        # 合约配置
│   ├── lib/           # 工具类
│   ├── pages/         # 页面组件
│   ├── styles/        # 样式文件
│   └── types/         # 类型定义
├── package.json
├── tsconfig.json
└── next.config.js
```

## 使用方法

1. 安装并设置MetaMask浏览器扩展
2. 连接钱包到演示应用
3. 在基础版中使用默认参数进行转账
4. 或者在高级版中自定义转账参数
5. 确认MetaMask中的签名请求
6. 查看交易结果

## 主要API

### PaymentDelegate类

```typescript
// 创建实例
const delegateConfig = { useMetaMask: true };
const paymentDelegate = new PaymentDelegate(delegateConfig);

// 连接钱包
const address = await paymentDelegate.connectWallet();

// 处理转账
const transferParams = {
  tokenAddress: '0x7A135109F5aAC103045342237511ae658ecFc1A7', // 可选，为空表示ETH
  to: '0xA31a2dE4845e4fe869067618F2ABf0Cad279472F',
  amount: BigInt('50000000000000000000'),
  gasFee: BigInt('1000100000000000000'),
  seq: BigInt(Math.floor(Date.now() / 1000))
};

const result = await paymentDelegate.processTransfer(transferParams);
```

## 注意事项

- 确保在浏览器中安装MetaMask扩展
- 确保MetaMask已连接到正确的网络
- 对于代币转账，需要确保有足够的余额
- 签名过程不会消耗Gas费用，但实际执行交易时需要

## 许可证

MIT 