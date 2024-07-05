'use strict';

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let DAOSchema = new Schema({
  title: { type: String },
  description: { type: String },
  stakeAddressGOV: { type: String, lowercase: true },
  stakeAddressVIP: { type: String, lowercase: true },
  stakeholders: [],
  stakeholderEmails: [],
  proposals: [],
  network: {type: Number},
  daoAddress: { type: String, lowercase: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CIFIDAO', DAOSchema);