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
const Category = require('../models/category');

const categoryController = {
    async all(req, res) {
        let { page, size } = req.query;  //req.params;

        if (!page) {
            page = 1
        }
        if (!size) {
            size = 10
        }

        const limit = parseInt(size)
        const skip = (page - 1) * size

        await Category.find({status: true}).skip(skip).limit(limit).sort({'createdAt':-1}).then((detail)=>{
            Category.countDocuments({status: true}).then((count)=>{
                let data ={ detail,count}
                res.status(200).json({
                    title: "Data found successfully!",
                    error: false,
                    page,
                    size,
                    data
                })
            })
        })    
    },
    byId(req, res) {
        const idParam = req.params.id;
        Category
            .findOne({ _id: idParam })
            // .populate('main_category')        
            .exec((err, category) => {
                return res.status(200).json({
                    title: "Data found successfully!",
                    error: false,
                    data: category
                });
            });
    },
    categoryTotal(req, res) {
        Category.aggregate([
            {
                $lookup: {
                    localField: '_id',
                    foreignField: 'main_category',
                    from: 'posts',
                    as: 'posts'
                }
            },
            {
                $addFields: { postCount: { $size: "$posts" } }
            },
            { $sort: { "postCount": -1 } },
            {
                $project: {
                    createdAt: 0,
                    updatedAt: 0,
                    __v: 0,
                    posts: 0
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
                data: category
            });
        });
    },
    bySlug(req, res) {
        const slug = req.params.slug;

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
        Category.aggregate([
            {
                $match: {
                    slug: slug
                }
            },
            {
                $lookup: {
                    localField: '_id',
                    foreignField: 'main_category',
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

        let cartDetails = Category.aggregate([
            {
                $match: {
                    slug: slug
                }
            },
            {
                $lookup: {
                    localField: '_id',
                    foreignField: 'main_category',
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
                        { $limit : limit ? Number(limit) : 10 }
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
    create(req, res) {
        // Validate request
        const result = validationResult(req);
        if (result.errors.length > 0) {
            return res.status(200).json({
                error: true,
                title: result.errors[0].msg,
                errors: result
            });
        }
        // Create a Post
        const category = new Category({
            name: req.body.name,
            slug: req.body.slug,
            status: req.body.status ? req.body.status : false
        });

        // Save Post in the database
        category
            .save(category)
            .then(data => {
                return res.status(200).json({
                    title: "Category Created Successfully!",
                    error: false,
                    data: data
                });
            })
            .catch(err => {
                res.status(500).send({
                    message:
                        err.message || "Something went wrong"
                });
            });
    },
    async update(req, res) {
        const result = validationResult(req);
        if (result.errors.length > 0) {
            return res.status(200).json({
                error: true,
                title: result.errors[0].msg,
                errors: result
            });
        }

        const idParam = req.body.category_id;
        await Category.findByIdAndUpdate(idParam, req.body, { useFindAndModify: false })
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        title: `Cannot update Category with id=${idParam}. Maybe Category was not found!`,
                        error: true
                    })
                } else {
                    return res.status(200).json({
                        title: "Category Updated Successfully!",
                        error: false,
                    });
                }
            })
            .catch(err => {
                return res.status(500).json({
                    title: "Error updating Category with id=" + idParam,
                    error: true
                })
            });
    },
    remove(req, res) {
        const idParam = req.params.id;
        // Removes a product
        Category.findByIdAndDelete(idParam)
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        title: `Cannot deleted Category with id=${idParam}. Maybe Category was not found!`,
                        error: true
                    })
                } else {
                    return res.status(200).json({
                        title: "Category Deleted Successfully!",
                        error: false,
                    });
                }
            })
            .catch(err => {
                return res.status(500).json({
                    title: "Error deleting Category with id=" + idParam,
                    error: true
                })
            });
    }
};

module.exports = categoryController;