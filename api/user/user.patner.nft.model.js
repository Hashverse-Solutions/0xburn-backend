'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
  publicAddress: {type:String, lowercase:true},
  name: {type:String},
  email: {type:String, lowercase:true},
  phone: {type:String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('patnerNFT', UserSchema);
