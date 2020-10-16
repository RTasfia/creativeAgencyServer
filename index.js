const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectID;

var MongoClient = require('mongodb').MongoClient;

require('dotenv').config();

var uri = `mongodb://${process.env.db_user}:${process.env.db_pass}@cluster0-shard-00-00.ibh58.mongodb.net:27017,cluster0-shard-00-01.ibh58.mongodb.net:27017,cluster0-shard-00-02.ibh58.mongodb.net:27017/${process.env.db_name}?ssl=true&replicaSet=atlas-60jtz6-shard-0&authSource=admin&retryWrites=true&w=majority`

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('doctors'));
app.use(fileUpload());


MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {

    // SERVICE
    const serviceCollection = client.db("creativeAgency").collection("service");

    // insert all serices to db
    app.post("/allService", (req, res) => {
        const newService = req.body;
        console.log(newService);
        serviceCollection.insertMany(newService)
            .then(result => {
                console.log(result);
            })
    })
    console.log("done");

    // Show all services
    app.get("/services", (req, res) => {
        serviceCollection.find({})
            .toArray((err, document) => {
                res.send(document);
            })
    })

    // Add service
    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        console.log(file);
        console.log(title);
        console.log(description);
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        serviceCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })



    // REVIEW

    const reviewCollection = client.db("creativeAgency").collection("review");

    // Add all review
    app.post("/allReview", (req, res) => {
        const newReview = req.body;
        console.log(newReview);
        reviewCollection.insertMany(newReview)
            .then(result => {
                console.log(result);
            })
    })

    // Show all review
    app.get("/reviews", (req, res) => {
        reviewCollection.find({}).limit(6)
            .toArray((err, document) => {
                res.send(document);
            })
    })

    // add review
    app.post("/addReview", (req, res) => {
        const newReview = req.body;
        console.log(newReview);
        reviewCollection.insertOne(newReview)
            .then(result => {
                console.log(result);
            })
    })


    // CUSTOMER 

    const customerCollection = client.db("creativeAgency").collection("customer");

    // Add customer
    app.post("/addCustomer", (req, res) => {
        const newCustomer = req.body;
        console.log(newCustomer);
        customerCollection.insertOne(newCustomer)
            .then(result => {
                console.log(result);
            })
    })

    // Show current customer
    app.get("/currentUser", (req, res) => {
        console.log(req.query.email);
        customerCollection.find({ email: req.query.email })
            .toArray((err, document) => {
                res.send(document);
            })
    })

    // Show all customer
    app.get("/allCustomer", (req, res) => {
        customerCollection.find({})
            .toArray((err, document) => {
                res.send(document);
            })
    })
    // Update Status
    app.post("/updateStatus", (req, res) => {
        const newStatus = req.body;
        const id = req.body.id;
        const status = req.body.status;
        console.log(newStatus, id, status);
        customerCollection.updateOne(
            { _id: ObjectID(id) },
            { $set: { status: `${status}` } },
            { upsert: true })
            .then(result => {
                console.log(result);
            })
    })

    //ADMIN
    const adminCollection = client.db("creativeAgency").collection("admin");

    // Make admin
    app.post("/addAdmin", (req, res) => {
        const newAdmin = req.body;
        console.log(newAdmin);
        adminCollection.insertOne(newAdmin)
            .then(result => {
                console.log(result);
            })
    })

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admin) => {
                res.send(admin.length > 0);
            })
    })
});

app.get("/", (req, res) => {
    res.send("listening");
})
app.listen(process.env.PORT || 5000);