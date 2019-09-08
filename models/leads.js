var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp');


var Schema = new mongoose.Schema({
  name: String,
  email: String,
});

Schema.plugin(timestamps);

var Lead = mongoose.model('Lead', Schema);

module.exports = Lead