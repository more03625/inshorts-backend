const express = require("express");
const app = express();
require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    autoIndex: true, //this is the code I added that solved it all
    keepAlive: true,
    poolSize: 10,
    bufferMaxEntries: 0,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    useFindAndModify: false,
    useUnifiedTopology: true
  }

//db
mongoose.connect(process.env.DATABASE,options)
.then(()=>console.log("DB Connected")).catch(err=>console.log('DB Not Connected',err));

//empty schema
const posts = new Schema({}, { strict: false });

app.get('/',(req,res)=>{
    res.send('InShorts Clone');
})

app.use(cors());

//fetching posts 
app.use('/api/getPosts',(req,res)=>{
    const category = req.query.category;
    const Post = mongoose.model('post', posts, 'posts');
    Post.find({category:category}).exec((err,data)=>{
        if(err){
            return res.status(400).json({
                error:err
            })
        }
        res.status(200).json(data[0]);
    })
})

const port = process.env.PORT || 8000;

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})