'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let NFTSchema = new Schema({
  tokenAddress: { type: String, lowercase: true },
  bidderAddress: { type: String, lowercase: true },
  nftObjId: { type: String},
  userId: { type: String},
  price: { type: Number },
  chain: { type: Number },
  bidAmount: { type: Number },
  tokenId: { type: Number },
  users: { type: Schema.Types.ObjectId, ref: "users" },
  nft: { type: Schema.Types.ObjectId, ref: "nft" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('bids', NFTSchema);
