const express = require("express");
const app = express();
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const ioServer = require("socket.io");
var io = new ioServer();

let sequenceNumberByClient = new Map();
let chat_storage = [];
var user_ind = 0;

if (fs.existsSync("keys/privkey2.pem")) {
  const https_port = 8080;
  const privateKey = fs.readFileSync("keys/privkey2.pem", "utf8");
  const certificate = fs.readFileSync("keys/cert2.pem", "utf8");
  const ca = fs.readFileSync("keys/fullchain2.pem", "utf8");
  const credentials = { key: privateKey, cert: certificate, ca: ca };
  const https = require("https").createServer(credentials, app);
  io.attach(https);
  https.listen(https_port, () => {
    console.log(`HTTPS Server running on port ${https_port}`);
  });
} else {
  const http_port = 8080;
  const http = require("http").createServer(app);
  io.attach(http);
  http.listen(http_port, function () {
    console.log(`Listening on ${http_port}`);
  });
}

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/public/js/pictionary.js", function (req, res) {
  res.sendFile(path.join(__dirname, "public/js/pictionary.js"));
});

app.get("/public/css/style.css", function (req, res) {
  res.sendFile(path.join(__dirname, "public/css/style.css"));
});

app.use("/public/img", express.static(path.join(__dirname, "public/img")));

io.on("connection", function (socket) {
  if (!sequenceNumberByClient.has(socket)) {
    sequenceNumberByClient.set(socket);
    let cid = `AnonUser${user_ind++}`;
    sequenceNumberByClient.set(socket, { socket_id: socket.id, username: cid });
    console.info(`Client connected [id=${socket.id}]`);
    io.emit(
      "pictionary_users",
      JSON.stringify([...sequenceNumberByClient.values()])
    );
    console.table(sequenceNumberByClient);
    socket.emit("pictionary_id", { id: socket.id, cid: cid });
  }

  socket.on("pictionary_username", function (options) {
    let username_options = JSON.parse(options);
    sequenceNumberByClient.set(socket, {
      socket_id: socket.id,
      username: `${username_options.username}`,
    });

    console.log(
      `Client connected [id=${socket.id}] set username to ${username_options.username}`
    );

    let username_set_options = {
      set_name: true,
      username: username_options.username,
    };
    socket.emit("pictionary_username", JSON.stringify(username_set_options));
    let all_users = JSON.stringify([...sequenceNumberByClient.values()]);
    io.emit("pictionary_users", all_users);
    console.log(`Broadcast all users: ${all_users}`);
  });

  socket.on("chatbox", function (options) {
    let chat_options = JSON.parse(options);
    chat_storage.push(chat_options);
    let chat_to_send_obj = {
      chat_from: sequenceNumberByClient.get(socket).username,
      chat_text: chat_options.chat_text,
      id: chat_storage.length,
    };

    io.emit("chatbox", JSON.stringify(chat_to_send_obj));
    console.log(JSON.stringify(chat_to_send_obj));
  });

  socket.on("pictionary_mousemove", function (data) {
    socket.broadcast.emit("pictionary_moving", data);
  });

  socket.on("game_screenclear", function (data) {
    io.emit("game_screenclear", data);
  });

  socket.on("disconnect", function () {
    let discon_user = sequenceNumberByClient.get(socket).username;
    let discon_socket_id = socket.id;
    sequenceNumberByClient.delete(socket);
    console.info(`Client disconnected [id=${socket.id}] [user=${discon_user}]`);
    io.emit("pictionary_user_disconnect", {
      discon_user: discon_user,
      discon_socket_id: discon_socket_id,
    });
  });
});
