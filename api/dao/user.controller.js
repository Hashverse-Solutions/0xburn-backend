"use strict";
const helper = require("./helper");
const DAOModel = require("./dao.model");
const { SUCCESS, BADREQUEST } = require("../../config/resCodes");
const { sendResponse, errReturned } = require("../../config/dto");


//////////////////////////////////// DAO ////////////////////////////////////

exports.getOxBurnDAO = async (req, res) => {
  try {
    let data = req["body"];
    let { daoAddress } = req["body"];
    let required = ["daoAddress"];
    for (let key of required)
      if (
        !data[key] ||
        data[key] == "" ||
        data[key] == undefined ||
        data[key] == null
      )
        return errReturned(res, `Please provide ${key}`);

    let find = await DAOModel.find({ daoAddress });
    if (find) {
      return sendResponse(res, SUCCESS, "DAO Found", find);
    } else {
      return sendResponse(res, SUCCESS, "No DAO Found!", []);
    }
  } catch (error) {
    errReturned(res, error);
  }
};

exports.addOxBurnProposal = async (req, res) => {
  try {
    let data = req["body"];
    let { proposalTitle, proposalDescription, deadline, treasuryValue, daoAddress } = req["body"];
    let required = ["daoAddress", "proposalTitle", "proposalDescription", "deadline"];
    for (let key of required)
      if (
        !data[key] ||
        data[key] == "" ||
        data[key] == undefined ||
        data[key] == null
      )
        return errReturned(res, `Please provide ${key}`);

    let docURL = "";

    if (req.files?.proposalDocument) {
      let docName = req.files?.proposalDocument?.name;
      docName = docName?.split(".");
      docName = docName?.[0];
      docName = docName?.replace(/[^a-zA-Z0-9 ]/g, "");
      docName = docName?.replace(/ /g, "-");
      docName = docName?.toLowerCase() + daoAddress + proposalTitle;
      let docType = req.files?.proposalDocument?.mimetype;
      let docMime = req.files?.proposalDocument?.mimetype;
      docType = docType?.split("/");
      docType = docType?.[1];
      if (docType !== undefined && docType !== null) {
        if (docType !== "pdf") {
          return errReturned(res, "Proposal document can only be of type PDF");
        }
      }

      let bucketName = `${process['env']['DOCS_BUCKET']}`;
      docURL = `https://${process['env']['DOCS_BUCKET']}.s3.us-east-2.amazonaws.com/${docName}.${docType}`;

      await helper.uploadFiles(docName, bucketName, docType, docMime, req.files?.proposalDocument);
    }

    let proposal = {
      proposalTitle,
      proposalDescription,
      deadline,
      treasuryValue: treasuryValue ? treasuryValue : 0,
      proposalDocument: req.files?.proposalDocument ? docURL : ""
    }

    let result = await DAOModel.updateOne({ daoAddress }, { $push: { proposals: proposal } });
    return sendResponse(res, SUCCESS, "Proposal added", result);
  } catch (error) {
    errReturned(res, error);
  }
};

exports.getOxBurnProposals = async (req, res) => {
  try {
    let data = req["body"];
    let { daoAddress } = req["body"];
    let required = ["daoAddress"];
    for (let key of required)
      if (
        !data[key] ||
        data[key] == "" ||
        data[key] == undefined ||
        data[key] == null
      )
        return errReturned(res, `Please provide ${key}`);

    let find = await DAOModel.find({ daoAddress });
    if (find) {
      return sendResponse(res, SUCCESS, "Proposals Found", find[0]['proposals']);
    } else {
      return sendResponse(res, SUCCESS, "No proposals created yet!", []);
    }
  } catch (error) {
    errReturned(res, error);
  }
};

exports.sendEmailOxBurn = async (req, res) => {
  try {
    let { daoAddress, emailSubject, proposalTitle, proposalDescription } = req['body'];

    let dao = await DAOModel.findOne({ daoAddress });
    for (let items of dao['stakeholderEmails']) {
      await helper.sendEmail(emailSubject, items, proposalTitle, proposalDescription)
    }

    return sendResponse(res, SUCCESS, "Email Send Successfully");
  } catch (e) {
    errReturned(res, e);
  }
}
