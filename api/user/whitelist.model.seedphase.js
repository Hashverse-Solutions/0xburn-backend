'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
  name: { type: String, default: null },
  publicAddress: {type:String, lowercase:true},
  email: {type:String, lowercase:true},
  phone: {type:String},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('seedphaseWhitelist', UserSchema);
