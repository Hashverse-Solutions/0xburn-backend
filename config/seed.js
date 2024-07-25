// /**
//  * Populate DB with sample data on server start
//  * to disable, and set `seedDB: false`
//  */

// 'use strict';

const adminCollection = require('../api/user/user.model');

// /*  Create Marketplace Collection  */
adminCollection.findOne({ role: 'admin' }).exec(async (error, collectionFound) => {
    if (!collectionFound) {
        let collection1 = new adminCollection({
            "publicAddress":"0xe077e932e4dB8eCf337199239E9928aE6EfADA38".toLowerCase(),
            "role":"admin",
            "chain": process['env']['NODE_ENV'] == 'development' ? 421614 : 42170,
        });

        collection1.save((err, saved) => {
            if (saved) console.log('Collection Created 1 Arbitrum');
        });
    }
})