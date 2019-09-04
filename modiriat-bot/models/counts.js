var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp');


var Schema = new mongoose.Schema({
	name: {type: String, enum:['telegram','instagram','twitter','total']},
	count:{type: Number},
});

Schema.plugin(timestamps);

var Count = mongoose.model('Count', Schema);

module.exports = Count