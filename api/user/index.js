'use strict';

const express = require('express');
const controller = require('./user.controller');
const auth = require('../../auth/auth.service');
const { user } = require('../nft/upload.files');


const router = express.Router();

/**************************        Login   ************************ */
router.get('/getInvestersData', controller.getInvestersData);
router.post('/setInvestersData', controller.setInvestersData);
router.post('/setPatnerNFT', controller.setPatnerNFT);
router.get('/getSeed', controller.getSeeds);
router.post('/setSeed', controller.setSeeds);
router.get('/getPrice', controller.getPrice);

/**************************  User Login  ************************ */

router.get('/getNonce/:publicAddress/:chain', controller.getNonce);
router.post('/loginWithMetaMask', controller.loginWithMetaMask);
router.get('/getUser',auth.isAuthenticated(), controller.getUser);
router.post('/setUser',auth.isAuthenticated(), controller.setUser);
router.post('/updateImage',auth.isAuthenticated(),user.fields([{ name:"user", maxCount:1 }]),controller.setUserImage);
// router.post('/updateImage',auth.isAuthenticated(),user.fields([{ name:"user", maxCount:1 }]),controller.setUserImage);

/**************************  Admin Login  ************************ */
router.get('/getNonceAdmin/:publicAddress/:chain', controller.getNonceAdmin);
router.post('/loginWithMetaMaskAdmin', controller.loginWithMetaMaskAdmin);

/**************************  Whitelist  ************************ */
router.post('/whitelistNFT', controller.whitelistNFT);
router.post('/whitelistSeedPhase', controller.whitelistSeedPhase);


module.exports = router;