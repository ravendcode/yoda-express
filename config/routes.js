module.exports = (app) => {
  app.use('/', require('../app/default'));
  app.use('/api', require('../api'));
};
