const express = require("express");
const app = express();

const path = require("path");

const http = require("http");
const server = http.createServer(app);

const env = require("dotenv/config");

const {Server} = require("socket.io");

const io = new Server(server);

var userlist = [];

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname,'..', 'client/index.html'));
});

io.on('connection', (socket) => {
    let username;  
    io.emit('usersconnected', userlist);

    socket.on('disconnect', (msg)=>{
        if(username === undefined) return
        socket.broadcast.emit('userdisconnected', `${username} se desconectó`);
        userlist.pop(username);
        socket.broadcast.emit('usersconnected', userlist);
    });
    socket.on('message', (msg)=>{
        socket.broadcast.emit('message', msg);
    });
    socket.on('typing', (msg)=>{
        socket.broadcast.emit('typing', msg);
    });
    socket.on('register', (msg)=>{
        username = msg;
        userlist.push(username);
        io.emit('usersconnected', userlist);
        socket.broadcast.emit('register', `${username} se ha unido`)
    });
    
});
server.listen(process.env.PORT, () => {
    console.log("Server running");
});
