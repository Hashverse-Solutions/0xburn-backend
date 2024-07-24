'use strict';

const express = require('express');
const controller = require('./user.controller');
const auth = require('../../auth/auth.service');


const router = express.Router();

/**************************        Login   ************************ */
router.get('/getInvestersData', controller.getInvestersData);
router.post('/setInvestersData', controller.setInvestersData);
router.post('/setPatnerNFT', controller.setPatnerNFT);
router.get('/getSeed', controller.getSeeds);
router.post('/setSeed', controller.setSeeds);
router.get('/getPrice', controller.getPrice);

module.exports = router;