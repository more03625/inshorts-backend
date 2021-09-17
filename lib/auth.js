var jwt = require('jsonwebtoken');
let userModel = require('../models/user');

const authenticateUser = async (req, res, next) => {
    // console.log('req.headers ==>',req.headers);
    const token = req.headers.token ? req.headers.token : req.query.token; 
    const decoded = jwt.decode(token, "newsdb");
    // console.log("decoded authenticateUser",decoded, token)
    try {
        return userModel.findOne({
            '_id': decoded.user_id
        }).then((userData) => {
            console.log('userData',userData)
            if (!userData || userData == undefined) {
                return res.status(200).json({
                    title: 'user not found',
                    error: true,
                });
            }
            if (userData.status == 'blocked') {
                return res.status(200).json({
                    title: 'You are blocked by admin',
                    error: true,
                });
            }
            if (userData.status == 'inactive') {
                return res.status(200).json({
                    // title: 'OTP verification is pending',
                    title: 'User has inactive',
                    error: true,
                });
            }
            req.user = userData;
            return next(null, userData);
        });
    }
    catch (error) {
        return res.status(200).json({
            title: 'Authorization required.',
            error: true,
        });
    }
}

module.exports = {
    authenticateUser
}