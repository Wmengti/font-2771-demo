# 模块使用说明

本文档介绍了 ts-2771-delegate-sdk 前端 SDK 的核心模块和典型用法，所有功能均通过 Web3Delegate 实例统一调用。

## 目录

- [SDK 安装与初始化](#sdk-安装与初始化)
- [核心模块说明](#核心模块说明)
- [常用方法调用示例](#常用方法调用示例)
- [参数与类型说明](#参数与类型说明)
- [常见业务场景代码片段](#常见业务场景代码片段)
- [错误处理与调试](#错误处理与调试)
- [FAQ](#faq)

---

## SDK 安装与初始化

### 安装依赖

```bash
npm install ts-2771-delegate-sdk
```

### 初始化 SDK

```typescript
import { Web3Delegate } from 'ts-2771-delegate-sdk';

const config = {
  rpcUrl: 'YOUR_RPC_URL',
  paymentContractAddress: 'YOUR_PAYMENT_CONTRACT_ADDRESS',
  vaultContractAddress: 'YOUR_VAULT_CONTRACT_ADDRESS',
  forwarderAddress: 'YOUR_FORWARDER_CONTRACT_ADDRESS'
};
const sdk = new Web3Delegate(config);
```

> **注意：** 钱包私钥等由钱包插件（如 MetaMask）管理，SDK 不直接接收 privateKey、relayPrivateKey、publicKey 等参数。

---

## 核心模块说明

- **Web3Delegate**：统一业务入口，聚合所有链上/链下操作，包括金库、支付、授权、商户管理等。
- **MerchantConfigManager**：商户配置的创建和管理（通过 sdk.merchantConfigManager 访问，已默认挂载）。
- **TransactionService**：链上操作聚合服务（通过 sdk.transactionService 访问，已默认挂载）。
- **RelayerService**：链下验证和 relayer 交互（通过 sdk.relayerService 访问）。

---

## 常用方法调用示例

### 金库相关

```typescript
// 存款到金库
await sdk.depositToVault(merchantId, tokenAddress, amount);

// 从金库提现
await sdk.withdrawFromVault(merchantId, tokenAddress, amount);

// 金库消费
await sdk.consumeFromVault(merchantId, tokenAddress, amount, voucherId, pointToUse);

// 查询余额
const balance = await sdk.getVaultBalance(merchantId, tokenAddress);
```

### 代付gas（中继）相关

```typescript
const relayedDeposit = await sdk.prepareRelayedDeposit(merchantId, tokenAddress, amount);
const relayedConsume = await sdk.prepareRelayedConsume(merchantId, tokenAddress, amount, voucherId, pointToUse);
```

### 商户配置相关

```typescript
// 检查商家资格
const eligible = await sdk.merchantConfigManager.checkMerchantEligibility(merchantId);

// 创建商户配置
const createResult = await sdk.merchantConfigManager.createMerchantConfig(merchantId, { ... });
```

### 高级链上操作聚合

```typescript
// 直接支付
const hash = await sdk.transactionService.userPayDirect(to, amount, tokenAddress, seq);
// 代付gas支付请求
const relayed = await sdk.transactionService.prepareRelayedPayment(to, amount, seq, tokenAddress);
// 金库消费
const consumeHash = await sdk.transactionService.consumeFromVault(merchantId, tokenAddress, amount, voucherId, pointToUse, seq, idx, userAddress);
```

### 中继服务相关

```typescript
// 验证支付请求
const validation = await sdk.relayerService.validatePaymentRequest({ ... });

// 发送支付请求
const sendResult = await sdk.relayerService.sendRequest(OperationType.Payment, { ... });
```

---

## 参数与类型说明

| 参数名         | 类型         | 说明                   |
| -------------- | ------------ | ---------------------- |
| merchantId     | string       | 商户ID                 |
| tokenAddress   | string       | ERC20 代币合约地址     |
| amount         | bigint       | 金额（单位：最小单位） |
| voucherId      | bigint       | 代金券ID               |
| pointToUse     | bigint       | 使用积分数量           |

---

## 常见业务场景代码片段

### 用户存款

```typescript
await sdk.depositToVault('merchant-001', '0xToken...', 1000000000000000000n);
```

### 用户消费（带代金券和积分）

```typescript
await sdk.consumeFromVault('merchant-001', '0xToken...', 1000000000000000000n, 123n, 10n);
```

### 查询促销档位信息

```typescript
const promoTier = await sdk.vault.getPromoTier('merchant-001', 1000000000000000000n);
console.log('档位详情:', promoTier);
```

---

## 错误处理与调试

- 所有方法均为 async，请用 try/catch 捕获异常。
- 典型错误如：钱包未连接、余额不足、参数校验失败、链上 revert 等。
- 控制台有详细日志，便于调试。

```typescript
try {
  await sdk.depositToVault(...);
} catch (e) {
  alert('操作失败: ' + e.message);
}
```

---

## FAQ

- **Q: 如何获取钱包地址？**  
  A: 通过 `sdk.getConnectedAddress()` 获取当前连接的钱包地址。

- **Q: 金额单位是什么？**  
  A: 所有金额均为最小单位（如 1 ETH = 1e18）。

- **Q: 如何自定义 relayer？**  
  A: 构造 relayed 请求后，将对象交给后端 relayer 服务发送即可。

- **Q: 支持哪些链？**  
  A: 只需配置正确的 `rpcUrl`，即可支持任意 EVM 兼容链。

- **Q: sdk.merchantConfigManager、sdk.transactionService 是否默认可用？**  
  A: 是，Web3Delegate 实例化后自动挂载，无需手动 new。

---

如需更详细的接口文档和类型定义，请查阅源码注释。

如有疑问，欢迎随时联系后端同事！ 