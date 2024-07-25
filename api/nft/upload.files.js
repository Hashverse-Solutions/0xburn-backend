const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const usersModels = require('../user/user.model');
const collectionsModels = require('./collections.model');

aws.config.update({
  secretAccessKey:process['env']['AWS_SECRET'],
  accessKeyId:process['env']['AWS_KEY'],
  region:process['env']['region'],
})

let s3 = new aws.S3();

exports.user = multer({
  storage: multerS3({
    s3: s3,
    bucket: process['env']['bucket'],
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: `user/${file.fieldname}`});
    },
    key: async (req, file, cb) => {
      let folderName = ""
      if(file.fieldname == "user") folderName =  "user/";
      let {_id} = req['user'];
      let getUser = await usersModels.findOne({_id:_id});
      if (getUser && getUser.image) {
        const urlObject = new URL(getUser['image']);
        // Get the pathname from the URL object
        const pathname = urlObject.pathname;
        // Extract the filename from the pathname
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        s3.deleteObject({ Bucket: process['env']['bucket'], Key: filename }, (err, data) => {
          if (err) {
            console.error('Error deleting previous image:', err);
          } else {
            cb(null,folderName + file.fieldname + '-' + Math.floor((Math.random() * 10000000000) + 20) + '-' + Math.floor(Date.now() / 1000) +"-"+ file.originalname.toLocaleLowerCase().replace(/ /g, '-'))
            console.log('Previous image deleted successfully');
          }
        });
      }
      else {
        cb(null,folderName + file.fieldname + '-' + Math.floor((Math.random() * 10000000000) + 20) + '-' + Math.floor(Date.now() / 1000) +"-"+ file.originalname.toLocaleLowerCase().replace(/ /g, '-'))
      }
    }
  })
})

exports.collection = multer({
    storage: multerS3({
      s3: s3,
      bucket: process['env']['bucket'],
      acl: 'public-read',
      metadata: function (req, file, cb) {
        if(file.fieldname == "background") cb(null, {fieldName: `background/${file.fieldname}`});
        if(file.fieldname == "profile") cb(null, {fieldName: `profile/${file.fieldname}`});
      },
      key: function (req, file, cb) {
        let folderName = ""
        if(file.fieldname == "background") folderName =  "background/";
        if(file.fieldname == "profile") folderName =  "profile/";
        cb(null,folderName + file.fieldname + '-' + Math.floor((Math.random() * 10000000000) + 20) + '-' + Math.floor(Date.now() / 1000) +"-"+ file.originalname.toLocaleLowerCase().replace(/ /g, '-'))
      }
    })
});

exports.deleteCollection = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        const urlObject = new URL(url);
        // Get the pathname from the URL object
        const pathname = urlObject.pathname;
        // Extract the filename from the pathname
        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
        s3.deleteObject({ Bucket: process['env']['bucket'], Key: filename }, (err, data) => {
          if (err) {
            console.error('Error deleting previous image:', err);
            reject(err)
          } else {
            console.log('Previous image deleted successfully');
            resolve();
          }
        });
      }
    }catch (e) { reject(e) }
  });
}