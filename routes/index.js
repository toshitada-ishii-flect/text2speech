var text2speech = require('./page/text2speech');
var speechSystem = require('./api/speechSystem');

module.exports = function (app) {
  app.get('/', function(req, res) {
    res.redirect('/text2speech');
  });
  app.use('/text2speech', text2speech);
  app.use('/api/speechSystem',speechSystem);
}

