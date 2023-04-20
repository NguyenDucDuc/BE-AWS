const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { indexRouter } = require("./routes");
const fileUpload = require("express-fileupload");
const { client } = require("./databases/redis.init");
<<<<<<< HEAD
=======
const mongoose = require("mongoose");
const {User} = require('./models');
const { Message } = require("./schemas/message.schema");
const messageController = require("./controllers/message.controller");

// -- connect mongodb
mongoose
  .connect("mongodb://localhost:27017/chatdb")
  .then(() => console.log("mongodb connected"));

>>>>>>> 2f13ecb6ab8cd0ec2ebaf38c5cd5fea920506d5d
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
require("dotenv").config();

app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(cors());
app.use(indexRouter);

<<<<<<< HEAD
let onlineUsers = [];

const addNewUser = (username, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  console.log(`${socket.id} connected`);

  socket.on("newUser", (username) => {
    console.log("Add new user");
    addNewUser(username, socket.id);
    console.log(onlineUsers);
  });

  socket.on(
    "sendNotification",
    ({ senderName, receiverName, content, valueId }) => {
      console.log({ receiverName, content });
      const receiver = getUser(receiverName);
      io.to(`${receiver?.socketId}`).emit("getNotification", {
        content: content,
        valueId,
      });
    }
  );

  socket.on("sendText", ({ senderName, receiverName, text }) => {
    const receiver = getUser(receiverName);
    io.to(`${receiver?.socketId}`).emit("getText", {
      senderName,
      text,
    });
  });

  socket.on("logout", () => {
    console.log("Logout");
    removeUser(socket.id);
    console.log(onlineUsers);
  });
=======
const setUpSocketRedis = async () => {
  let arrClientSocket = []
  await client.set('sockets', JSON.stringify(arrClientSocket))
}

setUpSocketRedis()

io.on("connection", async (socket) => {
  console.log(`${socket.id} connected`);
  // -- client login
  socket.on("clientLogin", async (data) => {
  let arrCientSocket = JSON.parse(await client.get('sockets'))
    const newSocketClient = {
      userId: data.userId,
      socketId: socket.id,
    }
    // -- kiem tra neu co trong redis thi update
    const index = arrCientSocket.findIndex((item) => item.userId === newSocketClient.userId)
    if(index === -1){
      arrCientSocket.push(newSocketClient)
      await client.set('sockets', JSON.stringify(arrCientSocket))
    } else if (index !== -1) {
      arrCientSocket[index] = newSocketClient
      await client.set('sockets', JSON.stringify(arrCientSocket))
    } 
  });
  // -- disconect
  socket.on("disconnect", async (data) => {
    let arrCientSocket = JSON.parse(await client.get('sockets'))
    if(arrCientSocket.length > 0){
      arrCientSocket = arrCientSocket.filter(item => item.socketId !== socket.id)
      await client.set('sockets', JSON.stringify(arrCientSocket))
    }
  });
  // -- send message
  socket.on("clientSendMessage", async (data) => {
    let arrClientSocket = JSON.parse(await client.get('sockets'))
    const receiverSocket = arrClientSocket.find((item) => item.userId === data.receiverId)
    
    if(receiverSocket){
      // socket.to(receiverSocket.socketId).emit("serverSendMessage", data)
      socket.broadcast.emit('serverSendMessage', data)
    }
  })
>>>>>>> 2f13ecb6ab8cd0ec2ebaf38c5cd5fea920506d5d
});

server.listen(5000, () => {
  console.log("server is running...");
});
