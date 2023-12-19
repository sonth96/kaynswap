"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Smart_router__factory = exports.Kayswap_pool__factory = exports.Kayswap_factory__factory = exports.Erc20__factory = exports.factories = void 0;
exports.factories = __importStar(require("./factories"));
var Erc20__factory_1 = require("./factories/kayswap/Erc20__factory");
Object.defineProperty(exports, "Erc20__factory", { enumerable: true, get: function () { return Erc20__factory_1.Erc20__factory; } });
var Kayswap_factory__factory_1 = require("./factories/kayswap/Kayswap_factory__factory");
Object.defineProperty(exports, "Kayswap_factory__factory", { enumerable: true, get: function () { return Kayswap_factory__factory_1.Kayswap_factory__factory; } });
var Kayswap_pool__factory_1 = require("./factories/kayswap/Kayswap_pool__factory");
Object.defineProperty(exports, "Kayswap_pool__factory", { enumerable: true, get: function () { return Kayswap_pool__factory_1.Kayswap_pool__factory; } });
var Smart_router__factory_1 = require("./factories/pancake/Smart_router__factory");
Object.defineProperty(exports, "Smart_router__factory", { enumerable: true, get: function () { return Smart_router__factory_1.Smart_router__factory; } });
