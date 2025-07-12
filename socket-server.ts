const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: { origin: "http://localhost:3000" },
});

console.log("Socket server running on port 3001");

io.on("connection", (socket) => {
  // ... other events like 'register' and 'disconnect'

  socket.on("join_chat_room", (roomId) => {
    socket.join(roomId);
  });

  // This event now receives the full message object from the API
  socket.on("send_message", (data) => {
    // Broadcast the message to all clients in the room (including the sender)
    io.to(data.conversationId).emit("receive_message", data.message);
  });
});
