const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("My server is working!");
});

server.post("/api/register", (req, res) => {
  let user = req.body;

  /// hash the password
  const hash = bcrypt.hashSync(user.password, 8);
  user.password = hash;

  Users.add(user)
    .then(savedUser => {
      res.status(201).json(savedUser);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

const port = process.env.PORT || 6500;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
