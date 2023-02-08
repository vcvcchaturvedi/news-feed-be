const { createServer } = require("http");
const express = require("express");
const newsFeed = require("./validators/newsFeed.js");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { pool } = require("./db.js");
const server = createServer(app);
server.listen(7071, () => console.log("Server running on port 7071"));
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
