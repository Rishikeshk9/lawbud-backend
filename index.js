const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 5500;
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");
const userMiddleware = require("./helper/userMiddleware");

var testAPIRouter = require("./routes/api_status");
const userRouter = require("./routes/userRoutes/userRoutes");
const categoryRouter = require("./routes/categoryRoutes/categoryRoutes");

const userAuthRouters = require("./routes/userRoutes/userAuthRoutes");

let User = require("./models/user.model");

require("dotenv").config();

const corsOptions = {
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
};
// app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.set("view engine", "ejs");
app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));
app.use('/user', userRouter);
app.use('/user', userAuthRouters);
app.use('/category', categoryRouter);

app.use("/status-api", testAPIRouter);

const uri = process.env.ATLAS_URI;
const dbName = "lawbud";

mongoose.connect(uri);
const client = new MongoClient(uri);

// Database Linking
app.listen(port, () => {
  console.log(`server is listening on Port  ${port}`);

  connectDB();
});

async function connectDB() {
  client.connect();
  const db = client.db(dbName);

  const collection = db.collection("user");
  console.log("🟢DB Conencted...",await collection.countDocuments());
}

// create a GET route
app.get("/express_backend", (req, res) => {
  //Line 9
  res.send({ express: "YOUR EXPRESS BACKEND IS WORKING FINE" }); //Line 10
});

