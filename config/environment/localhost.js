'use strict';
// Localhost specific configuration
// ==================================

module.exports = {
  clientDomain: 'http://localhost:3000',
  serverDomain: "http://localhost:4000/api",
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
