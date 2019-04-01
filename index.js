const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

//----- Get Request to Test Server-----//
server.get("/", (req, res) => {
  res.send("My server is working!");
});

//------ Post request for Register, included Bcrypt for Hashing------//
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

//----- Post Request for Login------//
server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      // check the password guess against the database
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ messsage: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

//----- Middleware That Checks on Credentials Before Allowing Authentication-----//
function restricted(req, res, next) {
  const { username, password } = req.headers;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        // check the password against the database
        if (user && bcrypt.compareSync(password, user.password)) {
          next();
        } else {
          res.status(401).json({ message: "Invalid Credentials" });
        }
      })
      .catch(error => {
        res.status(500).json({ message: "Ran into an unexpected error" });
      });
    next();
  } else {
    res.status(401).json({ message: "No credentials provided" });
  }
}

//------ Middleware Only Allowing Specific Users to Have Access------//
function only(username) {
  return function(req, res, next) {
    if (req.headers.username === username) {
      next();
    } else {
      res.status(403).json({
        message: `You don't have access because you are not ${username}!`
      });
    }
  };
}

//------restricts access to the '/api/login' endpoint to users that are authenticated-----//
server.get("/api/users", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

const port = process.env.PORT || 6500;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
