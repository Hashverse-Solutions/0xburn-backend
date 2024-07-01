/**
   * Main application routes
*/

'use strict';

module.exports = (app) => {
  app.use('/api/users', require('./api/user'));
};
