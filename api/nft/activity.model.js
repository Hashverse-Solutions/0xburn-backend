'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let ActivitySchema = new Schema({
  chain: { type: Number },
  type: { type: String, default: 'erc721' },
  isCollection: { type: Boolean, default: false },
  collectionName: { type: String},
  collectionImage: { type: String},
  collectionAddress: { type: String, lowercase: true },
  address: { type: String, lowercase: true },
  nft: { type: Schema.Types.ObjectId, ref: 'nft' },
  user: { type: Schema.Types.ObjectId, ref: 'users' },
  status: { type: String }, // list // auction // bid // unlist // transfer
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('activity', ActivitySchema);
