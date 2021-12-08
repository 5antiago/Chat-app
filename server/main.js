const express = require("express");
const app = express();

const path = require("path");

const http = require("http");
const server = http.createServer(app);

const env = require("dotenv/config");

const {Server} = require("socket.io");
const { response } = require("express");

const io = new Server(server);

const users = new Map();

function broadcastusers(){
    io.emit('usersconnected', [...users.keys()]);
}
function userexist(id){
    return [...users].find(([key, value]) => id === value);
}

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname,'..', 'client/index.html'));
});
app.use(express.static('public'));

io.on('connection', (socket) => {
    broadcastusers();

    socket.on('disconnect', (msg)=>{
        if(socket.username === undefined) return
        socket.broadcast.emit('userdisconnected', `${socket.username} se desconectó`);
        users.delete(socket.username);
        broadcastusers();
    });
    socket.on('message', (msg)=>{
        let response = {msg: msg}
        response.sender=userexist(socket.id);
        if(response.sender === undefined) return socket.disconnect(true);
        response.sender = response.sender[0];
        socket.broadcast.emit('message', response);
    });
    socket.on('typing', (msg)=>{
        if(msg === 1 || msg ===0) socket.broadcast.emit('typing', msg);
        else return;
    });
    socket.on('register', (msg, callback)=>{
        socket.username = msg;
        if(userexist(socket.id) !== undefined || callback === undefined) 
            return io.to(socket.id).emit('usersconnected', ['Dont do that']);

        while(users.has(socket.username)){
            socket.username += Math.floor(Math.random() * (9));
        }
        if(socket.username === msg){
            callback({status: "ok"});
        }
        else{
            callback({status: "!ok", nick: socket.username});
        }
        users.set(socket.username, socket.id);
        broadcastusers();
        socket.broadcast.emit('register', `${socket.username} se ha unido`)
    });
    
});
server.listen(process.env.PORT, () => {
    console.log("Server running");
});
