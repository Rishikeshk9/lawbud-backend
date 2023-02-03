const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes");
require("dotenv").config();

const uri = process.env.ATLAS_URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

const corsOptions = {
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/", routes);

app.listen(port, () => {
  console.log(`Success! Your application is running on port ${port}.`);
});
