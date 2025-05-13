const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = "messages.json";

// Setup
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Load messages
function loadMessages() {
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch {
        return [];
    }
}

// Save messages
function saveMessages(messages) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

// Routes
app.get("/api/messages", (req, res) => {
    res.json(loadMessages());
});

app.post("/api/messages", upload.single("image"), (req, res) => {
    const messages = loadMessages();
    const newMessage = {
        username: req.body.username || "/user",
        message: req.body.message,
        timestamp: new Date().toISOString(),
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    };
    messages.push(newMessage);
    saveMessages(messages);
    res.json(newMessage);
});

// Start
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
