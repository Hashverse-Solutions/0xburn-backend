'use strict';

const express = require('express');
const router = express.Router();
const controller = require('./nft.controller');
const { collection } = require('./upload.files');
const auth = require('../../auth/auth.service');

/********************** Marketplace Create NFT ***************/
router.post('/createNft', auth.isAuthenticated(), controller.createNft);
router.post('/mintNft721', auth.isAuthenticated(), controller.mintNft721);
router.post('/mintNft1155', auth.isAuthenticated(), controller.mintNft1155);
router.get('/getSingleNft/:_id', auth.isAuthenticated(), controller.getSingleNft);
/********************** User Collections ***************/
router.post('/createCollection',auth.isAuthenticated(),collection.fields([{ name:"background", maxCount:1 },{ name:"profile", maxCount:1 }]),controller.createCollections);
router.get('/getUserCollections',auth.isAuthenticated(),controller.getUserCollections);
router.get('/getUserNft',auth.isAuthenticated(),controller.getUserNft);
router.get('/getSingleCollection/:chain/:tokenAddress',controller.getSingleCollection);
router.get('/getCollectionDetails/:chain/:tokenAddress',controller.getCollectionDetails);
router.get('/explore/:chain',controller.explore);
router.get('/getCollectionName/:chain',controller.getCollectionName);
router.get('/getDetailNft/:id',controller.getDetailNft);
router.post('/listNft',auth.isAuthenticated(),controller.listNft);
router.post('/unListNft',auth.isAuthenticated(),controller.unListNft);
router.post('/transferNft',auth.isAuthenticated(),controller.transferNft);
router.post('/createAuction',auth.isAuthenticated(),controller.createAuction);
router.post('/getAllActivity',controller.getAllActivity);
router.post('/getNftActivity',auth.isAuthenticated(),controller.getNftActivity);
router.post('/placeBid',auth.isAuthenticated(),controller.placeBid);
router.post('/endAuction',auth.isAuthenticated(),controller.endAuction);
router.post('/getBids',auth.isAuthenticated(),controller.getBids);

/********************** get public Collection ***************/
router.get('/getAuctions/:chain',controller.getAuctions);
router.get('/getAllNfts/:chain',controller.getAllNfts);

/********************** Update Collection ***************/
router.post('/updateLogo', auth.isAuthenticated(), collection.fields([{ name: "profile", maxCount: 1 }]), controller.updateLogo);
router.post('/updateBackground', auth.isAuthenticated(), collection.fields([{ name: "background", maxCount: 1 }]), controller.updateBackground);
router.post('/updateCollection', auth.isAuthenticated(), controller.updateCollection);
/********************** User Fav ***************/
router.post('/addRemoveFavItem', auth.isAuthenticated(), controller.addRemoveFavItem);
router.get('/getUserFavItem', auth.isAuthenticated(), controller.getFavItems);

/********************** Validate URL ***************/
router.post('/validateURI', controller.validateURI);

/********************** Categories ***************/
router.post('/setCategory',auth.isAuthenticated(),controller.setCategory);
router.get('/getCategory', controller.getCategory);

module.exports = router;