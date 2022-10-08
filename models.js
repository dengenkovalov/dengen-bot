const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: { type: String, required: true },
    chatId: { type: String, required: true },
    right:  { type: Number, default: 0 },
    wrong:  { type: Number, default: 0 },
})

const UserResult = mongoose.model('UserResult', userSchema);

module.exports = UserResult;
