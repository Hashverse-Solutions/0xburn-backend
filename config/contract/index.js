const { NODE_ENV } = process.env;
const web3Provider = require('../../utils/web3');

let MarketplaceABI = "", MarketplaceAddress = "", Marketplace = "", TokenABI = "", TokenAddress = "", Token = "", Tokenbytecode = "", ERC721ABI = "", ERC721BYTECODE = "", ERC1155ABI = "", ERC1155BYTECODE = "";
const ERC721 = require(`./${NODE_ENV}/ERC721.json`);

  ERC721ABI = ERC721['abi'];
  ERC721BYTECODE = ERC721['bytecode'];

  module.exports = {
  Marketplace, MarketplaceABI, MarketplaceAddress,
  Token, TokenABI, TokenAddress,
  Tokenbytecode,
  ERC721ABI,ERC721BYTECODE,
  web3Provider
};
