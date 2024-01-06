const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const OpenAI = require('openai');

// Midddleware
app.use(cors());
app.use(express.json());

// DOTENV file
require('dotenv').config()


// This code is provided by mongoDB, when create a new connection.
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.swhr3qz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// Ai api
const openai = new OpenAI({
    organization: 'org-sdmzlG3pHIG2l5Vaty1lmueK',
    apiKey: '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'
});



const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    else {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
            if (err) {
                console.log("Error")
                res.status(401).send({ message: 'unauthorized access' });
            }
            else {
                req.decoded = decoded;
                next();
            }
        });
    }
}


// send current user to bind it with JWT token.
app.post('/jwt', async (req, res) => {
    const data = req.body;
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1hr" });
    res.send({ token });
});



async function run() {

    try {
        await client.connect();

        // Give website name as db name. And store data as collection name;
        const Products_Data = client.db("Serene").collection("Products_Data");
        const AllComments = client.db("Serene").collection("Comments");

        const appointmentOptionsCollections = client.db("Serene").collection("doctorDetail");
        const bookingsCollection = client.db("Serene").collection("bookings");

        const doctorsCollection = client.db("Serene").collection("doctors");
        const usersCollection = client.db("Serene").collection("users");

        const postCollection = client.db("Serene").collection("postData");

        const therapyDataCollection = client.db("Serene").collection("therapyData");


        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // Get all users
        app.get('/allusers', async (req, res) => {
            const query = {};
            const allusers = await usersCollection.find(query).toArray();
            res.send(allusers);
        })

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


        // Insert all comments into the database.
        app.post('/comments', async (req, res) => {
            const comments = req.body;
            const result = await AllComments.insertOne(comments);
            res.send(result);
        })

        // get specific service all comments.
        app.get('/comment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { productid: (id) };
            const cursor = await AllComments.find(query);
            const comment = await cursor.toArray();
            res.send(comment);
        })

        // get specific comments
        app.get('/editComments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const comment = await AllComments.findOne(query);
            res.send(comment);
        })


        // This is query 
        // myComment?email=mdjoy@gmail.com (if we need find something without id)
        app.get('/myComment', async (req, res) => {

            const decoded = req.decoded;

            // if (decoded.email !== req.query.email) {
            //     res.status(403).send({ message: 'unauthorized' });
            // }

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = AllComments.find(query);
            const comment = await cursor.toArray();
            res.send(comment);
        });


        // Update user info.
        // upsert means if user not found then insert one. (sometimes no need upsert)
        app.patch('/editComments/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const newComment = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    comment: newComment.comment
                },
            };
            const result = await AllComments.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.delete('/myComment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const myComment = await AllComments.deleteOne(query);
            res.send(myComment);
        })

        // // Find all the data "{}"; When we get the file we have to convert it to Array.
        app.get('/appointmentOptions', async (req, res) => {
            const date = req.query.date;
            const query = {}
            const options = await appointmentOptionsCollections.find(query).toArray();
            const bookingQuery = { appointmentDate: date };
            const alreadybooked = await bookingsCollection.find(bookingQuery).toArray();
            options.forEach(option => {
                const optionBooked = alreadybooked.filter(booked => booked.treatment === option.name);
                const bookedSlot = optionBooked.map(book => book.slot);
                const remainingSlot = option.slots.filter(slot => !bookedSlot.includes(slot));
                option.slots = remainingSlot;
            })
            res.send(options);
        })


        // get only tratment name from appointmentOptionsCollections
        app.get('/appointmentSpeciality', async (req, res) => {
            const query = {}
            const result = await appointmentOptionsCollections.find(query).project({ name: 1 }).toArray();
            res.send(result);
        })


        // Inset data into the database.
        app.post('/bookings', async (req, res) => {
            const booking = req.body;

            const query = {
                email: booking.email,
                appointmentDate: booking.appointmentDate,
                treatment: booking.treatment
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();

            if (alreadyBooked.length) {
                const message = `You already have a booking on ${booking.appointmentDate}`;
                return res.send({ acknowledged: false, message })
            }

            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const authHeader = req.headers.authorization;
            // const decodedEmial = req.decoded.email;

            // if (email !== decodedEmial) {
            //     return res.status(404).send({ message: 'forbidden access' })
            // }


            const query = { email: email };
            const booking = await bookingsCollection.find(query).toArray();
            res.send(booking);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const doctors = await bookingsCollection.deleteOne(filter);
            res.send(doctors);
        })


        // post new doctor information.
        app.post('/doctorsCollection', async (req, res) => {
            const doctor = req.body;
            const result = await doctorsCollection.insertOne(doctor);
            res.send(result);
        })

        app.get('/doctorsCollection', async (req, res) => {
            const query = {};
            const doctors = await doctorsCollection.find(query).toArray();
            res.send(doctors);
        })

        app.delete('/doctorsCollection/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const doctors = await doctorsCollection.deleteOne(filter);
            res.send(doctors);
        })


        // app.get('/comment/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { productid: (id) };
        //     const cursor = await postCollection.find(query);
        //     const post = await cursor.toArray();
        //     res.send(post);
        // })

        // Get all posts


        app.get('/postCollection', async (req, res) => {
            const query = {};
            const allPosts = await postCollection.find(query).toArray();
            res.send(allPosts);
        })

        app.get('/postCollection/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const comment = await postCollection.findOne(query);
            res.send(comment);
        })

        // Post the posts
        app.post('/postCollection', async (req, res) => {
            const doctor = req.body;
            const result = await postCollection.insertOne(doctor);
            res.send(result);
        })


        app.patch('/postCollection/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const newComment = req.body;
            try {
                const result = await postCollection.updateOne(
                    filter,
                    {
                        $push: {
                            comments: newComment
                        }
                    }
                );
                res.send(result);
            } catch (error) {
                res.status(500).send('Error adding comment');
            }
        });


        app.get('/postCollection/:id/comments', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            try {
                const post = await postCollection.findOne(filter);

                if (!post) {
                    return res.status(404).send('Post not found');
                }
                const comments = post.comments;

                res.json(comments);
            } catch (error) {
                res.status(500).send('Error retrieving comments');
            }
        });



        // get all therapy data
        app.get('/therapyData', async (req, res) => {
            const query = {};
            const therapyData = await therapyDataCollection.find(query).toArray();
            res.send(therapyData);
        })

        // Open Ai.
        app.post("/chat", async (req, res) => {
            const question = req.body.question;
            try {
                const response = await openai.completions.create({
                    model: "gpt-3.5-turbo-instruct",
                    prompt: question,
                    max_tokens: 4000,
                    temperature: 0,
                });

                const answer = response?.choices?.[0]?.text || "";
                const array = answer.split("\n").filter((value) => value).map((value) => value.trim());

                res.json({
                    answer: array,
                    Prompt: question
                });
            } catch (error) {
                console.error("Error occurred:", error);
                res.status(500).json({ error: "An error occurred while processing the request" });
            }
        });

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