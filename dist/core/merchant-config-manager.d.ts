import { DelegateConfig, MerchantOperationResult } from '../types';
import { BlockchainService } from './blockchain';
export declare class MerchantConfigManager extends BlockchainService {
    constructor(config: DelegateConfig);
    /**
     * 设置或更新商户活动档位（PromoTier）
     * @param merchantId 商户ID
     * @param idx 活动档位编号（由前端维护，0表示新建，非0表示更新）
     * @param minAmount 最低消费金额
     * @param discountRate 折扣率（百分制，100=无折扣）
     * @param voucherAmount 返券金额
     * @param pointAmount 返积分数量
     * @param startTime 档位开始时间
     * @param endTime 档位结束时间
     * @param voucherExpirePeriod 券奖励有效期（秒）
     * @param enabled 档位开关
     * @returns 交易哈希
     */
    setPromoTier(merchantId: string, idx: number, minAmount: bigint, discountRate: bigint, voucherAmount: bigint, pointAmount: bigint, startTime: bigint, endTime: bigint, voucherExpirePeriod: bigint, enabled: boolean): Promise<string>;
    /**
     * 工具：将字符串转为 bytes32
     */
    private stringToBytes32;
    /**
     * 生成商户ID
     * @param merchantName 商户名称或标识符
     * @returns 32字节的商户ID
     */
    generateMerchantId(merchantName: string): string;
    /**
     * 设置商户操作员
     * @param merchantId 商户ID
     * @param operator 操作员地址
     * @returns 操作结果
     */
    setMerchantOperator(merchantId: string, operator: string): Promise<MerchantOperationResult>;
    /**
     * 检查商户操作员权限
     * @param merchantId 商户ID
     * @param operator 操作员地址
     * @returns 权限状态
     */
    checkMerchantOperator(merchantId: string, operator: string): Promise<MerchantOperationResult>;
}
