const mongoose = require('mongoose');

const userTaskResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
    date: {
        type: Date,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('UserTaskResult', userTaskResultSchema);
