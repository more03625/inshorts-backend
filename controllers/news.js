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
const Post = require('../models/post');
const User = require('../models/user');

const newsController = {
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

        // await Post.find({}).limit(limit).skip(skip).sort( { createdAt : -1} )
        //     .populate('main_category', { 'name': 1, 'slug': 1})
        //     .populate('author_id', {'name':1})
        //     .exec((err, posts) => {
        //         return res.status(200).json({
        //             title: "Data found successfully!",
        //             error: false,
        //             page,
        //             size,
        //             data: posts
        //         });
        //     })

        await Post.find({ status: "publish" }).skip(skip).limit(limit)
            .populate('main_category', { 'name': 1, 'slug': 1 })
            .populate('author_id', { 'name': 1 }).sort({ 'createdAt': -1 }).then((detail) => {
                Post.countDocuments({ status: "publish" }).then((count) => {
                    let data = { detail, count }

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
    async byId(req, res) {
        const idParam = req.params.id;
        await helper.hits(idParam)
        Post
            .findOne({ _id: idParam })
            .populate('main_category', { 'name': 1, 'slug': 1 })
            .populate('author_id', { 'name': 1 })
            .exec((err, post) => {
                return res.status(200).json({
                    title: "Data found successfully!",
                    error: false,
                    data: post
                });
            });
    },
    bySlug(req, res) {
        const slug = req.params.slug;
        Post
            .findOne({ slug: slug })
            .populate('main_category', { 'name': 1, 'slug': 1 })
            .populate('author_id', { 'name': 1 })
            .exec((err, post) => {
                return res.status(200).json({
                    title: "Data found successfully!",
                    error: false,
                    data: post
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

        if (req.body.author_id) {
            User.findById(req.body.author_id)
                .then(data => {
                    if (!data) {
                        return res.status(404).json({
                            error: true,
                            title: "User not found"
                        })
                    }
                })
                .catch(err => {
                    return res.status(500).json({
                        title: "something went wrong",
                        error: true
                    })
                });
        }

        inputJson = req.body;
        // userDetails = req.user;
        if (req.body.image && req.body.image != "") {
            let newBase64Str = req.body.image.replace(/(\r\n|\n|\r)/gm, "");
            var matches = newBase64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

            if (!matches || matches.length !== 3) {
                console.log("matches error");
            } else {
                let direct = "./public/uploads/";
                let tempfile = helper.base64Upload(direct, req.body.image);
                var file = tempfile + ".jpg";
                inputJson.image = "/uploads/" + tempfile;

                // generate thumbnail
                // setTimeout(function () {
                //     helper.getThumbnail(direct, file, tempfile, function (status) {
                //         console.log("getThumbnail -- ", status);
                //     });
                // }, 2000);
            }
        }

        return Post.create(inputJson).
            then((data) => {
                return res.status(200).json({
                    title: "Post Created Successfully!",
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

        const idParam = req.body._id;
        var inputJson = req.body;
        if (req.body.image && req.body.image != "" && req.body.image != 0) {
            let newBase64Str = req.body.image.replace(/(\r\n|\n|\r)/gm, "");
            var matches = newBase64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                return res.status(200).json({
                    title: "Please upload base64 post image!",
                    error: true
                });
            } else {
                let direct = "./public/uploads/";
                let tempfile = helper.base64Upload(direct, req.body.image);
                var file = tempfile + ".jpg";
                inputJson.image = "/uploads/" + tempfile;
            }
        } else {
            delete inputJson["image"];
        }

        Post.findByIdAndUpdate(idParam, inputJson, { useFindAndModify: false })
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        title: `Cannot update Post with id=${idParam}. Maybe Post was not found!`,
                        error: true
                    })
                } else {
                    return res.status(200).json({
                        title: "Post Updated Successfully!",
                        error: false,
                    });
                }
            })
            .catch(err => {
                return res.status(500).json({
                    title: "Error updating Post with id=" + idParam,
                    error: true
                })
            });
    },
    remove(req, res) {
        const idParam = req.params.id;
        // Removes a product
        Post.findByIdAndDelete(idParam)
            .then(data => {
                if (!data) {
                    return res.status(404).json({
                        title: `Cannot deleted Post with id=${idParam}. Maybe Post was not found!`,
                        error: true
                    })
                } else {
                    return res.status(200).json({
                        title: "Post Deleted Successfully!",
                        error: false,
                    });
                }
            })
            .catch(err => {
                return res.status(500).json({
                    title: "Error deleting Post with id=" + idParam,
                    error: true
                })
            });
    },
    async newsSearch(req, res) {
        var regex = new RegExp(req.params.searchtext, 'i');
        let { page, size } = req.query;  //req.params;

        if (!page) {
            page = 1
        }
        if (!size) {
            size = 10
        }

        const limit = parseInt(size)
        const skip = (page - 1) * size

        // await Post.find({title: regex}).skip(skip).limit(limit)
        await Post.find({ $or: [{ title: regex }, { description: regex }, { short_tags: regex }] }).skip(skip).limit(limit)
            .populate('main_category', { 'name': 1, 'slug': 1 })
            .populate('author_id', { 'name': 1 }).sort({ 'createdAt': -1 }).then((detail) => {
                Post.countDocuments({ $or: [{ title: regex }, { description: regex }, { short_tags: regex }] }).then((count) => {
                    let data = { detail, count }
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
    async trendingNews(req, res) {
        let { page, size } = req.query;  //req.params;

        if (!page) {
            page = 1
        }
        if (!size) {
            size = 10
        }

        const limit = parseInt(size)
        const skip = (page - 1) * size

        await Post.find({ status: "publish" }).skip(skip).limit(limit)
            .populate('main_category', { 'name': 1, 'slug': 1 })
            .populate('author_id', { 'name': 1 }).sort({ 'createdAt': -1, 'hits': -1 }).then((detail) => {
                Post.countDocuments({ status: "publish" }).then((count) => {
                    let data = { detail, count }
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
};

module.exports = newsController;
