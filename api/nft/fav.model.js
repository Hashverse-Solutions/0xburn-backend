'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let fav = new Schema({
  users: { type: Schema.Types.ObjectId, ref: "users" },
  nft: { type: Schema.Types.ObjectId, ref: "nft" },
  chain: { type: Number},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('favItem', fav);
