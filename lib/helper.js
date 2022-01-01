/* NODE-MODULES */
const jwt = require('jsonwebtoken');
const fs = require('fs');
var moment = require('moment-timezone');
const nodemailer = require('nodemailer');
var base64ToImage = require('base64-to-image');
const randomstring = require("randomstring");
const fetch = require('node-fetch');

const Post =require('../models/post')

/* Models */
// let groupModule = require('../models/permissionGroup');

const generateToken = (userData, cb) => {
    console.log('userData', userData)
    var token = jwt.sign({
        email: userData.userData ? userData.userData.email : userData.email,
        user_id: userData.userData ? userData.userData._id : userData._id,
        role: userData.userData ? userData.userData.role : userData.role,
        // isMobile: userData.isMobile ? userData.isMobile : false,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 60 * 1000),
  
    }, "newsdb");
    cb(token)
}
  
const decodeToken = (token) => {
    var decoded = jwt.decode(token, "newsdb");
    return decoded;
}

const getTimezone = (token) => {    
    return 'Asia/Kolkata';
}

const sendEmail = (data) => {
    let smtpTransport = nodemailer.createTransport({
        tls: { rejectUnauthorized: false },
        secureConnection: false,
        host: "smtp.gmail.com",
        port: 587,
        requiresAuth: true,
        auth: {
            user: process.env.mail_username,
            pass: process.env.mail_password
        }
    });

    let mailOptions = {
        to: data.email,
        from: process.env.mail_username,
        subject: data.subject,
        html: data.body
    };

    if (data.attachments) {
        mailOptions.attachments = data.attachments
    }

    if (data.cc && data.cc.length > 0) {
        mailOptions.cc = data.cc;
    }

    smtpTransport.sendMail(mailOptions, function (err) {
        console.log('mail err', err);
        return true;
    });
}

const createDir = (targetDir) => {
    const path = require('path');
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir);
    if (!fs.existsSync(curDir)) {
        fs.mkdirSync(curDir);
    }
    return curDir;
    }, initDir);
}

/* To unlink files */
const unlinkFile = (oldImage) => {
    console.log('unlinkFile oldImage err --', oldImage);
    fs.stat(oldImage, function (err, stat) {
      console.log('user oldImage err --', err, stat);
      if (err == null) {
        fs.unlinkSync(oldImage, function (err, succ) {
          if (err) {
            console.log('user.profileImage err --', err);
          } else {
            console.log('user.profileImage suc --');
          }
        });
      } else if (err.code == 'ENOENT') {
        console.log('user.profileImage ENOENT --');
      } else {
        console.log('user.profileImage ENOENT else--');
      }
    });
}

const writeFile = (errLog, folder) => {
    var updatedAt = new Date();
    var date = new Date(updatedAt.getTime() + moment.tz(getTimezone()).utcOffset() * 60000);
    errLog += "########## \r\n";
    createDir(`./${folder}`);
    fs.appendFileSync(`./${folder}/${date.toISOString().slice(0, 10)}.txt`, errLog + "\r\n", function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
}

// const getPermissionGroupId = (groupName, cb) => {
//     groupModule.findOne({ name: groupName })
//       .exec((error, groupData) => {
//         cb(error, groupData)
//     })
// }

const base64Upload = (path, base64Str) => {
    createDir(path);
    var ext = base64Str.substring(base64Str.indexOf('/') + 1, base64Str.indexOf(';base64'));
    console.log('base64Upload ext - ', ext);
    picName = randomstring.generate({
        length: 8,
        charset: 'alphanumeric'
    });

    if (ext == 'png') {
        console.log('base64Upload png - ', ext);
    }
    if (ext != 'pdf' && ext != 'csv') {
        console.log('base64Upload pdf - ', ext);
        ext = 'jpg'
    }
    var optionalObj = { 'fileName': picName, 'type': ext };
    console.log('extension ----- ', picName)

    let newBase64Str = base64Str.replace(/(\r\n|\n|\r)/gm, "")
    var Image = base64ToImage(newBase64Str, path, optionalObj);
    console.log('Image fileName----- ', Image.fileName)

    if (ext != 'pdf' && ext != 'csv') {
        // return picName
        return Image.fileName;
    }
    return Image.fileName;
}

const getThumbnail = (dir, fileName, tempfileName, cb) => {
    console.log("getThumbnail-", dir, 'fileName-', fileName, 'tempfileName-', tempfileName);

    // generate thumbnail
    var thumb = require('node-thumbnail').thumb;
    thumb({
    prefix: '',
    suffix: '_small',
    source: dir + fileName,
    destination: dir,
    width: 100,
    overwrite: true,
    concurrency: 4,
    basename: tempfileName
    }).then(function () {
        console.log("getThumbnail function")
    }).catch(function (e) {
        console.log("getThumbnail e-", e)
    });

    thumb({
    prefix: '',
    suffix: '_medium',
    source: dir + fileName,
    destination: dir,
    width: 300,
    overwrite: true,
    concurrency: 4,
    basename: tempfileName
    }).then(function () {
        console.log("getThumbnail function")
    }).catch(function (e) {
        console.log("getThumbnail e-", e)
    });
    cb(true)
}

const randomDarkColor = () => {
    var lum = -0.25;
    var hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    var rgb = "",
        c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }
    console.log('rgb -- ', rgb);

    return hexToRGB(rgb)
}

const hexToRGB = (hex) => {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    console.log('hexToRGB  -- ', [r, g, b]);
    
    return { red: r, green: g, blue: b }
}

const renderMessageFromTemplateAndVariables = (templateData, variablesData) => {
    var Handlebars = require('handlebars');
    return Handlebars.compile(templateData)(variablesData);
}

const hits = async (_id) => {
    const idParam = _id;
    await Post.findOne({ _id: idParam })
        .then(result => {
            if (!result) {
                return res.status(404).json({
                    title: `Cannot update Post with id=${idParam}. Maybe Post was not found!`,
                    error: true
                })
            } else {
                console.log('result', result.hits)
                    let views =result.hits +1        
                    Post.findByIdAndUpdate(idParam, {hits: views}, { useFindAndModify: false })
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
            }
        })
    }

module.exports = {
    generateToken,
    decodeToken,                                                                                            
    sendEmail,
    createDir,
    unlinkFile,
    writeFile,
    // getPermissionGroupId,
    base64Upload,
    getThumbnail,
    randomDarkColor,
    getTimezone,
    renderMessageFromTemplateAndVariables,
    hits
}