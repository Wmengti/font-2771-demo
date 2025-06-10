export declare const UnifiedVaultContractAddress: `0x${string}`;
export declare const UNIFIED_VAULT_ABI: ({
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    name?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        components: ({
            internalType: string;
            name: string;
            type: string;
            components?: undefined;
        } | {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        })[];
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
} | {
    inputs: ({
        internalType: string;
        name: string;
        type: string;
        components?: undefined;
    } | {
        components: ({
            internalType: string;
            name: string;
            type: string;
            components?: undefined;
        } | {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        })[];
        internalType: string;
        name: string;
        type: string;
    })[];
    name: string;
    outputs: never[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
export declare const paymentContractAddress: `0x${string}`;
export declare const PAYMENT_CONTRACT_ABI: ({
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    name?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
export declare const ERC2771_FORWARDER_ABI: ({
    inputs: never[];
    stateMutability: string;
    type: string;
    name?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    anonymous?: undefined;
    outputs?: undefined;
} | {
    anonymous: boolean;
    inputs: {
        indexed: boolean;
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    type: string;
    stateMutability?: undefined;
    outputs?: undefined;
} | {
    inputs: ({
        components: {
            internalType: string;
            name: string;
            type: string;
        }[];
        internalType: string;
        name: string;
        type: string;
    } | {
        internalType: string;
        name: string;
        type: string;
        components?: undefined;
    })[];
    name: string;
    outputs: never[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
} | {
    inputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
} | {
    inputs: {
        components: {
            internalType: string;
            name: string;
            type: string;
        }[];
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
    anonymous?: undefined;
})[];
export declare const erc2771ForwarderAddress: `0x${string}`;
export declare const EIP712_DOMAIN_HASH: `0x${string}`;
export declare const FORWARD_REQUEST_TYPEHASH: `0x${string}`;
export declare const EIP712_DOMAIN_TYPE: {
    name: string;
    type: string;
}[];
export declare const FORWARD_REQUEST_TYPES: {
    ForwardRequest: {
        name: string;
        type: string;
    }[];
};
export declare const contract7702Address: `0x${string}`;
export declare const erc20Address: `0x${string}`;
export declare const contract7702Abi: readonly [{
    readonly inputs: readonly [];
    readonly name: "nonce";
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly components: readonly [{
            readonly type: "bytes";
            readonly name: "data";
        }, {
            readonly type: "address";
            readonly name: "to";
        }, {
            readonly type: "uint256";
            readonly name: "value";
        }];
        readonly type: "tuple[]";
    }, {
        readonly type: "bytes";
        readonly name: "signature";
    }];
    readonly name: "executeSponsor";
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}];
export declare const ERC20_ABI: readonly [{
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "to";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly name: "transfer";
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "owner";
    }, {
        readonly type: "address";
        readonly name: "spender";
    }];
    readonly name: "allowance";
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "spender";
    }, {
        readonly type: "uint256";
        readonly name: "amount";
    }];
    readonly name: "approve";
    readonly outputs: readonly [{
        readonly type: "bool";
    }];
    readonly stateMutability: "nonpayable";
    readonly type: "function";
}, {
    readonly inputs: readonly [{
        readonly type: "address";
        readonly name: "account";
    }];
    readonly name: "balanceOf";
    readonly outputs: readonly [{
        readonly type: "uint256";
    }];
    readonly stateMutability: "view";
    readonly type: "function";
}];
