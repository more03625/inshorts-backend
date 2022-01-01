/* NODE-MODULES */
const async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
const bcrypt = require('bcryptjs');
const helper = require('../lib/helper');
const randomstring = require("randomstring");
const { check, validationResult, body } = require('express-validator');
const nodeGeocoder = require('node-geocoder');

/* Models */
const User = require('../models/user');

const authorController = {
    // async 
    byId(req, res) {
        const id = req.params.id;

        let { page, size } = req.query;  //req.params;

        if (!page) {
            page = 1
        }
        if (!size) {
            size = 10
        }

        const limit = parseInt(size)
        const skip = (page - 1) * size

        let total =0;
        User.aggregate([
            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    localField: '_id',
                    foreignField: 'author_id',
                    from: 'posts',
                    as: 'posts'
                }
            },
            {
                $addFields: { count: { $size: "$posts" } }
            },
        ]).exec((error, result) => {
            if (error) {
                return res.status(200).json({
                    title: 'Something went wrong, Please try again..',
                    error: true,
                });
            }
            console.log('result',result.length)
            total =result.length === 0 ? 0 : result[0].count;
        });

        let authorDetails = User.aggregate([
            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    localField: '_id',
                    foreignField: 'author_id',
                    from: 'posts',
                    as: 'posts'
                }
            },
            { 
                $facet : {
                    'posts' :
                    [
                        { $unwind : '$posts' },
                        { $sort : { 'posts.createdAt' : -1 } },
                        { $skip : skip },
                        { $limit : limit }
                    ]
                } 
            },
            {
                $addFields: { 
                    // postCount: { $size: "$posts" },  
                    posts: "$posts.posts",
                }
            }
        ]).exec((error, category) => {
            if (error) {
                return res.status(200).json({
                    title: 'Something went wrong, Please try again..',
                    error: true,
                });
            }
            return res.status(200).json({
                title: "Data found successfully!",
                error: false,
                page,
                size,
                total: total,
                data: category[0]
            });
        });
    },
    byAuthor(req, res) {
        const name = req.params.name;

        let { page, size } = req.query;  //req.params;

        if (!page) {
            page = 1
        }
        if (!size) {
            size = 10
        }

        const limit = parseInt(size)
        const skip = (page - 1) * size

        let total =0;
        User.aggregate([
            {
                $match: {
                    name: name
                }
            },
            {
                $lookup: {
                    localField: '_id',
                    foreignField: 'author_id',
                    from: 'posts',
                    as: 'posts'
                }
            },
            {
                $addFields: { count: { $size: "$posts" } }
            },
        ]).exec((error, result) => {
            if (error) {
                return res.status(200).json({
                    title: 'Something went wrong, Please try again..',
                    error: true,
                });
            }
            console.log('result',result.length)
            total =result.length === 0 ? 0 : result[0].count;
        });

        let authorDetails = User.aggregate([
            {
                $match: {
                    name: name
                }
            },
            {
                $lookup: {
                    localField: '_id',
                    foreignField: 'author_id',
                    from: 'posts',
                    as: 'posts'
                }
            },
            { 
                $facet : {
                    'posts' :
                    [
                        { $unwind : '$posts' },
                        { $sort : { 'posts.createdAt' : -1 } },
                        { $skip : skip },
                        { $limit : limit }
                    ]
                } 
            },
            {
                $addFields: { 
                    // postCount: { $size: "$posts" },  
                    posts: "$posts.posts",
                }
            }
        ]).exec((error, category) => {
            if (error) {
                return res.status(200).json({
                    title: 'Something went wrong, Please try again..',
                    error: true,
                });
            }
            return res.status(200).json({
                title: "Data found successfully!",
                error: false,
                page,
                size,
                total: total,
                data: category[0]
            });
        });
    },
};

module.exports = authorController;