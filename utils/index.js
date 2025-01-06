const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
require("dotenv").config();

module.exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 8);
};

module.exports.comparePassword = async (enteredPassword, savedPassword) => {
  return await bcrypt.compare(enteredPassword, savedPassword);
};

module.exports.createToken = (payload) => {
  try {
    return jwt.sign(payload, "secretKey", { expiresIn: "30d" });
  } catch (error) {
    console.error(error);
    return error;
  }
};

module.exports.verifyToken = async (req) => {
  try {
    const token = req.get("Authorization");
    const payload = jwt.verify(token.split(" ")[1], "secretKey");
    req.user = payload;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

module.exports.formatResponse = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

module.exports.createChannel = async () => {
  try {
    const connection = await amqplib.connect(process.env.MESSAGE_BROKER_URL);
    const channel = await connection.createChannel();
    await channel.assertExchange(process.env.EXCHANGE_NAME, "direct", {
      durable: true,
    });
    return channel;
  } catch (err) {
    throw err;
  }
};

module.exports.publishMessage = (channel, bindingKey, msg) => {
  try {
    channel.publish(process.env.EXCHANGE_NAME, bindingKey, Buffer.from(msg));
    console.log('Message Published');
    console.log("Sent: ", msg);
  } catch (err) {
    throw err;
  }
};

module.exports.subscribeMessage = async (channel, service) => {
  const appQueue = await channel.assertQueue(process.env.QUEUE_NAME, {
    durable: true,
  });
  channel.bindQueue(appQueue.queue, process.env.EXCHANGE_NAME, process.env.PRODUCT_BINDING_KEY);
  channel.consume(appQueue.queue, (data) => {
    console.log('Received data:', data.content.toString());
    service.subscribeEvents(data.content.toString());
    channel.ack(data);
  });
};