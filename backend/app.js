import exp from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cros from "cors";

const port = process.env.PORT || 5000;
const app = exp();
const serv = createServer(app);
const user ={};


const io = new Server(serv, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cros());
app.use(exp.json());

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join", (data) => {
    user[socket.id]=data;
    socket.broadcast.emit("user-join",data);
  });

  socket.on("send", (data) => {
    console.log("message", data);
    socket.broadcast.emit("reciver", { message : data, user:user[socket.id] });
  });

  socket.on("disconnect", () => {
    if (user[socket.id]) {
      console.log(`${user[socket.id]} left the chat`);
      socket.broadcast.emit("left", user[socket.id]);
      delete user[socket.id]; // Remove user from tracking
    }
  });
});

serv.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
