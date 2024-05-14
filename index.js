const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ extended: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zyr5lk0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
  

    
    const blogsCollection = client.db("Ashborn").collection("blogs");
    const commentsCollection =client.db("Ashborn").collection("comments");;
    const wishlistCollection =client.db("Ashborn").collection("wishlists");

    // Get all blog posts
    app.get("/blogs", async (req, res) => {
     
        const result = await blogsCollection.find().toArray();
        res.json(result);
     
    });

    app.post('/blogs',async(req,res)=>{
      const newBlog=req.body;
      console.log(newBlog);
      const result =await blogsCollection.insertOne(newBlog)
      res.send(result)
    })
    app.put('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBlog = req.body;
      const updateDoc = {
        $set: {
          ...updatedBlog,
        }
      };
      const result = await blogsCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    

    // Get a single blog post by ID
    app.get("/blog/:id", async (req, res) => {
      const id = req.params.id;
   
      const query = { _id: new ObjectId(id) };
     
        const result = await blogsCollection.findOne(query);
      
        res.json(result);
      
  });
    app.delete('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await blogsCollection.deleteOne(query);

      res.send(result);
    });


// Get all wishlist items
app.get("/wishlists", async (req, res) => {
  
  const result = await wishlistCollection.find().toArray();
  res.send(result);

});



// Add item to wishlist
app.post("/wishlists", async (req, res) => {

  const wishlistData = req.body;
  const result = await wishlistCollection.insertOne(wishlistData);
  res.send(result);

});
// Get item from wishlist by ID
app.get("/wishlists/:id", async (req, res) => {

  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await wishlistCollection.findOne(query);
  res.send(result);

});

app.delete('/wishlists/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: (id) };
  const result = await wishlistCollection.deleteOne(query);
  
  res.send(result);
  });
   // Endpoint to get comments by blog ID
   app.get('/comments/:blogId', async (req, res) => {
    const { blogId } = req.params;
    try {
      const comments = await commentsCollection.find({ blogId }).toArray();
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
   // Endpoint to get comments by blog ID
app.get('/comments', async (req, res) => {
  const { blogId } = req.query;
  try {
    const comments = await commentsCollection.find({ blogId }).toArray();
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error', details: error });
  }
});
  
    // Endpoint to add a new comment
    app.post('/comments', async (req, res) => {
      const { blogId, name, image, text } = req.body;
      const newComment = {
        blogId,
        name,
        image,
        text
      };
      try {
        const result = await commentsCollection.insertOne(newComment);
        newComment._id = result.insertedId;
        res.status(201).json(newComment);
      } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// Root route
app.get("/", async (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
