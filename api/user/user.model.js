'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
  publicAddress: {type:String, lowercase:true},
  tokenAddress: {type:String, lowercase:true},
  investedAmount: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
