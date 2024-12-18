/**
 * Proof-of-Work 因為不想隨意創造block
 * 使用Block.mineBlock(difficulty) 給定hash的規則，不符合規則就變換，重複計算
 * 小問題原本資料都不能更動，給定常數(nonce)，利用他的變化重新計算hash
 * difficulty越高，產生時間越久
 */

const SHA256 = require('crypto-js/sha256')

class Block{
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this.hash)
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }

    createGenesisBlock(){
        return new Block(0, "12/17/2024", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i -1];

            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

let savjeeCoin = new Blockchain();

console.log('Mining block 1...');
savjeeCoin.addBlock(new Block(1, "10/17/2024", { amount: 4 }));

console.log('Mining block 2...');
savjeeCoin.addBlock(new Block(1, "11/17/2024", { amount: 10 }));
/**
 * Mining block 1...
 * Block mined: 004b3797259d4a4d94cda244afd36dc0c5121cf728dd066d0373c9b44b3b3c01
 * Mining block 2...
 * Block mined: 002e1bfc70f77e1340a62b139262b28ae9154aae1ef3b56a673bd2e8515541f2
 */

// difficulty越高，產生時間越久

