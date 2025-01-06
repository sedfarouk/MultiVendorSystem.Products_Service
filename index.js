const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const productRoutes = require("./api/products");
const { CreateChannel } = require("./utils");

dotenv.config();

const app = express();
const port = process.env.PORT || 8002;

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

const logger = console.log;

async function startApp() {
  try {
    await mongoose.connect(process.env.DB_URI);
    logger("Database connection established");

    const channel = await CreateChannel();

    await productRoutes(app, channel);

    app.listen(port, () => {
      logger(`Product Service is listening on port ${port}`);
    });
  } catch (err) {
    logger("Failed to start app:", err);
  }
}

startApp();