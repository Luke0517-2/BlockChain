/**
 * 簡單實作區塊鍊
 */

const SHA256 = require('crypto-js/sha256')

class Block{
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock(){
        return new Block(0, "12/17/2024", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
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
savjeeCoin.addBlock(new Block(1, "10/17/2024", { amount: 4 }));
savjeeCoin.addBlock(new Block(1, "11/17/2024", { amount: 10 }));

console.log(JSON.stringify(savjeeCoin, null, 4));
/**
 * {
 *     "chain": [
 *         {
 *             "index": 0,
 *             "timestamp": "12/17/2024",
 *             "data": "Genesis block",
 *             "previousHash": "0",
 *             "hash": "8ba4de1421c4ecb1ebc97b5a181601e3306400e37585f0494dc528af470431f6"
 *         },
 *         {
 *             "index": 1,
 *             "timestamp": "10/17/2024",
 *             "data": {
 *                 "amount": 4
 *             },
 *             "previousHash": "8ba4de1421c4ecb1ebc97b5a181601e3306400e37585f0494dc528af470431f6",
 *             "hash": "6cf03754034f208caaa56f116698fb557b9bb773d73b8a7d4c769b6f921fb330"
 *         },
 *         {
 *             "index": 1,
 *             "timestamp": "11/17/2024",
 *             "data": {
 *                 "amount": 10
 *             },
 *             "previousHash": "6cf03754034f208caaa56f116698fb557b9bb773d73b8a7d4c769b6f921fb330",
 *             "hash": "33ec90d11004121cc59652f1006eea76d2913f7fa05312dbab9d81d0b066deac"
 *         }
 *     ]
 * }
 */

console.log("Is blockchain valid? " + savjeeCoin.isChainValid())
/** true */

savjeeCoin.chain[1].data = {amount: 100};

console.log("Is blockchain valid? " + savjeeCoin.isChainValid())
/** false 因為hash不同*/

savjeeCoin.chain[1].hash = savjeeCoin.chain[1].calculateHash();
console.log("Is blockchain valid? " + savjeeCoin.isChainValid())
/** false 因為下一個reference這個hash失敗*/

