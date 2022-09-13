const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },

    body: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },

    authorId: {
        type: ObjectId,
        required: true,
        ref: "Author"
    },

    tags: { type: [String] },

    category: {
        type: [String],
        required: true,
        trim: true
    },

    subcategory: { type: [String] },

    deletedAt: {
        type: Date,
        default: null
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    publishedAt: {
        type: Date,
        default: null
    },

    isPublished: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);

