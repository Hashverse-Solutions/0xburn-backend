'use strict';

const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');
const Users = require('../user/user.model')

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

    let {publicAddress,tokenAddress,investedAmount,totalTokens} = req['body'];
    if(!publicAddress)  return sendResponse(res, BADREQUEST, 'Invalid wallet address') 
    if(!tokenAddress)  return sendResponse(res, BADREQUEST, 'Invalid token address') 
    if(!investedAmount)  return sendResponse(res, BADREQUEST, 'Invalid invested amount') 
    if(!totalTokens)  return sendResponse(res, BADREQUEST, 'Invalid token') 
    
    await Users.create({publicAddress,tokenAddress,investedAmount,totalTokens});
    
    let getUsers = await Users.find()
    if(getUsers.length > 0) return sendResponse(res, SUCCESS, 'Get records', getUsers)
    else return sendResponse(res, BADREQUEST, 'Records not found')
  
  } catch (error) {
    errReturned(res, error);
  }
}
