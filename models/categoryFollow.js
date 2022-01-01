var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var schema = new Schema({
    category_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'category'
    },
    user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
    },
},
    {
        timestamps: true
    });

const categoryFollow = module.exports = mongoose.model('categoryFollow', schema);

module.exports.getCategoryFollow = async (cb) => {
    let data = await categoryFollow.find({}).then(result => result)
    return data
}