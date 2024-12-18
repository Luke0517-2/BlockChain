/**
 * 數位簽章的目的是：
 * 驗證交易的真實性：只有擁有正確私鑰的人（也就是交易發送者）才能產生正確的簽章。
 * 保證交易未被篡改：一旦交易的內容（例如金額或地址）改變，雜湊值就會不同，簽章驗證就會失敗。
 * 
 * 簽章的特點：
 * 只有持有私鑰的人能產生這個簽章。
 * 任何人都可以用對應的公鑰來驗證這個簽章是否有效。
 */

/**
 * DER 格式是什麼？
 * DER（Distinguished Encoding Rules） 是一種用於編碼資料的標準格式，特別常用在數位簽章和**公鑰基礎設施（PKI）**中。
 * DER 格式將數位簽章編碼成一種固定格式，結構嚴謹且容易解析。
 * DER 編碼後的簽章可以轉換成 十六進位字串（hex）方便儲存與傳輸
 * 
 * 假設簽章本身是二進位格式（例如 010101001100）：
 * 原始二進位格式：
 * 不易讀，也不容易直接儲存或傳輸。
 * DER 格式轉換（十六進位表示）：
 * 3045022100abcd1234ef5678900221000987abcd567890ff.
 * 這是一串純文字，容易儲存和傳輸，且可以被標準加密工具還原解析。
 */

/**
 * 公鑰不直接「驗證簽章」本身，而是用簽章來還原出原始的雜湊值，並與當前重新計算的雜湊值進行比較
 * For:
 * 保證交易內容未被修改。
 * 保證簽章是由正確的私鑰生成的。
 */

const SHA256 = require('crypto-js/sha256')
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const stableStringify = require('json-stable-stringify');

class Transanction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransactoin(signingKey){
        // 這行是安全檢查，確保傳入的私鑰（signingKey）對應的公鑰與 fromAddress 相同
        if(signingKey.getPublic('hex') !== this.fromAddress){
            // 如果不同，表示嘗試簽署不屬於自己的交易
            throw new Error('You cannot sign transactions for other wallet!');
        }

        const hashTx = this.calculateHash();
        // 用提供的私鑰簽署交易雜湊值，產生一個數位簽章。
        const sig = signingKey.sign(hashTx, 'base64');
        // 將簽章轉換成 DER 格式的十六進位字串，方便儲存與傳輸。
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        // 檢查交易是否有數位簽章，如果沒有簽章，拋出錯誤
        if(!this.signature || this.signature.length === 0){
            throw new Error("No signature in this transaction");
        }

        // 從 fromAddress 中取得公鑰。這一步假設 fromAddress 是公鑰的十六進位字串表示。
        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        // 用公鑰驗證交易的雜湊值（calculateHash()）和簽章（this.signature）
        // process 1.驗證者重新計算雜湊值（hash2）：SHA256("A" + "B" + 100)。 2.用公鑰解密數位簽章，得到發送者簽署時的雜湊值 hash1。 3.比較 hash1 和 hash2 是否相等
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

class Block{
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.previousHash + this.timestamp + stableStringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash)
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock(){
        return new Block(Date.parse("12/17/2024"), [], "0"); 
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        const rewardTx = new Transanction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [];
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error("Transaction must include from and to address");
        }

        if(!transaction.isValid()){
            throw new Error("Cannot add invalid transaction to chain");
        }

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i -1];

            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.calculateHash()) {
                //這邊有發現小bug，對於第一個區塊 Block的建構子順序 this.hash = this.calculateHash();要放在最後，不然nonce會先得到undefined去計算
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transanction = Transanction;