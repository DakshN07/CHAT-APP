const express = require("express");
const path = require('path');
const app = express();
const http = require('http');
const {Server} = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

let users = {};
let userColors = ["user1", "user2", "user3", "user4", "user5", "user6", "user7", "user8", "user9", "user10"];
let userColorIndex = {};
let colorIndex = 0;

io.on('connection', (socket) => {
    socket.on("new-user-joined", (username) => {
        users[socket.id] = username;
        if (!userColorIndex[username]) {
            userColorIndex[username] = userColors[colorIndex];
            colorIndex = (colorIndex + 1) % userColors.length;
        }
        socket.broadcast.emit("user-joined", username);
        socket.emit("user-color", userColorIndex[username]);
    });

    socket.on("user-message", (message) => {
        io.emit('message', `${users[socket.id]}: ${message}`);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user-left', users[socket.id]);
        delete users[socket.id];
    });
});

app.use(express.static(path.resolve('./public')));
app.get("/", (req, res)=>{
    return res.sendFile("/public/index.html");
})
server.listen(9000, () => console.log('Server Started at PORT http://localhost:9000'));