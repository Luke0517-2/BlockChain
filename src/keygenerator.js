// this library will allow us to generate a public and private key
// it also has methods to sign something and also a method to verify a signature
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

console.log();
console.log('Private key:', privateKey);
//Private key: eeda00ea9fa49caeb7610ec4bdc6362bcffc947223d1658059f063f9145373cb

console.log();
console.log('Public key:', publicKey);
//Public key: 0472fd5ae4fce764eae4f92284cc1fc5e53134372fc28165942ff4e9bae221a64a4b2e9ac52f09e61f91f2d2b5ca6d3052662084be0d88e3f044df51376caf389b