'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
  nonce: { type: Number },
  chain: { type: Number },
  image: { type: String, default: null },
  name: { type: String, default: null },
  desc: { type: String, default: null },
  facebook: { type: String, default: null },
  twitter: { type: String, default: null },
  discord: { type: String, default: null },
  iswhitelist: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
  language: { type: String, default: 'english' },
  publicAddress: {type:String, lowercase:true},
  tokenAddress: {type:String, lowercase:true},
  investedAmount: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  email: {type:String, lowercase:true},
  phone: {type:String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Users', UserSchema);
