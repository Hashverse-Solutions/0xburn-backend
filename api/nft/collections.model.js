'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let Collections = new Schema({
  tokenAddress: { type: String , lowercase: true},
  publicAddress: { type: String, lowercase: true },
  isVerify: { type: Boolean, default: false },
  collectionName: { type: String, default: null },
  collectionSymbol: { type: String, default: null },
  collectionDesc: { type: String, default: null },
  collectionPrice: { type: Number, default: 0 },
  isMarketplaceCollection: { type: Boolean, default: false },
  profileImage: { type: String, default: null },
  bgImage: { type: String, default: null },
  chain: { type: Number, default: null },
  collectionType: { type: String, default: null },
  tokenType: { type: String, default: null },
  publicAddress: {type:String, lowercase:true},
  baseUri: {type:String},
  totalSypply: {type:String},
  numberOfCopies: {type:String},

  website: {type:String, default: null},
  discord: {type:String, default: null},
  instagram: {type:String, default: null},
  medium: {type:String, default: null},
  telegram: {type:String, default: null},
  ownerAddress: { type: String , lowercase: true},

  users: { type: Schema.Types.ObjectId, ref: "users" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Collections', Collections);
