const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Midddleware
app.use(cors());
app.use(express.json());

// DOTENV file
require('dotenv').config()


// This code is provided by mongoDB, when create a new connection.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.swhr3qz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        await client.connect();

        // Give website name as db name. And store data as collection name;
        const Products_Data = client.db("Serene").collection("Products_Data");


        // Find all the data "{}"; When we get the file we have to convert it to Array.
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = Products_Data.find(query);
            const users = await cursor.toArray();
            res.send(users);
        })

        // Inset data into the database.
        app.post('/product', async (req, res) => {
            const user = req.body;
            const result = await Products_Data.insertOne(user);
            res.send(result);
        })


        // get specific product data.
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const user = await Products_Data.findOne(query);
            res.send(user);
        })

        // Filter product with query (email)
        // orders?email=mdjoy@gmail.com (if we need find something without id)
        app.get('/myProduct', async (req, res) => {
            let query = {};
            if (req.query.sellerEmail) {
                query = {
                    sellerEmail: req.query.sellerEmail
                }
            }
            const cursor = Products_Data.find(query);
            const product = await cursor.toArray();
            res.send(product);
        });



        // Update user info.
        // upsert means if user not found then insert one. (sometimes no need upsert)
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const product = req.body;

            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    category: product.category,
                    name: product.name,
                    sellerName: product.sellerName,
                    sellerEmail: product.sellerEmail,
                    ratings: product.ratings,
                    ratingsCount: product.ratingsCount,
                    img: product.img,
                    quantity: product.quantity,
                    price: product.price,
                    stock: product.stock,
                    shipping: product.shipping,
                    description: product.description
                },
            };
            console.log(updateDoc);
            const result = await Products_Data.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await Products_Data.deleteOne(query);
            res.send(result);
        })



    } finally {
        // We don't need to close the connnection.
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Final Project')
})

// CMD page show this message.
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})