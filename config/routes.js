module.exports = (app) => {
  app.use('/', require('../pages'));
  app.use('/api', require('../api'));
};
