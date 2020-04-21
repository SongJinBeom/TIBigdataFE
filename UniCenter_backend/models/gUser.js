
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

//google social user schema
const gUserSchema = new Schema({
    email : String,
    history : []
})

module.exports = mongoose.model('gUser', gUserSchema, 'gUsers');