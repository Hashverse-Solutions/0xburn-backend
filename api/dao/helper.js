const fs = require('fs');
require('dotenv').config();
const path = require("path");
const axios = require('axios');
const AWS = require('aws-sdk');
const mailgun = require("mailgun-js");
const csvtojson = require("csvtojson");

exports.getData = (endPoint) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axios.get(`${process['env']['url']}/${endPoint}`);
            resolve(response['data']);
        } catch (ex) {
            reject(ex);
        }
    });
};

exports.readS3Data = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            axios.get(data)
                .then(function (response) {
                    resolve(response)
                })
        } catch (e) { reject(e) }
    });
}

exports.readAirdropFile = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await csvtojson().fromFile(Buffer.from(data['data'], "binary"));
            if (result) return resolve(result)
            return reject('no file found');
        } catch (e) { reject(e) }
    });
}


/**
 * upload json files to s3 bucket
 */
const s3 = new AWS.S3({
    accessKeyId: process['env']['AWS_KEY'],
    secretAccessKey: process['env']['AWS_SECRET']
});

exports.uploadFile = (fileName, bucketName, fileType, mime, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                Bucket: bucketName, // pass your bucket name
                Key: `${fileName}.${fileType}`, // file will be saved as testBucket/contacts.csv
                ACL: 'public-read',
                "ContentType": mime,
                Body: Buffer.from(data['data']['data'], "binary")
            };
            s3.upload(params, function (s3Err, data) {
                if (s3Err) throw s3Err
                resolve(data.Location);
                console.log(`File uploaded successfully at ${data.Location}`)
            });
        } catch (e) { reject(e) }
    });
};

exports.uploadFileNFT = (fileName, bucketName, fileType, mime, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                Bucket: bucketName, // pass your bucket name
                Key: `${fileName}.${fileType}`, // file will be saved as testBucket/contacts.csv
                ACL: 'public-read',
                "ContentType": mime,
                Body: Buffer.from(data, "binary")
            };
            s3.upload(params, function (s3Err, data) {
                if (s3Err) throw s3Err
                resolve(data.Location);
                console.log(`File uploaded successfully at ${data.Location}`)
            });
        } catch (e) { reject(e) }
    });
};

exports.uploadFiles = (fileName, bucketName, fileType, mime, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const params = {
                Bucket: bucketName, // pass your bucket name
                Key: `${fileName}.${fileType}`, // file will be saved as testBucket/contacts.csv
                ACL: 'public-read',
                "ContentType": mime,
                Body: Buffer.from(data['data'], "binary")
            };
            s3.upload(params, function (s3Err, data) {
                if (s3Err) throw s3Err
                resolve(data.Location);
                console.log(`File uploaded successfully at ${data.Location}`)
            });
        } catch (e) { reject(e) }
    });
};

exports.createS3 = (params) => {
    return new Promise(async (resolve, reject) => {
        try {
            s3.createBucket(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    resolve(err)
                } else {
                    console.log(data);           // successful response}
                    resolve(data);
                }
            });
        } catch (e) { reject(e) }
    });
}

exports.corsS3 = (params) => {
    return new Promise(async (resolve, reject) => {
        try {
            s3.putBucketCors(params, function (err, data) {
                if (err) {
                    console.log(err); // an error occurred
                    resolve(err)
                } else {
                    console.log(data);           // successful response}
                    resolve(data);
                }
            });
        } catch (e) { reject(e) }
    });
}

exports.getS3Objects = (params) => {
    return new Promise(async (resolve, reject) => {
        try {
            s3.listObjectsV2(params, function (err, data) {
                if (err) {
                    resolve(err)
                } else {
                    resolve(data);
                }
            });
        } catch (e) { reject(e) }
    });
}

exports.deleteS3Object = (params) => {
    return new Promise(async (resolve, reject) => {
        try {
            s3.deleteObject(params, function (err, data) {
                if (err) {
                    resolve(err)
                } else {
                    resolve(data);
                }
            });
        } catch (err) {
            console.log("Error", err);
            reject(err)
        }
    });
}

exports.deleteBucket = (params) => {
    return new Promise(async (resolve, reject) => {
        try {
            let list = await this.getS3Objects(params);
            let keys = [];
            for (let items of list['Contents']) {
                let item = items['Key'];
                keys.push(item);
            }

            for (let items of keys) {
                let data = {
                    Bucket: params.Bucket,
                    Key: items
                }
                await this.deleteS3Object(data);
            }

            s3.deleteBucket(params, function (err, data) {
                if (err) {
                    resolve(err)
                } else {
                    resolve(data);
                }
            });
        } catch (err) {
            console.log("Error", err);
            reject(err)
        }
    });
}

exports.sendEmail = (emailSubject, items, proposalTitle, proposalDescription) => {
    return new Promise(async (resolve, reject) => {
        try {
            const templatePath = 'mail_templates/circularityEmailKycUser.html';
            let templateContent = fs.readFileSync(templatePath, "utf8");
            templateContent = templateContent.replace("##TITLE##", proposalTitle);
            templateContent = templateContent.replace("##DESCRIPTION##", proposalDescription);

            const DOMAIN = 'cifi.email';
            const mg = mailgun({ apiKey: process['env']['MAILGUN_KEY'], domain: DOMAIN });

            let data = {
                from: "info@cifi.email", // sender address
                to: `${items}`, // list of receivers
                subject: emailSubject, // Subject line
                html: templateContent, // html body
            };

            mg.messages().send(data, function (error, body) {
                console.log(body);
                if (error) return reject(error);
                return resolve("send");
            });

        } catch (e) { reject(e) }
    });
}