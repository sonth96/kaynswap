"use strict";
/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Erc20__factory = void 0;
const ethers_1 = require("ethers");
const _abi = [
    {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_spender",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "approve",
        outputs: [
            {
                name: "success",
                type: "bool",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_from",
                type: "address",
            },
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "transferFrom",
        outputs: [
            {
                name: "success",
                type: "bool",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [
            {
                name: "",
                type: "uint8",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "version",
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_owner",
                type: "address",
            },
        ],
        name: "balanceOf",
        outputs: [
            {
                name: "balance",
                type: "uint256",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
            {
                name: "",
                type: "string",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_to",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
        ],
        name: "transfer",
        outputs: [
            {
                name: "success",
                type: "bool",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: false,
        inputs: [
            {
                name: "_spender",
                type: "address",
            },
            {
                name: "_value",
                type: "uint256",
            },
            {
                name: "_extraData",
                type: "bytes",
            },
        ],
        name: "approveAndCall",
        outputs: [
            {
                name: "success",
                type: "bool",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        constant: true,
        inputs: [
            {
                name: "_owner",
                type: "address",
            },
            {
                name: "_spender",
                type: "address",
            },
        ],
        name: "allowance",
        outputs: [
            {
                name: "remaining",
                type: "uint256",
            },
        ],
        payable: false,
        type: "function",
    },
    {
        payable: false,
        type: "fallback",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_from",
                type: "address",
            },
            {
                indexed: true,
                name: "_to",
                type: "address",
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256",
            },
        ],
        name: "Transfer",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                name: "_owner",
                type: "address",
            },
            {
                indexed: true,
                name: "_spender",
                type: "address",
            },
            {
                indexed: false,
                name: "_value",
                type: "uint256",
            },
        ],
        name: "Approval",
        type: "event",
    },
];
class Erc20__factory {
    static createInterface() {
        return new ethers_1.Interface(_abi);
    }
    static connect(address, runner) {
        return new ethers_1.Contract(address, _abi, runner);
    }
}
exports.Erc20__factory = Erc20__factory;
Erc20__factory.abi = _abi;