const express = require("express");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = "messages.json";
const UPLOADS_FOLDER = "uploads";

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(`/uploads`, express.static(path.join(__dirname, UPLOADS_FOLDER)));

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_FOLDER)) {
    fs.mkdirSync(UPLOADS_FOLDER);
}

// Multer setup for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_FOLDER),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Load messages from file
function loadMessages() {
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save messages to file
function saveMessages(messages) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
}

// Get all messages
app.get("/api/messages", (req, res) => {
    const messages = loadMessages();
    res.json(messages);
});

// Post a new message
app.post("/api/messages", (req, res) => {
    const newMessage = req.body;
    newMessage.timestamp = new Date().toISOString();
    const messages = loadMessages();
    messages.push(newMessage);
    saveMessages(messages);
    res.json(newMessage);
});

// Upload an image
app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ url: `/uploads/${req.file.filename}` });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
