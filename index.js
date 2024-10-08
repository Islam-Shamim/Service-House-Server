const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.xl5jfsu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const serviceCollection = client.db('carService').collection("services");
    const bookingCollection = client.db('carService').collection('booking');
    //services
    app.get('/services',async(req,res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/services/:id',async(req,res)=>{
        const id = req.params.id;
        const query = { _id : new ObjectId(id) };

        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: {title: 1, price: 1 , img:1 },
          };

        const result = await serviceCollection.findOne(query,options);
        res.send(result);
    })


    //booking
    app.get('/booking',async(req,res)=>{
      console.log(req.query?.email);
      let query = {};
      if(req.query?.email){
        query = {email : req.query.email};
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/booking/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result);

    })

    app.post('/booking',async(req,res)=>{
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })

    app.put('/booking/:id',async(req,res)=>{
      const id = req.params.id;
      const updateBooking = req.body;
      const filter = { _id : new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateBooking.status 
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc, options);
      res.send(result);

    })

    app.delete('/booking/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id : new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send("Car Server is running");
})

app.listen(port,()=>{
    console.log(`Car server is running on port : ${port}`)
})