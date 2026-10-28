const mongoose = require('mongoose');
const diarySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });


const Diary = mongoose.model('Diary', diarySchema);
module.exports = { Diary };