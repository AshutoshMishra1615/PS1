const { Server } = require("socket.io");

// This creates a WebSocket server, typically on a different port than your Next.js app
const io = new Server(3001, {
  cors: {
    origin: "http://localhost:3000", // Allow connections from your Next.js app
  },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // When a user logs in, they should register themselves with their user ID
  socket.on("register", (userId) => {
    socket.join(userId); // Join a room named after their user ID
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // Listen for a notification event and forward it to the specific user
  socket.on("send_notification", ({ recipientId, notification }) => {
    // Emitting to a room (named after the user ID) ensures only that user gets it
    io.to(recipientId).emit("receive_notification", notification);
  });

  socket.on("disconnect", () => {
    // You can add logic here to remove the user from onlineUsers map if needed
    console.log(`User disconnected: ${socket.id}`);
  });
});

console.log("Socket server is running on port 3001");
