let socket;
let username = "";
let registered = false;
let dialogElement;
let inputElement;
let fileInputElement;

function isImage(fileName) {
  return fileName.endsWith("png") || fileName.endsWith("jpg");
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
      if (isImage(file.name)) {
      }
    });
}

function register() {
  if (username !== "") {
    socket.emit("register", username);
  }
}

function processInput(input) {
  input = input.trim();
  switch (input) {
    case "":
      break;
    case "\\help":
      createMessage("https://github.com/songquanpeng/chat-room", "system");
      break;
    case "\\clear":
      clearMessage();
      break;
    default:
      socket.emit("message", input);
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

function createMessage(message, source, position) {
  // TODO: multiple formats support
  if (source === undefined || source === "") source = "system";
  let e = document.createElement("p");
  e.innerText = `${source}: ${message}`;
  dialogElement.appendChild(e);
  dialogElement.scrollTop = dialogElement.scrollHeight;
}

function initSocket() {
  socket = io();
  socket.on("message", function (message, username) {
    createMessage(message, username);
  });
  socket.on("register success", function () {
    registered = true;
    clearInputBox();
  });
  socket.on("conflict username", function () {
    createMessage("The username is already taken.");
  });
  socket.on("system", function (message) {
    createMessage(message);
  });
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
  inputElement = document.getElementById("input");
  fileInputElement = document.getElementById("fileInput");
  inputElement.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  });
  createMessage("Input your username");
};