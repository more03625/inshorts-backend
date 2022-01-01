var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var schema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    main_category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'category'
    },
    sub_categories: Array,
    read_at: {
        type: String,
        required: true
    },
    read_at_link: {
        type: String,
        required: true
    },
    short_tags: {
        type: String,
        required: true
    },
    author_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
    publishedAt: Date,
    hits: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['draft', 'publish', 'deleted']
    },
},
    {
        timestamps: true
    });

const post = module.exports = mongoose.model('post', schema);

module.exports.getPost = async (cb) => {
    let data = await post.find({}).then(result => result)
    return data
}

module.exports.getPostById = async (req, cb) => {
    console.log('getPostById req --- ', req.body);
    let data = await post.findOne({ _id: req.body.post_id })
        .then(result => result)
    return data
}