'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let NFTSchema = new Schema({
  nftId: { type: Number },
  price: { type: Number, default:0 },
  isSold: { type: Boolean, default: false },
  rePrice: { type: Boolean, default: false },
  isMarketItem: { type: Boolean, default: false },
  isMarketplaceNFT: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  isRequired0xBurn:{ type: Boolean, default: false },
  publicAddress: { type: String, lowercase: true },
  tokenAddress: { type: String, lowercase: true },
  owner: { type: String, lowercase: true },
  seller: { type: String, lowercase: true },
  title: { type: String },
  desc: { type: String },
  image: { type: String },
  chain: { type: Number, default: null },
  metadataUri: { type: String },
  isBidding: { type: Boolean, default: false },
  bidAmount: { type: Number, default: 0},
  bidTime: { type: Number },
  startTime: { type: Number },
  bidder: { type: String },
  totalBids: { type: Number, default:0 },
  bids: { type: Schema.Types.ObjectId, ref: "bids" },
  collectionType: { type: String },
  status:{ type: String,default:"buy" }, // buy, sell, auction
  totalFav:{ type: Number,default:0},
  mintAmount: { type: Number, default: 0 },
  listAmount: { type: Number, default: 0 },
  attributes: [],
  tokenType: { type: String, default:"erc721" },
  users: { type: Schema.Types.ObjectId, ref: "users" },
  collections: { type: Schema.Types.ObjectId, ref: "Collections" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('nft', NFTSchema);
