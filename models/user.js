const mongoose = require('mongoose')
const crypto = require('crypto')
// const uuidv1 = require('uuid/v1')
const { v1: uuidv1 } = require('uuid');
const { get } = require('../routes/auth')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true,
        maxlength:32
    },
    email:{
        type:String,
        trim:true,
        required:true,
        maxlength:32,
        unique:true
    },
    user_password:{
        type: String,
        required:true,
    },
    hashed_password:{
        type:String,
        required:false,
    },
    about:{
        type:String,
        trim:true,
    },
    salt:String,
    role:{
        type:Number,
        default:0,

    },
    status: {
        type: String,
        enum: ['active', 'in-active']
    },
    history:{
        type:Array,
        default:[],
    },
},{timestamps:true})


userSchema.index({ email: 1 }, { unique: true});

//virtual field

// userSchema.virtual('password')
// .set(function(password){
//     this._password = password
//     this.salt = uuidv1()
//     this.hashed_password = this.encryptPassword(password)
// })
// .get(function(){
//     return this._password
// })

// userSchema.methods = {
//     authenticate:function(plaintext){
//         return this.encryptPassword(plaintext) === this.hashed_password;
//     },
//     encryptPassword: function(password) {
//         if(!password) return '';
//         try{
//             return crypto.createHmac('sha1',this.salt)
//                             .update(password)
//                             .digest('hex')
//         }catch(err){
//             return ''
//         }
//     }
// }

module.exports = mongoose.model("User",userSchema)