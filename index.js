require("dotenv").config();
require ("express-async-errors");
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/songs");
const playlistRoutes = require("./routes/playlists");
const app = express();

connection()
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/playlists", playlistRoutes);

const port = process.env.PORT || 3000;
app.listen(port, console.log(`Listening on port ${port}`));