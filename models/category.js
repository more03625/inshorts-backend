var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var schema = new Schema({
    name: {
        type: String,
        required: false
    },
    slug: {
        type: String,
        required: false
    },
    status:{
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

const category = module.exports = mongoose.model('category', schema);

module.exports.getCategory = async(cb)=>{
    let data = await category.find({}).then( result=> result)
    return data
}

module.exports.getCategoryById = async (req, cb) => {
    console.log('getCategoryById req --- ', req.body);
    let data = await category.findOne({ _id: req.body.category_id })
        .then(result => result)
    return data
}