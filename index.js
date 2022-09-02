const express=require('express');
const app=express();
const cors=require('cors');
// require('dotenv').config()
const port=process.env.PORT || 8080;
const { MongoClient, ServerApiVersion, ObjectId, Logger } = require('mongodb');
const fileUpload=require('express-fileupload');


const uri = "mongodb+srv://farmfood:farmershope@cluster0.qujmu7h.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//middleware
app.use(cors())
app.use(express.json())
app.use(fileUpload());

async function run(){
    try{
        await client.connect();
        const database = client.db("farmfood");
        const productsCollection = database.collection('products');
        const orderCollection = database.collection('orders');
        const userCollection = database.collection('users');

        app.post('/products',async(req,res)=>{
      
            const productInfo=req.body;

            console.log(productInfo);
           
            const result=await productsCollection.insertOne(productInfo);
            res.json(result)
        })

        app.get('/products',async(_,res)=>{
            const cursor=productsCollection.find({});
            const result=await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:id',async(req,res)=>{
            const keys=req.params.id;
            
            const query={_id:ObjectId(keys)}
              const cursor=await productsCollection.findOne(query);
             res.send(cursor);
        })

          app.put('/products/:id', async (req, res) => {
            const key=req.params.id;
            const rating = req.body;
          console.log(rating);
            const filter = { _id: ObjectId(key) };
            const options = { upsert: true };
            const updateDoc = { $set: rating };
            const result = await productsCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.post('/orders',async(req,res)=>{
      
            const orderInfo=req.body; 
           console.log(orderInfo);
            const result=await orderCollection.insertOne(orderInfo);
            res.json(result)
        })

        app.get('/orders',async(_,res)=>{
            const cursor=orderCollection.find({});
            const result=await cursor.toArray();
            res.send(result);
        })

        app.delete('/orders',async(req,res)=>{
           const orderId=req.body.orderId;
           const query={_id:ObjectId(orderId)};
           const result=await orderCollection.deleteOne(query);
           res.json(result);

        })

        app.get('/myorders',async(req,res)=>{
            const email=req.query.email;
            console.log(email);
            const query={email:email};
            const cursor=orderCollection.find(query);
            const result=await cursor.toArray();
            res.json(result);
          });

          app.post('/users',async(req,res)=>{
            const userInfo=req.body; 
           
            const result=await userCollection.insertOne(userInfo);
            res.json(result)
          })

          app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        app.get('/users',async(_,res)=>{
          const cursor=userCollection.find({});
          const result=await cursor.toArray();
          res.send(result);
      })


        app.get('/users/:email',async(req,res)=>{
            const email=req.params.email;
            const query={email:email};
            const user=await userCollection.findOne(query);
            let isAdmin=false;
            if(user?.role==='admin'){
              isAdmin=true;
            }
            res.json({admin:isAdmin});
          });
    }
finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/',async(_,res)=>{
    res.send("Hello from farmfood");
})



app.listen(port,()=>{
    console.log(`listening to port , ${port}`);
})