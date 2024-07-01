'use strict';
// Development specific configuration
// ==================================
module.exports = {
  serverDomain: "http://localhost:4000/api",
  clientDomain: '',
  contractsApi: 'http://localhost:4003/contracts',

  mongo: {
    db_url: process['env']['database_url'],
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    debug: false,
  },
  seedDB: true
};
