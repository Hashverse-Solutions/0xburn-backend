const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
const provider = new HDWalletProvider(
  process['env']['MNEMONIC'],
  process['env']['INFURA_API_KEY'],
  0
);

let web3 = new Web3(provider);

module.exports = { web3 };
