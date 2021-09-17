const User = require('../models/user');
const categoryFollow = require('../models/categoryFollow');

exports.userById = (req,res,next,id) =>{
    User.findById(id).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"User not found"
            });
        }
        req.profile = user;
        next();
    })
}


exports.read = (req,res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile)
}

exports.userId = (req,res,next) =>{
    const idParam = req.params.id;
    User
        .findOne({ _id: idParam })      
        .exec((err, user) => {
            if(!user){
                return res.status(400).json({
                    title: "User not found!",
                    error: false,
                    data: null
                });
            }
            return res.status(200).json({
                title: "Data found successfully!",
                error: false,
                data: user
            });
        });
}

exports.userFollow = (req,res,next) =>{
    const {categoryId, userId} = req.body; 
    var record ={
        "category_id": categoryId,
        "user_id": userId
    }
    
    categoryFollow.findOne({category_id: categoryId, user_id: userId})
        .exec((err, user) => {
            if(!user){
                
                return categoryFollow.create(record).
                        then((data) => {
                            return res.status(200).json({
                                title: "follow Successfully!",
                                error: false,
                                data: data
                            });
                        })
                        .catch(err => {
                            res.status(500).send({
                                title: err.message || "Something went wrong",
                                error: true
                            });
                        });
            }
            categoryFollow.findOneAndDelete(record)
                .then(data => {
                    if (data) {
                        return res.status(200).json({
                            title: "Unfollow Successfully!",
                            error: false,
                            data: data
                        });
                    } 
                })
                .catch(err => {
                    return res.status(500).json({
                        title: "somthing went wrong",
                        error: true
                    })
                });
        });

}
