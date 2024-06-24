/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
No part of this assignment has been copied manually or electronically from any other source (including 3rd party web sites) or distributed to other students.

Name: Krish Sanjaybhai Patel
Student ID: 106198237
Date: 10 June 2024
Vercel Web App URL: https://web322-app-krishxps.vercel.app/
GitHub Repository URL: https://github.com/krishxps/web322-app

********************************************************************************/ 

const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const storeService = require('./store-service');

const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
    cloud_name: 'dh0zkzgpk',
    api_key: '645712828111368',
    api_secret: 'FJuB75gHkggMxdNmaG8EPSehV5w'
});

const upload = multer();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

app.get('/items', (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then(data => res.json(data))
            .catch(err => res.status(500).json({ message: err }));
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then(data => res.json(data))
            .catch(err => res.status(500).json({ message: err }));
    } else {
        storeService.getAllItems()
            .then(data => res.json(data))
            .catch(err => res.status(500).json({ message: err }));
    }
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

app.get('/items/:id', (req, res) => {
    storeService.getItemById(req.params.id)
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ message: err }));
});

app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'additem.html'));
})

app.post('/items/add', upload.single('featureImage'), (req, res,next) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
    
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
    
        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
    
        upload(req).then((uploaded)=>{
            processItem(uploaded.url);
        });
    }else{
        processItem("");
    }
     
    function processItem(imageUrl){
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => res.redirect('/items'))
            .catch(err => res.status(500).json({ message: err }));
    }
})

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Express http server listening on port http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.log(`Unable to start server: ${err}`);
    });

module.exports = app;
