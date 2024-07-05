'use strict';

const express = require('express');
const collections = require('./user.controller');

const router = express.Router();

/*********** CIFI DAO ************/
router.get('/getOxBurnDAO', collections.getOxBurnDAO);
router.post('/sendEmailOxBurn', collections.sendEmailOxBurn);
router.post('/addOxBurnProposal', collections.addOxBurnProposal);
router.post('/getOxBurnProposals', collections.getOxBurnProposals);


module.exports = router;