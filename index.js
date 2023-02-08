const { createServer } = require("https");
const express = require("express");
const newsFeed = require("./validators/newsFeed.js");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 7071;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { pool } = require("./db.js");
const server = createServer(app);
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const { Server } = require("ws");
const ws_server = new Server({ server, path: "/ws" });
ws_server.on("connection", (ws) => {
  console.log("New client connected!");
  ws.on("message", (messageAsString) => {
    try {
      const parsedNewsFeed = JSON.parse(messageAsString);
      if (parsedNewsFeed.viewAll) {
        pool
          .query("SELECT * FROM newsfeed")
          .then((res) =>
            ws.send(JSON.stringify({ news: res.rows, viewAll: true }))
          );
        return;
      }
      const { error } = newsFeed.validate(parsedNewsFeed);
      if (error) {
        console.log("Invalid format of message: " + error);
        return;
      }
      pool.query(
        "INSERT INTO newsfeed (title, description, image, author) VALUES ($1, $2, $3, $4)",
        [
          parsedNewsFeed.title,
          parsedNewsFeed.description,
          parsedNewsFeed.image,
          parsedNewsFeed.author,
        ]
      );
      ws_server.clients.forEach((client) => {
        client.send(messageAsString.toString());
      });
    } catch (err) {
      console.log(err);
    }
  });
  ws.on("close", () => console.log("Client has disconnected!"));
});
