'use strict';

const axios = require('axios');
const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');
const Users = require('../user/user.model')
const Seeds = require('../user/seed.model')
const PatnerNFT = require('../user/user.patner.nft.model')


/** Create get Nonce and login with meta mask*/
exports.getInvestersData = async (req, res) => {
  try {

    let getUsers = await Users.find()
    if(getUsers.length > 0) return sendResponse(res, SUCCESS, 'Get records', getUsers)
    else return sendResponse(res, BADREQUEST, 'Records not found')
  } catch (error) {
    errReturned(res, error);
  }
}

exports.setInvestersData = async (req, res) => {
  try {

    let {publicAddress,tokenAddress,investedAmount,totalTokens, name, email, phone} = req['body'];
    if(!publicAddress)  return sendResponse(res, BADREQUEST, 'Invalid wallet address') 
    if(!tokenAddress)  return sendResponse(res, BADREQUEST, 'Invalid token address') 
    if(!investedAmount)  return sendResponse(res, BADREQUEST, 'Invalid invested amount') 
    if(!name)  return sendResponse(res, BADREQUEST, 'Invalid name') 
    if(!email)  return sendResponse(res, BADREQUEST, 'Invalid email') 
    if(!phone)  return sendResponse(res, BADREQUEST, 'Invalid phone') 
    
    await Users.create({publicAddress,tokenAddress,investedAmount,totalTokens, name, email, phone});
    
    let getUsers = await Users.find()
    if(getUsers.length > 0) return sendResponse(res, SUCCESS, 'Get records', getUsers)
    else return sendResponse(res, BADREQUEST, 'Records not found')
  
  } catch (error) {
    errReturned(res, error);
  }
}

exports.setPatnerNFT = async (req, res) => {
  try {

    let {publicAddress,name, email, phone} = req['body'];
    if(!publicAddress)  return sendResponse(res, BADREQUEST, 'Invalid wallet address') 
    if(!name)  return sendResponse(res, BADREQUEST, 'Invalid name') 
    if(!email)  return sendResponse(res, BADREQUEST, 'Invalid email') 
    if(!phone)  return sendResponse(res, BADREQUEST, 'Invalid phone') 
    
    await PatnerNFT.create({publicAddress,name, email, phone});
    
    let getUsers = await PatnerNFT.find()
    if(getUsers.length > 0) return sendResponse(res, SUCCESS, 'Get records', getUsers)
    else return sendResponse(res, BADREQUEST, 'Records not found')
  
  } catch (error) {
    errReturned(res, error);
  }
}

exports.getSeeds = async (req, res) => {
  try {
    let getUsers = await Seeds.findOne()
    if(Seeds) return sendResponse(res, SUCCESS, 'Get records', getUsers)
    else return sendResponse(res, BADREQUEST, 'Records not found')
  } catch (error) {
    errReturned(res, error);
  }
}

exports.setSeeds = async (req, res) => {
  try {
    let {seeds} = req['body'];

    if(!seeds)  return sendResponse(res, BADREQUEST, 'Invalid value') 
    let getUsers = await Seeds.findOne()
    if(getUsers){
      await Seeds.updateOne({_id:getUsers['_id']},{seeds});
    }
    else{
      await Seeds.create({seeds});
    }
    getUsers = await Seeds.findOne()
    if(Seeds) return sendResponse(res, SUCCESS, 'Get records', getUsers)
    else return sendResponse(res, BADREQUEST, 'Records not found')
  } catch (error) {
    errReturned(res, error);
  }
}

exports.getPrice = async (req,res) => {
  axios({
    method: "get",
    url: "https://www.kucoin.com/_api/currency/prices?base=USD&targets=ARB&lang=en_US",
    }).then(response=> {
      return sendResponse(res, SUCCESS,'Get records', response.data.data.ARB) 
    }).catch(error=>{
      return sendResponse(res, BADREQUEST, error) 
    });
} 