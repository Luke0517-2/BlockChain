const {Blockchain, Transanction, Block} = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('eeda00ea9fa49caeb7610ec4bdc6362bcffc947223d1658059f063f9145373cb');
const myWalletAddress = myKey.getPublic('hex');

let savjeeCoin = new Blockchain();

const tx1 = new Transanction(myWalletAddress, 'public key goes here', 10);
tx1.signTransactoin(myKey);
savjeeCoin.addTransaction(tx1);

console.log('\n Starting the miner...');
savjeeCoin.minePendingTransactions(myWalletAddress);

console.log('\n Balance of xaviers is', savjeeCoin.getBalanceOfAddress(myWalletAddress));

console.log('Is chain valid?', savjeeCoin.isChainValid());