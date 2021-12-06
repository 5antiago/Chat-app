const express = require("express");
const app = express();

const path = require("path");

const http = require("http");
const server = http.createServer(app);

const {Server} = require("socket.io");

const io = new Server(server);

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname,'..', 'client/index.html'));
});

io.on('connection', (socket) => {
    let username;
    socket.on('disconnect', (msg)=>{
        socket.broadcast.emit('userdisconected', `${username} se desconectó`); 
    });
    socket.on('message', (msg)=>{
        socket.broadcast.emit('message', msg);
    });
    socket.on('typing', (msg)=>{
        socket.broadcast.emit('typing', msg);
    });
    socket.on('register', (msg)=>{
        username = msg;
        socket.broadcast.emit('register', `${username} se ha unido`)
    });
});

server.listen(3000, () => {
    console.log("Server running");
});
