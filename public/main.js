"Use strict"
const socket = io();
const messages = document.getElementById("messages");
const modalwindow = document.getElementById("modal");
const userswindow = document.getElementById("users");
const userscountlabel = document.getElementById("users-connected");
const typinglabel = document.getElementById("typing");

document.getElementById("form-nick").addEventListener("submit", (e)=>{
    e.preventDefault();
    let input = document.getElementById("input-nick");
    if(input.value){
        socket.emit('register', input.value, async (response)=>{
            input.style.display="none";
            if(response.status !== "ok"){
                document.getElementById("labelregister").innerHTML=`<p>Ya existe un usuario con ese nombre. <br> Su nombre de usuario será: ${response.nick} </p>`;
                setTimeout(()=>{
                    modalwindow.style.display="none";
                    document.getElementById("register").style.display="none";
                }, 2000);
            }
            else{
                modalwindow.style.display="none";
                document.getElementById("register").style.display="none";
            }
            modalwindow.addEventListener("click", (e)=>{
                if(e.target.id === "modal" ){
                    modalwindow.style.display="none";
                    userswindow.classList.toggle("hidden");
                }
            });
        });
    }
    let item = document.createElement('div');
    item.textContent = "Te has unido al chat";
    item.classList.add("server-message");
    messages.appendChild(item);
});
userscountlabel.addEventListener("click", (e)=>{
    modalwindow.style.display="flex";
    userswindow.classList.toggle("hidden");
});
document.getElementById("form").addEventListener("submit", (e)=>{
    e.preventDefault();
    let input = document.getElementById("input"); 
    if(input.value){
        socket.emit('message', input.value);
        let message = document.createElement('div');
        message.textContent = input.value;
        message.classList.add("send", "message");
        messages.appendChild(message);
        input.value = '';
        window.scrollTo(0, messages.scrollHeight);
    }
});
socket.on('message', (msg)=>{
    let item = document.createElement('div');
    let content = document.createElement('p');
    let sender= document.createElement('label');
    sender.classList.add("sender");
    item.classList.add("message", "received");
    sender.innerText=msg.sender;
    content.innerText = msg.msg;
    item.appendChild(sender);
    item.appendChild(content);
    messages.appendChild(item);
    window.scrollTo(0, messages.scrollHeight);
});
let lasttime = Date.now();
let timer = setTimeout(()=>{
    socket.emit("typing", 0);
},
1500);
document.getElementById("input").addEventListener("keyup", (e)=>{
    if(e.key === "Enter"){
        return;
    }
    if ((Date.now() - lasttime) > 700){
        clearTimeout(timer)
        socket.emit('typing', 1);
        lasttime = Date.now();
        timer = setTimeout(()=>{
            socket.emit("typing", 0);
            },
        1500);
    }
});
socket.on("typing", (msg)=>{
    if(msg === 1){
        if(typinglabel.classList.value === "hidden"){
            userscountlabel.classList.toggle("hidden");
            typinglabel.classList.toggle("hidden");
        }
    }
    if(msg === 0){
        if(typinglabel.classList.value !== "hidden"){
        typinglabel.classList.toggle("hidden");
        userscountlabel.classList.toggle("hidden");
        }
    }
});
socket.on('register', (msg)=>{
    let item = document.createElement('div');
    item.textContent = msg;
    item.classList.add("server-message");
    messages.appendChild(item);
    window.scrollTo(0, messages.scrollHeight);
});
socket.on('userdisconnected', (msg)=>{
    let item = document.createElement('div');
    item.textContent = msg;
    item.classList.add("server-message");
    messages.appendChild(item);
    window.scrollTo(0, messages.scrollHeight);
});
socket.on('usersconnected', (msg)=>{
    let userlist = document.getElementById("user-list");
    userlist.innerHTML="";
    msg.forEach(element => {
        let item = document.createElement("li");
        item.textContent = element;
        userlist.appendChild(item);
    });
    userscountlabel.innerHTML = `${msg.length || 0} usuarios conectados`;
});