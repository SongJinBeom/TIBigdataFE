const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const srchHstSchema = new Schema({
    keyword : String,
    year : Number,
    month : Number,
    date : Number,
    hour : Number,
    min : Number

})  

module.exports = mongoose.model('history',srchHstSchema);