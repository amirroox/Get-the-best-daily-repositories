"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.swap = void 0;
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const web3_js_1 = require("@solana/web3.js");
const send_transaction_1 = require("./send_transaction");
function swap(connection, poolKeys, ownerKeypair, tokenAccounts, is_snipe, amountIn, minAmountOut) {
    return __awaiter(this, void 0, void 0, function* () {
        const owner = ownerKeypair.publicKey;
        const inst = yield raydium_sdk_1.Liquidity.makeSwapInstructionSimple({
            connection: connection,
            poolKeys: poolKeys,
            userKeys: {
                tokenAccounts,
                owner,
            },
            amountIn,
            amountOut: minAmountOut,
            fixedSide: 'in',
            config: {}
        });
        //@ts-ignore
        //const instructions = inst.innerTransactions[0].instructions[0];
        //console.log(inst.innerTransactions);
        //console.log(inst.innerTransactions[0]);
        //console.log(inst.innerTransactions[0].signers)
        const tx = new web3_js_1.Transaction();
        const signers = [ownerKeypair];
        inst.innerTransactions[0].instructions.forEach(e => {
            tx.add(e);
        });
        inst.innerTransactions[0].signers.forEach(e => {
            signers.push(e);
        });
        const res = yield (0, send_transaction_1.sendTx)(connection, tx, signers);
        return res;
    });
}
exports.swap = swap;
