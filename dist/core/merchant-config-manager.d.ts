import { DelegateConfig, MerchantOperationResult, MerchantContractConfig } from '../types';
import { BlockchainService } from './blockchain';
export declare class MerchantConfigManager extends BlockchainService {
    private contractAddress;
    constructor(config: DelegateConfig);
    /**
     * 创建商家配置
     * @param merchantId 商户ID
     * @param config 商户配置数据
     * @returns 创建结果
     */
    createMerchantConfig(merchantId: string, config: MerchantContractConfig): Promise<MerchantOperationResult>;
    /**
     * 获取商户配置
     * @param merchantId 商户ID
     * @returns 商户配置
     */
    getMerchantConfig(merchantId: string): Promise<MerchantOperationResult>;
}
