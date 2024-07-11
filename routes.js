/**
   * Main application routes
*/

'use strict';

module.exports = (app) => {
  app.use('/api/v2', require('./api/dao'));
  app.use('/api', require('./api/user'));
};
