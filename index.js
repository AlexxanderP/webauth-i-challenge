const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const configuredKnex = require("./database/dbConfig.js");

const server = express();

const users = require("./database/dbConfig.js");

server.use(helmet());
server.use(express.json());
server.use(cors());

//----- Get Request to Test Server-----//
server.get("/", (req, res) => {
  res.send("My server is working!");
});

//------- Session Config------//
const sessionConfig = {
  name: "configuration",
  secret: "Everyone has secrets. So whats yours? Girl on fire...",
  cookie: {
    maxAge: 1000 * 60 * 10,
    secure: false,
    httpOnly: true
  },
  resave: false,
  saveUninitialized: false,
  store: new KnexSessionStore({
    knex: configuredKnex,
    tablename: "sessions",
    sidfieldname: "sid",
    createtable: true,
    clearInterval: 1000 * 60 * 30
  })
};

//------ Post request for Register, included Bcrypt for Hashing------//
server.post("/api/register", (req, res) => {
  let user = req.body;

  const hash = (user.password = bcrypt.hashSync(user.password, 10));
  user.password = hash;

  users("users")
    .insert(req.body)
    .then(ids => {
      const id = ids[0];
      users("users")
        .where({ id })
        .first()
        .then(user => {
          res.status(200).json(user);
        });
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

//----- Post Request for Login------//
server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  users("users")
    .where({ username })
    .first()
    .then(user => {
      console.log(user);
      //check the password against the database-----/
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: "Invalid Credentials" });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

//------ Get Request for Logout------//
server.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.status(500).json({ message: "there was a problem." });
      } else {
        res.status(200).json({ message: "bye, thanks for coming!" });
      }
    });
  } else {
    res.status(200).json({ message: "bye, thanks for coming!" });
  }
});

//----- Middleware That Checks on Credentials Before Allowing Authentication-----//
function restricted(req, res, next) {
  const { username, password } = req.headers;

  if (username && password) {
    Users.findBy({ username })
      .first()
      .then(user => {
        //-----check the password against the database-----//
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
server.get("/api/user", restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});
server.use(session(sessionConfig));
const port = process.env.PORT || 6500;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
