const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static(__dirname));

// Cache control for images and assets
app.use((req, res, next) => {
  if (req.url.match(/\.(jpg|jpeg|png|gif|js|css|html)$/)) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// In-memory user storage (for demo purposes)
const users = [];
const connections = [];

// API Routes

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, skills, password } = req.body;
    const existingUser = users.find(user => user.email === email);
    if (existingUser) return res.status(400).json({ message: "Email already registered" });

    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = { 
      id: Date.now(), 
      name, 
      email, 
      skills, 
      password: hashedPass,
      connections: [],
      pendingRequests: [],
      sentRequests: []
    };
    users.push(newUser);
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: "Login successful", user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (for finding connections)
app.get("/users", (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

// Send connection request
app.post("/connections/request", (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;
    const fromUser = users.find(u => u.id === fromUserId);
    const toUser = users.find(u => u.id === toUserId);
    
    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check connection limits (max 5 connections)
    if (fromUser.connections.length >= 5) {
      return res.status(400).json({ message: "You have reached the maximum limit of 5 connections" });
    }

    if (toUser.connections.length >= 5) {
      return res.status(400).json({ message: "This user has reached their connection limit" });
    }

    // Check if request already exists
    if (toUser.pendingRequests.includes(fromUserId) || fromUser.sentRequests.includes(toUserId)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Check if already connected
    if (fromUser.connections.includes(toUserId) || toUser.connections.includes(fromUserId)) {
      return res.status(400).json({ message: "Already connected" });
    }

    toUser.pendingRequests.push(fromUserId);
    fromUser.sentRequests.push(toUserId);
    
    res.json({ message: "Connection request sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Accept connection request
app.post("/connections/accept", (req, res) => {
  try {
    const { userId, requesterId } = req.body;
    const user = users.find(u => u.id === userId);
    const requester = users.find(u => u.id === requesterId);
    
    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check connection limits (max 5 connections)
    if (user.connections.length >= 5) {
      return res.status(400).json({ message: "You have reached the maximum limit of 5 connections" });
    }

    if (requester.connections.length >= 5) {
      return res.status(400).json({ message: "The other user has reached their connection limit" });
    }

    // Remove from pending/sent requests
    user.pendingRequests = user.pendingRequests.filter(id => id !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id !== userId);
    
    // Add to connections
    user.connections.push(requesterId);
    requester.connections.push(userId);
    
    res.json({ message: "Connection accepted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Reject connection request
app.post("/connections/reject", (req, res) => {
  try {
    const { userId, requesterId } = req.body;
    const user = users.find(u => u.id === userId);
    const requester = users.find(u => u.id === requesterId);
    
    if (!user || !requester) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove from pending/sent requests
    user.pendingRequests = user.pendingRequests.filter(id => id !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id !== userId);
    
    res.json({ message: "Connection rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get user connections and requests
app.get("/user/:userId/connections", (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = user.connections.map(id => users.find(u => u.id === id)).filter(Boolean);
    const pendingRequests = user.pendingRequests.map(id => users.find(u => u.id === id)).filter(Boolean);
    const sentRequests = user.sentRequests.map(id => users.find(u => u.id === id)).filter(Boolean);
    
    // Remove passwords from all user objects
    const cleanConnections = connections.map(({ password, ...user }) => user);
    const cleanPendingRequests = pendingRequests.map(({ password, ...user }) => user);
    const cleanSentRequests = sentRequests.map(({ password, ...user }) => user);
    
    res.json({
      connections: cleanConnections,
      pendingRequests: cleanPendingRequests,
      sentRequests: cleanSentRequests
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(5000, "0.0.0.0", () => {
  console.log("✅ Team-Up server running on http://0.0.0.0:5000");
  console.log("📁 Serving static files from current directory");
  console.log("🎯 Frontend ready for connections and collaboration!");
});
