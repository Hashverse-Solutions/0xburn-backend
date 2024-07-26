'use strict';

const axios = require('axios');
const jwt = require('jsonwebtoken');
const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');
const web3Provider = require("../../utils/web3");
const helper = require('../nft/helper');
const User = require('../user/user.model')
const Seeds = require('../user/seed.model')
const PatnerNFT = require('../user/user.patner.nft.model')
const WhiteListNFT = require('../user/whitelist.model.patnernft')
const WhiteListSeedPhase = require('../user/whitelist.model.seedphase')


/** Create get Nonce and login with meta mask*/
exports.getInvestersData = async (req, res) => {
  try {

    let getUsers = await User.find({iswhitelist:true})
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
    
    await User.create({publicAddress,tokenAddress,investedAmount,totalTokens, name, email, phone, iswhitelist:true});
    
    let getUsers = await User.find()
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
      url: "https://www.kucoin.com/_api/currency/prices?base=USD&targets=ETH,ARB&lang=en_US",
    }).then(response => {
      const data = response.data.data;
      const result = {
          ETH: data.ETH,
          ARB: data.ARB
      };
    return sendResponse(res, SUCCESS, 'Get records', result);
    }).catch(error=>{
      return sendResponse(res, BADREQUEST, error) 
    });
} 

/** Create get Nonce and login with meta mask*/
exports.getNonce = async (req, res) => {
  try {
    const { publicAddress,chain } = req['params'];
    let nonce = await helper.getNonce();
    if (!chain) return sendResponse(res, BADREQUEST, 'Please select chain');
    if (!publicAddress) return sendResponse(res, BADREQUEST, 'Please connect wallet');
    let nonceObject = await User.findOne({$and:[{publicAddress},{chain},{role:"user"}]});
    if(nonceObject) await User.updateOne({_id:nonceObject['_id']},{nonce});
    else await User.create({nonce,publicAddress,chain,role:"user"});
    return sendResponse(res, SUCCESS, `Nonce`, nonce)
  } catch (error) {
    errReturned(res, error);
  }
}
/** Login With MetaMask */
exports.loginWithMetaMask = async (req, res) => {
  try {
    let { address, signature, nonce, chain } = req['body'];
    if (!signature) return sendResponse(res, BADREQUEST, 'Please send the signature');
    if (!address) return sendResponse(res, BADREQUEST, 'Please send the publicAddress');
    const publicAddress = address.toLowerCase();
    let user = await User.findOne({$and:[{publicAddress},{chain},{role:"user"}]});
    if (!user) return errReturned(res, 'Please provide valid address!');
    const web3 = await web3Provider(chain);
    const recoveredAddress = web3.eth.accounts.recover(`0xBurn marketplace signature ${nonce}`, signature);

    if (recoveredAddress.toLowerCase() === publicAddress.toLowerCase()) {
      let { token } = await loginNotification(req, user);
      return sendResponse(res, SUCCESS, 'Login Successful', { token });
    }
    return sendResponse(res, BADREQUEST, 'Signature Verification Failed');
  } catch (error) { errReturned(res, error) }
}

/** Create get Nonce and login with meta mask*/
exports.getNonceAdmin = async (req, res) => {
  try {
    let { publicAddress,chain } = req['params'];
    let nonce = await helper.getNonce();
    if (!chain) return sendResponse(res, BADREQUEST, 'Please select chain');
    if (!publicAddress) return sendResponse(res, BADREQUEST, 'Please connect wallet');
    publicAddress = publicAddress.toLowerCase();
    let nonceObject = await User.findOne({$and:[{publicAddress},{chain},{role:"admin"}]});
    if(nonceObject) await User.updateOne({_id:nonceObject['_id']},{nonce});
    else return sendResponse(res, BADREQUEST, `Only admin can login`)
    return sendResponse(res, SUCCESS, `Nonce`, nonce)
  } catch (error) {
    errReturned(res, error);
  }
}
/** Login With MetaMask */
exports.loginWithMetaMaskAdmin = async (req, res) => {
  try {
    let { address, signature, nonce, chain } = req['body'];
    if (!signature) return sendResponse(res, BADREQUEST, 'Please send the signature');
    if (!address) return sendResponse(res, BADREQUEST, 'Please send the publicAddress');
    const publicAddress = address.toLowerCase();
    let user = await User.findOne({$and:[{publicAddress},{chain},{role:"admin"}]});
    if (!user) return errReturned(res, 'Please provide valid address!');
    const web3 = await web3Provider(chain);
    const recoveredAddress = web3.eth.accounts.recover(`0xBurn marketplace signature ${nonce}`, signature);

    if (recoveredAddress.toLowerCase() === publicAddress.toLowerCase()) {
      let { token } = await loginNotification(req, user);
      return sendResponse(res, SUCCESS, 'Login Successful', { token });
    }
    return sendResponse(res, BADREQUEST, 'Signature Verification Failed');
  } catch (error) { errReturned(res, error) }
}
/** Get User Data */
exports.getUser = async (req, res) => {
  try {
    let { _id } = req['user'];
    let user = await User.findOne({_id});
    if(user) return sendResponse(res, SUCCESS, `Get User Data`, user)
    return sendResponse(res, BADREQUEST, 'Invalid User');
  } catch (error) { errReturned(res, error) }
}

/** Get User Data */
exports.setUser = async (req, res) => {
  try {
    let { _id } = req['user'];
    let { name,desc,facebook,twitter,discord } = req['body'];
    let user = await User.findOne({_id});
    if(user){
      if(!facebook) facebook = user['facebook'];
      if(!twitter) twitter = user['twitter'];
      if(!discord) discord = user['discord'];
      if(!desc) desc = user['desc'];
      if(!name) name = user['name'];
      await User.updateOne({_id},{facebook,twitter,discord,desc,name});
      return sendResponse(res, SUCCESS, `User Profile Update`, user)
    }
    return sendResponse(res, BADREQUEST, 'Invalid User');
  } catch (error) { errReturned(res, error) }
}

/** Get User Data */
exports.setUserImage = async (req, res) => {
  try {
    let { _id } = req['user'];
    let { user } = req['files'];
      await User.updateOne({_id},{image:user[0]['location']});
      return sendResponse(res, SUCCESS, `Update Profile Image`)
  } catch (error) { errReturned(res, error) }
}

/** Update user in DB */
function loginNotification(req, user) {
  return new Promise(async resolve => {
    let token = jwt.sign({ _id:user['_id'], publicAddress: user['publicAddress'], role: user['role'], chain: user['chain'] }, process.env.SECRETS, { expiresIn: '48h', algorithm: 'HS256' });
    let nonce = await helper.getNonce();
    await User.updateOne({ _id: user['_id'] }, { $set: { nonce } }).exec();
    return resolve({ token });
  });
}


/** Get User Data */
exports.whitelistNFT = async (req, res) => {
  try {
    let {publicAddress, name, email, phone} = req['body'];
    if (!publicAddress) return sendResponse(res, BADREQUEST, 'Please enter wallet address');
    if (!name) return sendResponse(res, BADREQUEST, 'Please enter the name');
    if (!email) return sendResponse(res, BADREQUEST, 'Please enter the email address');
    if (!phone) return sendResponse(res, BADREQUEST, 'Please enter the phone');
    publicAddress = publicAddress.toLowerCase();
    let findAddress =  await WhiteListNFT.findOne({publicAddress})
    if(findAddress) return sendResponse(res, BADREQUEST, `Already whitelised on this address ${publicAddress}`);
    await WhiteListNFT.create({publicAddress, name, email, phone});
    return sendResponse(res, SUCCESS, `Whitelised on this address ${publicAddress}`)
  } catch (error) { errReturned(res, error) }
}

/** Get User Data */
exports.whitelistSeedPhase = async (req, res) => {
  try {
    let {publicAddress, name, email, phone} = req['body'];
    if (!publicAddress) return sendResponse(res, BADREQUEST, 'Please enter wallet address');
    if (!name) return sendResponse(res, BADREQUEST, 'Please enter the name');
    if (!email) return sendResponse(res, BADREQUEST, 'Please enter the email address');
    if (!phone) return sendResponse(res, BADREQUEST, 'Please enter the phone');
    publicAddress = publicAddress.toLowerCase();
    let findAddress =  await WhiteListNFT.findOne({publicAddress})
    if(findAddress) return sendResponse(res, BADREQUEST, `Already whitelised on this address ${publicAddress}`);
    await WhiteListNFT.create({publicAddress, name, email, phone});
    return sendResponse(res, SUCCESS, `Whitelised on this address ${publicAddress}`)
  } catch (error) { errReturned(res, error) }
}