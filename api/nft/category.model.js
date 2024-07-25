'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let ActivitySchema = new Schema({
  category: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'users' },
  status: { type: String }, // list // auction // bid // unlist // transfer
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('category', ActivitySchema);
