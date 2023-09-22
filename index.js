const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


// FinalProject
// AuQ1rTI01n3DWsIR

// This code is provided by mongoDB, when create a new connection.
const uri = "mongodb+srv://Mongo-recheck-1:xOBlO8SEWHGJMTkM@cluster0.swhr3qz.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        await client.connect();

        // Give website name as db name. And store data as collection name;
        const user1 = client.db("Serene").collection("Products_Data");


        // Find all the data "{}"; When we get the file we have to convert it to Array.
        // app.get('/users', async (req, res) => {
        //     const query = {}
        //     const cursor = user1.find(query);
        //     const users = await cursor.toArray();
        //     res.send(users);
        // })


        // get specific data
        // app.get('/user/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const user = await user1.findOne(query);
        //     res.send(user);
        // })

        // Inset data into the database.
        // app.post('/users', async (req, res) => {
        //     const user = req.body;
        //     const result = await user1.insertOne(user);
        //     res.send(result);
        // })

        // Update user info.
        // upsert means if user not found then insert one. (sometimes no need upsert)
        // app.put('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const user = req.body;
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: {
        //             name: user.name,
        //             email: user.email
        //         },
        //     };
        //     const result = await user1.updateOne(filter, updateDoc, options);
        //     res.send(result);
        // })

        // app.delete('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await user1.deleteOne(query);
        //     res.send(result);
        // })

        // This is query 
        // orders?email=mdjoy@gmail.com (if we need find something without id)
        // app.get('/orders', async (req, res) => {
        //     let query = {};
        //     if (req.query.email) {
        //         query = {
        //             email: req.query.email
        //         }
        //     }
        //     const cursor = Orders.find(query);
        //     const orders = await cursor.toArray();
        //     res.send(orders);
        // });

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