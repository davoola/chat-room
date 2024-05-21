let socket;
let username = "";
let registered = false;
let roomID = window.location.pathname;
let dialogElement;
let usernumElement;
let inputElement;
let fileInputElement;
let rooms = new Map();
function filename2type(fileName) {
  let extension = fileName.split(".").pop().toLowerCase();
  let imageFormats = [
    "png",
    "jpg",
    "bmp",
    "gif",
    "ico",
    "jpeg",
    "apng",
    "svg",
    "tiff",
    "webp",
  ];
  let audioFormats = [
    "mp3",
    "wav",
    "ogg",
  ];
  let videoFormats = [
    "mp4",
    "webm",
  ];
  if (imageFormats.includes(extension)) {
    return "IMAGE";
  } else if (audioFormats.includes(extension)) {
    return "AUDIO";
  } else if (videoFormats.includes(extension)) {
    return "VIDEO";
  }
  return "FILE";
}
function getRoom(roomID) {
  let room = rooms.get(roomID);
  if (!room) {
    room = {
      users: new Map(),
      usernameSet: new Set(),
    };
    rooms.set(roomID, room);
  }
  return room;
}
function uploadFile() {
  let file = fileInputElement.files[0];
  let formData = new FormData();
  formData.append("file", file);
  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      let filePath = data.path;
      sendMessage(filePath, filename2type(file.name));
    });
}

function changeUsername() {
  printMessage("请输入新的用户昵称！");
  registered = false;
}

function register() {
  if (username !== "") {
    socket.emit("register", username, roomID);
  }
}

function processInput(input) {
  input = input.trim();
  switch (input) {
    case "":
      break;
    case "help":
      printMessage("https://github.com/songquanpeng/chat-room", "系统");
      break;
    case "clear":
      clearMessage();
      break;
    default:
      sendMessage(input);
      break;
  }
  clearInputBox();
}

function clearInputBox() {
  inputElement.value = "";
}

function clearMessage() {
  dialogElement.innerHTML = "";
}

function char2color(c) {
  let num = c.charCodeAt(0);
  let r = Math.floor(num % 255);
  let g = Math.floor((num / 255) % 255);
  let b = Math.floor((r + g) % 255);
  if (g < 20) g += 20;
  return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

function printMessage(content, sender = "系统", type = "TEXT",number,userinfo) {
  let html;
  let firstChar = sender[0];
  switch (type) {
    case "IMAGE":
      html = `<div class="chat-message shown">
    <div class="avatar" style="background-color:${char2color(firstChar)}">${firstChar.toUpperCase()}</div>
    <div class="nickname">${sender}</div>
    <div class="message-box"><img src="${content}" alt="${content}"></div>
</div>`
      break;
    case "AUDIO":
      html = `<div class="chat-message shown">
    <div class="avatar" style="background-color:${char2color(firstChar)}">${firstChar.toUpperCase()}</div>
    <div class="nickname">${sender}</div>
    <div class="message-box"><audio controls src="${content}"></div>
</div>`
      break;
    case "VIDEO":
      html = `<div class="chat-message shown">
    <div class="avatar" style="background-color:${char2color(firstChar)}">${firstChar.toUpperCase()}</div>
    <div class="nickname">${sender}</div>
    <div class="message-box"><video controls><source src="${content}"></video></div>
</div>`
      break;
    case "FILE":
      let parts = content.split('/');
      let text = parts[parts.length - 1];
      html = `<div class="chat-message shown">
    <div class="avatar" style="background-color:${char2color(firstChar)}">${firstChar.toUpperCase()}</div>
    <div class="nickname">${sender}</div>
    <div class="message-box"><a href="${content}" download="${text}">${text}</a></div>
</div>`
      break;
    case "TEXT":
    default:
      html = `<div class="chat-message shown">
    <div class="avatar" style="background-color:${char2color(firstChar)}">${firstChar.toUpperCase()}</div>
    <div class="nickname">${sender}</div>
    <div class="message-box"><p>${content}</p></div>
</div>`
      break;
  }
  dialogElement.insertAdjacentHTML('beforeend', html)
  dialogElement.scrollTop = dialogElement.scrollHeight;
  if(number>0){
    usernumElement.innerHTML = "";
	usernumElement.insertAdjacentHTML('beforeend', `当前用户数[${number}] -- ${userinfo}`);
  }
  
}

function sendMessage(content, type = "TEXT") {
  let data = {
    content,
    type,
  };
  socket.emit("message", data, roomID);
}
function sendMessage(content, type = "TEXT") {
  let data = {
    content,
    type,
  };
  socket.emit("message", data, roomID);
}
function initSocket() {
  socket = io();
  socket.on("message", function (message) {
    console.log(message,'message');
    printMessage(message.content, message.sender, message.type, message.number,message.userinfo);
  });
  socket.on("register success", function () {
    registered = true;
    localStorage.setItem("username", username);
    clearInputBox();
  });
  socket.on("conflict username", function () {
    registered = false;
    localStorage.setItem("username", "");
    printMessage(
      "用户昵称已被占用，请输入新的用户昵称！"
    );
  });
}
// 添加关闭网站的函数
function closeWebsite() {
  if (confirm('确定要退出吗？')) {
    if (navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1) {
      window.location.href = "about:blank";
      window.close();
    } else {
      window.opener = null;
      window.open("", "_self");
      window.close();
    };
  }
}

function send() {
  let input = inputElement.value;
  if (registered) {
    processInput(input);
  } else {
    username = input;
    register();
  }
}

window.onload = function () {
  initSocket();
  dialogElement = document.getElementById("dialog");
  usernumElement = document.getElementById("usernum");
  inputElement = document.getElementById("input");
  fileInputElement = document.getElementById("fileInput");
  inputElement.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  });
  username = localStorage.getItem("username");
  if (username) {
    register();
  } else {
    printMessage("请输入您的用户昵称！");
  }
};
