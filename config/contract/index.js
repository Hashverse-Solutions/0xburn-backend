const { NODE_ENV } = process.env;
const { web3 } = require('../web3');

const MarketplaceData = require(`./${NODE_ENV}/Marketplace.json`);
const TokenData = require(`./${NODE_ENV}/Token.json`);

const networks = {
  0: 'Disconnected',
  1: 'Mainnet',
  4: 'Rinkeby',
  42: 'Kovan',
  19: 'Songbird',
  80001:'Mumbai'
}
const MarketplaceABI = MarketplaceData['abi'];
const MarketplaceAddress = MarketplaceData['address'];
const Marketplace = new web3.eth.Contract(MarketplaceABI, MarketplaceAddress);

const TokenABI = TokenData['abi'];
const TokenAddress = TokenData['address'];
const Token = new web3.eth.Contract(TokenABI, TokenAddress);

const Tokenbytecode = TokenData['bytecode'];

module.exports = {
  Marketplace, MarketplaceABI, MarketplaceAddress,
  Token, TokenABI, TokenAddress,
  web3, Tokenbytecode 
};
