/**
   * Main application routes
*/

'use strict';

module.exports = (app) => {
  app.use('/api', require('./api/user'));
};
