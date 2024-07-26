'use strict';
const helper = require("./helper");
const favModel = require('./fav.model');
const nftModel = require('./nft.model');
const bidsModel = require('./bids.model');
const uploadFiles = require('./upload.files');
const usersModels = require('../user/user.model');
const activityModel = require('./activity.model');
const collectionsModels = require('./collections.model');
const categoryModels = require('./category.model');
const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');
const { ERC1155ABI, ERC721ABI, web3Provider } = require("../../config/contract");



/**** Create Nft 721 ****/
exports.createNft = async (req, res) => {
  try {
    let data = req['body'];
    let { publicAddress, _id } = req['user'];
    let { tokenAddress, nftId, price, title, desc, image, metadataUri, chain, collectionType, attributes } = data
    let required = ['metadataUri', 'image', 'tokenAddress', 'nftId'];
    for (let key of required)
      if (!data[key] || data[key] == '' || data[key] == undefined || data[key] == null)
        return errReturned(res, `Please Provide ${key}`);

    let now = Date.now();
    tokenAddress = tokenAddress.toLowerCase();
    publicAddress = publicAddress.toLowerCase();
    let findCollection = await collectionsModels.findOne({ $and: [{ isMarketplaceCollection: true }, { tokenAddress }] });
    if (findCollection) {
      let create = await nftModel.create({ attributes, isMarketplaceNFT: true, tokenAddress, price, nftId, title, desc, image, metadataUri, chain, collections: findCollection['_id'], users: _id, collectionType });
      await activityModel.create({ chain, type: "erc721", address: publicAddress, user: _id, collectionAddress:tokenAddress, nft: create['_id'], status: "Create NFT", createdAt: now });
      return sendResponse(res, SUCCESS, 'NFT Created Successfully', create);
    }
    return sendResponse(res, BADREQUEST, 'NFT Not Created');
  } catch (error) { errReturned(res, error); }
}

/**** Mint Nft 721 ****/
exports.mintNft721 = async (req, res) => {
  try {
    let data = req['body'];
    let { publicAddress, _id, chain } = req['user'];
    let { tokenAddress, count, price } = data
    let required = ['tokenAddress', 'count'];
    for (let key of required)
      if (!data[key] || data[key] == '' || data[key] == undefined || data[key] == null)
        return errReturned(res, `Please provide ${key}`);

    let now = Date.now();
    tokenAddress = tokenAddress.toLowerCase();
    publicAddress = publicAddress.toLowerCase();
    let web3 = await web3Provider(Number(chain));
    let Token = new web3.eth.Contract(ERC721ABI, tokenAddress);
    let findCollection = await collectionsModels.findOne({ $and: [{ isMarketplaceCollection: false }, { tokenAddress }] });
    if (!findCollection) return sendResponse(res, BADREQUEST, 'Collection Not Found', findCollection);
    for (let index = 0; index < count.length; index++) {
      const element = count[index];
      let tokenURI = await Token.methods.tokenURI(element).call();
      if(tokenURI.split("/")[2] == 'gateway.pinata.cloud'){
        const parts = tokenURI.split(`/${element}`);
        const newUrl = parts[0];
        tokenURI = newUrl;
      }
      let ipfs = await helper.getIPFSData(tokenURI);
      let metadataUri = tokenURI;
      let nftId = element;
      let title = ipfs['name'] ? ipfs['name'] : ipfs['Title'] ? ipfs['Title'] : ipfs['title'] ? ipfs['title'] : "";
      let desc = ipfs['description'] ? ipfs['description'] : ipfs['Description'] ? ipfs['Description'] : "";
      let image = ipfs['image'] ? ipfs['image'] : ipfs['Image'] ? ipfs['Image'] : "";
      // let attributes = ipfs['attributes'].length > 0 ? ipfs['attributes'] : [];
      let createNFT = await nftModel.create({isMarketplaceNFT: false, tokenAddress, tokenType: findCollection['tokenType'], price, nftId, title, desc, image, metadataUri, chain, collections: findCollection['_id'], users: _id, collectionType: findCollection['collectionType'] });
      await activityModel.create({ chain, type: "erc721", address: publicAddress, user: _id, collectionAddress:tokenAddress, nft: createNFT['_id'], status: "Mint", createdAt: now });
    }
    return sendResponse(res, SUCCESS, 'NFT Mint Successfully');
  } catch (error) { errReturned(res, error); }
}

/**** Mint Nft 1155 ****/
exports.mintNft1155 = async (req, res) => {
  try {
    let data = req['body'];
    let { publicAddress, _id, chain } = req['user'];
    let { tokenAddress, mintAmount, price } = data
    let required = ['tokenAddress', 'mintAmount'];
    for (let key of required)
      if (!data[key] || data[key] == '' || data[key] == undefined || data[key] == null)
        return errReturned(res, `Please provide ${key}`);

    let now = Date.now();
    tokenAddress = tokenAddress.toLowerCase();
    publicAddress = publicAddress.toLowerCase();
    let web3 = await web3Provider(Number(chain));
    let Token = new web3.eth.Contract(ERC1155ABI, tokenAddress);
    let metadataUri = await Token.methods.baseURI().call();
    let findCollection = await collectionsModels.findOne({ $and: [{ isMarketplaceCollection: false }, { tokenAddress }] });
    if (findCollection) {
      let findNFT = await nftModel.findOne({ $and: [{ users: _id }, { tokenAddress }, { chain }] })
      if (!findNFT) {
        let create = await nftModel.create({ isMarketplaceNFT: false, tokenAddress, tokenType: findCollection['tokenType'], price, chain, collections: findCollection['_id'], users: _id, collectionType: findCollection['collectionType'] });
        let ipfs = await helper.getIPFSData(metadataUri);
        if (ipfs) {
          let nftId = 1;
          let title = ipfs['name'] ? ipfs['name'] : ipfs['Title'] ? ipfs['Title'] : ipfs['title'] ? ipfs['title'] : "";
          let desc = ipfs['description'] ? ipfs['description'] : ipfs['Description'] ? ipfs['Description'] : "";
          let image = ipfs['image'] ? ipfs['image'] : ipfs['Image'] ? ipfs['Image'] : "";
          // let attributes = ipfs['attributes'].length > 0 ? ipfs['attributes'] : [];
          let createNFT = await nftModel.updateOne({ _id: create['_id'] }, { nftId, mintAmount, title, desc, image, metadataUri, price });
          await activityModel.create({ chain, type: "erc1155", address: publicAddress, user: _id, collectionAddress:tokenAddress, nft: create['_id'], status: "Mint", createdAt: now });
          return sendResponse(res, SUCCESS, 'NFT Mint Successfully', create);
        }

      } else {
        let ipfs = await helper.getIPFSData(metadataUri);
        if (ipfs) {
          let nftId = 1;
          let title = ipfs['name'] ? ipfs['name'] : ipfs['Title'];
          let desc = ipfs['description'] ? ipfs['description'] : ipfs['Description'];
          let image = ipfs['image'] ? ipfs['image'] : ipfs['Image'];
          // let attributes = ipfs['attributes'].length > 0 ? ipfs['attributes'] : [];
          let create = await nftModel.updateOne({ _id: findNFT['_id'] }, { nftId, mintAmount: (Number(findNFT['mintAmount']) + Number(mintAmount)), title, desc, image, metadataUri, price });
          await activityModel.create({ chain, type: "erc1155", address: publicAddress, user: _id, collectionAddress:tokenAddress, nft: findNFT['_id'], status: "Mint", createdAt: now });
          return sendResponse(res, SUCCESS, 'NFT Mint Successfully', create);
        }
      }
    }
    return sendResponse(res, BADREQUEST, 'Collection Not Found');
  } catch (error) { 
    errReturned(res, error); 
}
}

/**** Get Single Nft ****/
exports.getSingleNft = async (req, res) => {
  try {
    let { _id } = req['params'];
    let findCollection = await nftModel.findOne({ _id }).populate("user");
    if (findCollection) return sendResponse(res, SUCCESS, 'NFT Found', findCollection);
    return sendResponse(res, BADREQUEST, 'NFT Not Found', []);
  } catch (error) { errReturned(res, error); }
}

/**** Create Collections ****/
exports.createCollections = async (req, res) => {
  try {
    let { publicAddress, _id, chain } = req['user'];
    let { background, profile } = req['files'];
    let data = req['body'];
    let required = ['collectionType', 'collectionName', 'collectionDesc', 'collectionSymbol', 'tokenType', 'ownerAddress'];
    for (let key of required)
      if (!data[key] || data[key] == '' || data[key] == undefined || data[key] == null)
        return errReturned(res, `Please provide ${key}`);

    let now = Date.now();
    await collectionsModels.create({ ...data, profileImage: profile[0]['location'], bgImage: background[0]['location'], users: _id, publicAddress });
    await activityModel.create({ chain,collectionName:data['collectionName'],collectionImage:profile[0]['location'], type: data['tokenType'], address: publicAddress, user: _id, collectionAddress:data['tokenAddress'], status: "Create Collection",isCollection:true, createdAt: now });
    let findCollections = await collectionsModels.find({ $and: [{ publicAddress }, { users: _id }] }).populate("user")
    return sendResponse(res, SUCCESS, 'Collection Created', findCollections);
  } catch (error) { errReturned(res, error); }
}

/**** User Collections ****/
exports.getUserCollections = async (req, res) => {
  try {
    let { publicAddress, _id, chain } = req['user'];
    let findCollections = await collectionsModels.find({ $and: [{ publicAddress }, { users: _id }, { chain }] }).populate("user")
    if (findCollections) return sendResponse(res, SUCCESS, 'Collection Found', findCollections);
    return sendResponse(res, BADREQUEST, 'Collection Not Found', []);
  } catch (error) { errReturned(res, error); }
}

/**** Single Collection ****/
exports.getSingleCollection = async (req, res) => {
  try {
    let { tokenAddress, chain } = req['params'];
    tokenAddress = tokenAddress.toLowerCase();
    let findCollections = await collectionsModels.findOne({ $and: [{ tokenAddress }, { chain }] }).populate("user")
    if (findCollections) return sendResponse(res, SUCCESS, 'Collection Found', findCollections);
    return sendResponse(res, BADREQUEST, 'Collection Not Found', []);
  } catch (error) { errReturned(res, error); }
}

/**** Collection Details ****/
exports.getCollectionDetails = async (req, res) => {
  try {
    let { tokenAddress, chain } = req['params'];
    tokenAddress = tokenAddress.toLowerCase();
    let collectionDetail = await collectionsModels.findOne({ $and: [{ tokenAddress }, { chain }] }).populate("user");
    console.log(collectionDetail)
    let nfts = await nftModel.find({ $and: [{ tokenAddress }, { chain }] }).populate("user")
    if (collectionDetail || nfts.length > 0) {
      return sendResponse(res, SUCCESS, 'Collection Found', { nfts, collectionDetail });
    }
    return sendResponse(res, BADREQUEST, 'Collection Not Found', []);
  } catch (error) { errReturned(res, error); }
}

/**** User Nft ****/
exports.getUserNft = async (req, res) => {
  let { publicAddress, _id, chain } = req['user'];
  publicAddress = publicAddress.toLowerCase();
  let nfts = await nftModel.find({ $and: [{ users: _id }, { chain }] }).populate("user")
  if (nfts.length > 0) {
    return sendResponse(res, SUCCESS, 'NFT Found', nfts);
  }
  return sendResponse(res, BADREQUEST, 'NFT Not Found', []);
}

/**** Explore ****/
exports.explore = async (req, res) => {
  try {

    // Get the filter criteria from the query parameters (assuming frontend sends data in query parameters)
    const {chain} = req['params'];
    // Query the database with the filter criteria
    let nfts = await nftModel.find({chain}).populate("user").populate("collections");
    if (nfts.length > 0){
      let newArray = []
      for (let index = 0; index < nfts.length; index++) {
        const element = nfts[index];
        if(element['mintAmount'] !== 0 && element['tokenType'] == "erc1155") newArray.push(element)
        if(element['tokenType'] == "erc721") newArray.push(element)
      }
      return sendResponse(res, SUCCESS, 'NFT Found', newArray);
    }
    return sendResponse(res, BADREQUEST, 'NFT Not Found');

  } catch (error) { errReturned(res, error); }
}


/**** Get Collections Names ****/
exports.getCollectionName = async (req, res) => {
  try {
    let {chain} = req['params']
    let collectionDetail = await collectionsModels.find({$and:[{chain},{isMarketplaceCollection:false}]}).populate("user");
    if (collectionDetail) {
      return sendResponse(res, SUCCESS, 'Collection Found', collectionDetail);
    }
    return sendResponse(res, BADREQUEST, 'Collection Not Found', []);
  } catch (error) { errReturned(res, error); }
}

/**** Remove / Add Fav Items ****/
exports.addRemoveFavItem = async (req, res) => {
  try {
    let { _id, chain } = req['user'];
    let { nftId } = req['body']
    let nftDetail = await nftModel.findOne({ _id: nftId });
    if (nftDetail) {
      let findFav = await favModel.findOne({ $and: [{ users: _id }, { nft: nftId }] });
      if (findFav) {
        await favModel.remove({ $and: [{ users: _id }, { nft: nftId }, { chain }] });
        await nftModel.updateOne({ _id: nftId }, { totalFav: parseInt(nftDetail['totalFav'] - 1) });
        let findFav = await favModel.find({ $and: [{ users: _id }, { chain }] });
        return sendResponse(res, SUCCESS, 'Remove Item From Favourite', findFav);
      }
      else {
        let fav = 0;
        if (nftDetail['totalFav']) fav = parseInt(nftDetail['totalFav']);
        await favModel.create({ users: _id, nft: nftId, chain });
        await nftModel.updateOne({ _id: nftId }, { totalFav: parseInt(fav + 1) });
        let findFav = await favModel.find({ $and: [{ users: _id }, { chain }] });
        return sendResponse(res, SUCCESS, 'Add Item in Favourite', findFav);
      }
    }
    return sendResponse(res, BADREQUEST, 'Item Not Added into Favourite', []);
  } catch (error) { errReturned(res, error); }
}

/**** Get Fav Items ****/
exports.getFavItems = async (req, res) => {
  try {
    let { _id, chain } = req['user'];
    let findFav = await favModel.find({ $and: [{ users: _id }, { chain }] }).populate("nft");
    if (findFav.length == 0) return sendResponse(res, BADREQUEST, 'You Have Enought Favourite Items');
    return sendResponse(res, SUCCESS, 'Get Favourite Items', findFav);
  } catch (error) { errReturned(res, error); }
}

/**** Get Details Nfts ****/
exports.getDetailNft = async (req, res) => {
  try {
    let { id } = req['params'];
    let getNFT = await nftModel.findOne({ _id: id }).populate("bids").populate("user").populate("collections");
    if (getNFT) return sendResponse(res, SUCCESS, 'NFT Found', getNFT);
    return sendResponse(res, BADREQUEST, 'NFT Not Found');
  } catch (error) { errReturned(res, error); }
}

/**** List Nfts ****/
exports.listNft = async (req, res) => {
  try {
    let { nftObjId, price, listAmount } = req['body'];
    let { _id } = req['user'];
    let now = Date.now();
    let getNFT = await nftModel.findOne({ $and: [{ _id: nftObjId }, { users: _id }] }).populate("user");
    if (getNFT) {
      if (getNFT['tokenType'] == "erc721") {
        await nftModel.updateOne({ _id: nftObjId }, { price, isMarketItem: true, status: "buy" });
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "list", createdAt: now });
        return sendResponse(res, SUCCESS, 'List NFT Successfully', getNFT);
      }
      else if (getNFT['tokenType'] == "erc1155") {
        await nftModel.updateOne({ _id: nftObjId }, { price, listAmount, isMarketItem: true, status: "buy" });
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "list", createdAt: now });
        return sendResponse(res, SUCCESS, 'List NFT Successfully', getNFT);
      }
    }
    return sendResponse(res, BADREQUEST, 'NFT Not Found');
  } catch (error) { errReturned(res, error); }
}

/**** Unlist Nfts ****/
exports.unListNft = async (req, res) => {
  try {
    let { nftObjId } = req['body'];
    let { _id } = req['user'];
    let now = Date.now();
    let getNFT = await nftModel.findOne({ $and: [{ _id: nftObjId }, { users: _id }] }).populate("user");
    if (getNFT) {
      if (getNFT['tokenType'] == "erc721") {
        await nftModel.updateOne({ _id: nftObjId }, { isMarketItem: false });
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "unlist", createdAt: now });
        return sendResponse(res, SUCCESS, 'Unlist NFT Successfully', getNFT);
      }
      else if (getNFT['tokenType'] == "erc1155") {
        await nftModel.updateOne({ _id: nftObjId }, { listAmount: 0, isMarketItem: false });
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "unlist", createdAt: now });
        return sendResponse(res, SUCCESS, 'Unlist NFT Successfully', getNFT);
      }
    }
    return sendResponse(res, BADREQUEST, 'NFT Not Found');
  } catch (error) { errReturned(res, error); }
}

/**** Create Auction ****/
exports.createAuction = async (req, res) => {
  try {
    let { price, nftObjId, bidAmount, bidTime, startTime } = req['body'];
    let { _id } = req['user'];
    let now = Date.now();
    let getNFT = await nftModel.findOne({ $and: [{ _id: nftObjId }, { users: _id }] });
    if (!getNFT) return sendResponse(res, BADREQUEST, 'NFT Not Found');
    await nftModel.updateOne({ _id: nftObjId }, { price, bidAmount, bidTime, isMarketItem: true, status: "auction", startTime });
    getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
    await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "auction", createdAt: now });
    return sendResponse(res, SUCCESS, 'Create Auction Successfully', getNFT);
  } catch (error) { errReturned(res, error); }
}

/**** Place Bid ****/
exports.placeBid = async (req, res) => {
  try {
    let { nftObjId, price, bidderAddress } = req['body'];
    let { _id, chain } = req['user'];
    let now = Date.now();
    bidderAddress = bidderAddress.toLowerCase();
    let totalBids = 1;
    let getNFT = await nftModel.findOne({ _id: nftObjId });
    if (!getNFT) return sendResponse(res, BADREQUEST, 'NFT Not Found');
    let bidder = await bidsModel.create({ bidderAddress, nftObjId, chain, price, tokenAddress: getNFT['tokenAddress'], bidAmount: getNFT['bidAmount'], tokenId: getNFT['nftId'], userId: _id, users: _id, nft: nftObjId })
    if (getNFT['totalBids'] !== 0) totalBids = parseInt(totalBids + getNFT['totalBids']);
    await nftModel.updateOne({ _id: nftObjId }, { price, bids: bidder['_id'], totalBids, bidder: bidderAddress });
    getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
    await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: bidderAddress, user: _id, nft: nftObjId, status: "bid", createdAt: now });
    return sendResponse(res, SUCCESS, 'Bid Successfully', getNFT);
  } catch (error) { errReturned(res, error); }
}

/**** Get All Activity Filtered By Chain ****/
exports.getAllActivity = async (req, res) => {
  try {
    let { chain } = req['body'];
    chain = parseInt(chain);
    let getNFT = await activityModel.find({ chain }).sort({ _id: -1 }).populate("nft").populate('user');
    if (getNFT.length > 0) {
      return sendResponse(res, SUCCESS, 'Activity Fetched Successfully', getNFT);
    } else { return sendResponse(res, BADREQUEST, 'NFT Not Found'); }
  } catch (error) { errReturned(res, error); }
}

/**** Get Individual Activity ****/
exports.getNftActivity = async (req, res) => {
  try {
    let { nftObjId } = req['body'];
    let getNFT = await activityModel.findOne({ nft: nftObjId });
    if (getNFT.length > 0) {
      return sendResponse(res, SUCCESS, 'Activity Fetched Successfully', getNFT);
    } else {
      return sendResponse(res, BADREQUEST, 'NFT Not Found');
    }
  } catch (error) { errReturned(res, error); }
}

/**** Get Bid ****/
exports.getBids = async (req, res) => {
  try {
    let { nftObjId } = req['body'];
    let { chain } = req['user'];
    let getBids = await bidsModel.find({ $and: [{ chain }, { nftObjId }] }).populate("user");
    if (getBids.length > 0) return sendResponse(res, SUCCESS, 'Bids Found', getBids);
    return sendResponse(res, BADREQUEST, 'Bids Not Found');
  } catch (error) { errReturned(res, error); }
}

/**** Get Auction ****/
exports.getAuctions = async (req, res) => {
  try {
    let { chain } = req['params'];
    let getNFTs = await nftModel.find({ $and: [{ chain }, { status: "auction" }, { isMarketItem: true }] }).populate("user").populate("collections");
    if (getNFTs.length > 0){
      let newIds = [];
      for (let index = 0; index < getNFTs.length; index++) {
        const element = getNFTs[index];
        if(element['tokenType'] == "erc1155" && element['mintAmount'] != 0) newIds.push(element)
        else if(element['tokenType'] == "erc721") newIds.push(element)
      }
      return sendResponse(res, SUCCESS, 'NFTs Found', newIds);
    }
    return sendResponse(res, BADREQUEST, 'NFTs Not Found');
  } catch (error) { errReturned(res, error); }
}

/**** Get All Nft ****/
exports.getAllNfts = async (req, res) => {
  try {
    let { chain } = req['params'];
    let getNFTs = await nftModel.find({ $and: [{ chain }, { isMarketItem: true }] }).populate("user").populate("collections");
    if (getNFTs.length > 0){
      let newIds = [];
      for (let index = 0; index < getNFTs.length; index++) {
        const element = getNFTs[index];
        if(element['tokenType'] == "erc1155" && element['mintAmount'] != 0) newIds.push(element)
        else if(element['tokenType'] == "erc721") newIds.push(element)
      }
      return sendResponse(res, SUCCESS, 'NFTs Found', newIds);
    }
    return sendResponse(res, BADREQUEST, 'NFTs Not Found');
  } catch (error) { errReturned(res, error); }
}

/**** Get All Collections ****/
exports.getAllCollections = async (req, res) => {
  try {
    let { chain } = req['params'];
    let getNFTs = await collectionsModels.find({ $and: [{ chain }, { isMarketplaceCollection: false }] }).populate("user").populate("collections");
    if(getNFTs.length > 0)  return sendResponse(res, SUCCESS, 'Collection Found', getNFTs);
    return sendResponse(res, BADREQUEST, 'Collection Not Found');
  } catch (error) { errReturned(res, error); }
}

/**** End Auction ****/
exports.endAuction = async (req, res) => {
  try {
    let { nftObjId } = req['body'];
    let { _id } = req['user'];
    let now = Date.now();
    let getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user");
    if (getNFT['tokenType'] == "erc721") {
      if (!getNFT['bids']) {
        await nftModel.updateOne({ _id: nftObjId }, { bidAmount: 0, bidTime: 0, bidder: null, bids: null, totalBids: 0, isMarketItem: false, status: "buy" });
        await bidsModel.deleteMany({ $and: [{ chain: getNFT['chain'] }, { tokenAddress: getNFT['tokenAddress'] }, { nftObjId }] });
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "transfer", createdAt: now });
        return sendResponse(res, SUCCESS, 'Auction Ended Successfully', getNFT);
      } else {
        await nftModel.updateOne({ _id: nftObjId }, { users: getNFT['bids']['userId'], bidAmount: 0, bidTime: 0, bidder: null, bids: null, totalBids: 0, isMarketItem: false, status: "buy" });
        await bidsModel.deleteMany({ $and: [{ chain: getNFT['chain'] }, { tokenAddress: getNFT['tokenAddress'] }, { nftObjId }] });
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "transfer", createdAt: now });
        return sendResponse(res, SUCCESS, 'Auction Ended Successfully', getNFT);
      }
    } else if (getNFT['tokenType'] == "erc1155") {
      if (!getNFT['bids']) {
        await nftModel.updateOne({ _id: nftObjId }, { bidAmount: 0, bidTime: 0, bidder: null, bids: null, totalBids: 0, isMarketItem: false, status: "buy" });
        await bidsModel.deleteMany({ $and: [{ chain: getNFT['chain'] }, { tokenAddress: getNFT['tokenAddress'] }, { nftObjId }] });
      }
      else {
        let get115NFT = await nftModel.findOne({ $and: [{ tokenAddress: getNFT['tokenAddress'], users: getNFT['bids']['userId'] }] });
        if (get115NFT) {
          let remaningAmount = parseInt(getNFT['mintAmount'] - getNFT['bidAmount'])
          let transferAmount = parseInt(get115NFT['mintAmount'] + getNFT['bidAmount'])
          await nftModel.updateOne({ _id: get115NFT['_id'] }, { mintAmount: transferAmount });
          await nftModel.updateOne({ _id: nftObjId }, { mintAmount: remaningAmount, bidAmount: 0, bidTime: 0, bidder: null, bids: null, totalBids: 0, isMarketItem: false, status: "buy" });
          await bidsModel.deleteMany({ $and: [{ chain: getNFT['chain'] }, { tokenAddress: getNFT['tokenAddress'] }, { nftObjId }] });
        } else {
          let transferAmount = parseInt(getNFT['bidAmount'])
          let newNFT = {
            collectionType: getNFT['collectionType'],
            isMarketItem: false,
            tokenAddress: getNFT['tokenAddress'],
            collections: getNFT['collections'],
            metadataUri: getNFT['metadataUri'],
            tokenType: getNFT['tokenType'],
            totalFav: getNFT['totalFav'],
            mintAmount: transferAmount,
            status: "buy",
            chain: getNFT['chain'],
            price: getNFT['price'],
            image: getNFT['image'],
            nftId: getNFT['nftId'],
            title: getNFT['title'],
            desc: getNFT['desc'],
            users: getNFT['bids']['userId'],
          }
          let remaningAmount = parseInt(getNFT['mintAmount'] - getNFT['bidAmount'])
          await nftModel.create({ ...newNFT });
          await nftModel.updateOne({ _id: nftObjId }, { mintAmount: remaningAmount, bidAmount: 0, bidTime: 0, bidder: null, totalBids: 0, isMarketItem: false, status: "buy", bids: null });
          await bidsModel.deleteMany({ $and: [{ chain: getNFT['chain'] }, { tokenAddress: getNFT['tokenAddress'] }, { nftObjId }] });
        }
      }
      getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
      await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "transfer", createdAt: now });
      return sendResponse(res, SUCCESS, 'Auction Ended Successfully', getNFT);
    }

  } catch (error) { errReturned(res, error); }
}

/**** Transfer Nfts ****/
exports.transferNft = async (req, res) => {
  try {
    let { nftObjId, receiverAddress, mintAmount } = req['body'];
    let {_id} = req['user'];
    let now = Date.now();
    receiverAddress = receiverAddress.toLowerCase();
    let getNFT = await nftModel.findOne({ _id: nftObjId });
    let getUser = await usersModels.findOne({ $and: [{ publicAddress: receiverAddress }, { chain: getNFT['chain'] }] });
    if (!getNFT) return sendResponse(res, BADREQUEST, 'NFT Not Found');
    if (getUser) {
      if (getNFT['tokenType'] == "erc721") {
        await nftModel.updateOne({ _id: nftObjId }, { users: getUser['_id'], isMarketItem: false, status: "buy" });
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "transfer", createdAt: now });
        return sendResponse(res, SUCCESS, 'Transfer NFT Successfully', getNFT);
      }
      else if (getNFT['tokenType'] == "erc1155") {
        let get115NFT = await nftModel.findOne({ $and: [{ tokenAddress: getNFT['tokenAddress'], users: getUser['_id'] }] });
        if (get115NFT) {
          let remaningAmount = parseInt(getNFT['mintAmount'] - mintAmount)
          let transferAmount = parseInt(get115NFT['mintAmount'] + mintAmount)
          await nftModel.updateOne({ _id: get115NFT['_id'] }, { mintAmount: transferAmount });
          await nftModel.updateOne({ _id: nftObjId }, { mintAmount: remaningAmount, isMarketItem: false, listAmount: 0, status: "buy" });
        } else {
          let remaningAmount = parseInt(getNFT['mintAmount'] - mintAmount)
          let transferAmount = parseInt(mintAmount)
          let newNFT = {collectionType: getNFT['collectionType'], isMarketItem: false, tokenAddress: getNFT['tokenAddress'], collections: getNFT['collections'], metadataUri: getNFT['metadataUri'], tokenType: getNFT['tokenType'], totalFav: getNFT['totalFav'], mintAmount: transferAmount, chain: getNFT['chain'], price: getNFT['price'], image: getNFT['image'], nftId: getNFT['nftId'], title: getNFT['title'], desc: getNFT['desc'], users: getUser['_id'] }
          await nftModel.create({ ...newNFT });
          await nftModel.updateOne({ _id: nftObjId }, { mintAmount: remaningAmount, isMarketItem: false, listAmount: 0, status: "buy" });
        }
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "transfer", createdAt: now });
        return sendResponse(res, SUCCESS, 'Transfer NFT Successfully', getNFT);
      }
    } else {
      let nonce = await helper.getNonce();
      let createUser = await usersModels.create({ nonce, publicAddress: receiverAddress, chain: getNFT['chain'] });
      if (getNFT['tokenType'] == "erc721") {
        await nftModel.updateOne({ _id: nftObjId }, { users: createUser['_id'], isMarketItem: false });
        getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
        await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "transfer", createdAt: now });
        return sendResponse(res, SUCCESS, 'Transfer NFT Successfully', getNFT);
      } else if (getNFT['tokenType'] == "erc1155") {
        let get115NFT = await nftModel.findOne({ $and: [{ tokenAddress: getNFT['tokenAddress'], users: createUser['_id'] }] });
        if (get115NFT) {
          let remaningAmount = parseInt(getNFT['mintAmount'] - mintAmount)
          let transferAmount = parseInt(get115NFT['mintAmount'] + mintAmount)
          await nftModel.updateOne({ _id: get115NFT['_id'] }, { mintAmount: transferAmount });
          await nftModel.updateOne({ _id: nftObjId }, { mintAmount: remaningAmount, isMarketItem: false, listAmount: 0 });
        } else {
          let remaningAmount = parseInt(getNFT['mintAmount'] - mintAmount)
          let transferAmount = parseInt(mintAmount)
          let newNFT = { collectionType: getNFT['collectionType'], isMarketItem: false, tokenAddress: getNFT['tokenAddress'], collections: getNFT['collections'], metadataUri: getNFT['metadataUri'], tokenType: getNFT['tokenType'], totalFav: getNFT['totalFav'], mintAmount: transferAmount, status: getNFT['status'], chain: getNFT['chain'], price: getNFT['price'], image: getNFT['image'], nftId: getNFT['nftId'], title: getNFT['title'], desc: getNFT['desc'], users: createUser['_id']}
          await nftModel.create({ ...newNFT });
          await nftModel.updateOne({ _id: nftObjId }, { mintAmount: remaningAmount, isMarketItem: false, listAmount: 0, status: "buy" });
        }
      }
      getNFT = await nftModel.findOne({ _id: nftObjId }).populate("bids").populate("user").populate("collections");
      await activityModel.create({ chain: getNFT['chain'], type: getNFT['tokenType'], address: getNFT['users']['publicAddress'], user: _id, nft: nftObjId, status: "transfer", createdAt: now });
      return sendResponse(res, SUCCESS, 'Transfer NFT Successfully', getNFT);
    }
  } catch (error) { errReturned(res, error); }
}

/**** Upload Logo ****/
exports.updateLogo = async (req, res) => {
  try {
    let data = req['body'];
    let { tokenAddress } = req['body'];
    let { chain } = req['user'];
    let { profile } = req['files'];
    let required = ['tokenAddress'];
    for (let key of required)
      if (!data[key] || data[key] == '' || data[key] == undefined || data[key] == null)
        return errReturned(res, `Please provide ${key}`);
    
    tokenAddress = tokenAddress.toLowerCase();
    let findCollection = await collectionsModels.findOne({$and:[{tokenAddress},{chain}]});
    if(findCollection) {
      await uploadFiles.deleteCollection(findCollection['profileImage']);
      await collectionsModels.updateOne({ _id:findCollection['_id'] }, { profileImage: profile[0]['location'] });
      return sendResponse(res, SUCCESS, `Updated Logo`)
    }
    return sendResponse(res, BADREQUEST, `Logo Not Updated`)
  } catch (error) { errReturned(res, error) }
}

/**** Update Background ****/
exports.updateBackground = async (req, res) => {
  try {
    let data = req['body'];
    let { tokenAddress } = req['body'];
    let { chain } = req['user'];
    let { background } = req['files'];
    let required = ['tokenAddress'];
    for (let key of required)
      if (!data[key] || data[key] == '' || data[key] == undefined || data[key] == null)
        return errReturned(res, `Please provide ${key}`);
    
    tokenAddress = tokenAddress.toLowerCase();
    let findCollection = await collectionsModels.findOne({$and:[{tokenAddress},{chain}]});
    if(findCollection) {
      await uploadFiles.deleteCollection(findCollection['bgImage']);
      await collectionsModels.updateOne({_id:findCollection['_id']}, { bgImage: background[0]['location'] });
      return sendResponse(res, SUCCESS, `Updated Background`)
    }
    return sendResponse(res, BADREQUEST, `Background Not Updated`)
  } catch (error) { errReturned(res, error) }
}

/**** Update Collection ****/
exports.updateCollection = async (req, res) => {
  try {
    let data = req['body'];
    let { tokenAddress, collectionName, collectionDesc, website, telegram, instagram, medium, discord } = req['body'];
    let {chain} = req['user'];
    let required = ['tokenAddress'];
    for (let key of required)
      if (!data[key] || data[key] == '' || data[key] == undefined || data[key] == null)
        return errReturned(res, `Please provide ${key}`);
    
    tokenAddress = tokenAddress.toLowerCase();
    let findCollection = await collectionsModels.findOne({$and:[{tokenAddress},{chain}]});
    if(findCollection) { 
      await collectionsModels.updateOne({ _id:findCollection['_id'] }, { collectionName, collectionDesc, website, telegram, instagram, medium, discord });
      return sendResponse(res, SUCCESS, `Updated Collection Details`)
    }
    return sendResponse(res, BADREQUEST, `Collection Details Not Updated`);
  } catch (error) { errReturned(res, error) }
}

// validate
exports.validateURI = async (req, res) => {
  try {
      let data = req['body'];
      let { url } = data
      const response = await fetch(url);
      if (!response.ok) {
        return sendResponse(res, BADREQUEST, 'MetaData Not Found', {status:400});
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return sendResponse(res, BADREQUEST, 'MetaData Not Found', {status:400});
      }
      return sendResponse(res, SUCCESS, 'MetaData Found', {status:200});
  } catch (error) { 
    errReturned(res, error); 
  }
}

// validate
exports.setCategory = async (req, res) => {
  try {
    let data = req['body'];
    let { category } = req['body'];
    let {userId} = req['user'];
    let required = ['category'];
    for (let key of required)
      if (!data[key] || data[key] == '' || data[key] == undefined || data[key] == null)
        return errReturned(res, `Please provide ${key} name`);
    
    let findCollection = await categoryModels.findOne({category});
    if(findCollection) return sendResponse(res, BADREQUEST, `Category already created`);
    
    await categoryModels.create({category,user:userId});
    findCollection = await categoryModels.find();
    return sendResponse(res, SUCCESS, `Category created successfully`,findCollection);
    
  } catch (error) { 
    errReturned(res, error); 
  }
}

exports.getCategory = async (req, res) => {
  try {
      let findCollection = await categoryModels.find();
      return sendResponse(res, SUCCESS, 'Category Found', findCollection);
  } catch (error) { 
    errReturned(res, error); 
  }
}
