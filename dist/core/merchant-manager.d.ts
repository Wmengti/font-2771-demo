import { DelegateConfig, MerchantOperationResult } from '../types';
import { BlockchainService } from './blockchain';
export declare class MerchantManager extends BlockchainService {
    private contractAddress;
    constructor(config: DelegateConfig);
    /**
     * 生成商户ID
     * @param merchantName 商户名称或标识符
     * @returns 32字节的商户ID
     */
    generateMerchantId(merchantName: string): string;
    /**
     * 检查操作员权限
     * @param merchantId 商户ID
     * @param operator 操作员地址
     * @returns 是否有权限
     */
    checkOperatorPermission(merchantId: string, operator: string): Promise<MerchantOperationResult>;
    /**
     * 添加操作员权限
     * @param merchantId 商户ID
     * @param operator 操作员地址
     * @returns 操作结果
     */
    addOperator(merchantId: string, operator: string): Promise<MerchantOperationResult>;
    /**
     * 检查商家收款地址
     * @param merchantId 商户ID
     * @returns 收款地址
     */
    checkMerchantAddress(merchantId: string): Promise<MerchantOperationResult>;
    /**
     * 设置商家收款地址
     * @param merchantId 商户ID
     * @param address 收款地址
     * @returns 操作结果
     */
    setMerchantAddress(merchantId: string, address: string): Promise<MerchantOperationResult>;
}
