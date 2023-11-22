const express = require('express');
const db = require("better-sqlite3")("database.db", { verbose: console.log });
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

const insertStmt = db.prepare(
  `INSERT INTO users (name, email, password) VALUES (?, ?, ?);`
);

app.get("/json/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.send(users);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }

  const compare = bcrypt.compareSync(password, user.password);

  if (compare) {
    req.session.user = user;
    res.send("Login successful");
  } else {
    res.status(401).send("Invalid email or password");
  }
});

// this is the route for the login page
app.post("/addUser", (req, res) => {
  const { name, email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (user) {
    res.status(409).send("Email already exists");
  } else {
    const insertStmt = db.prepare(
      `INSERT INTO users (name, email, rolle, password) VALUES (?, ?, ?, ?);`
    );
    const hash = bcrypt.hashSync(password, 6);
    insertStmt.run(name, email, "bruker", hash);
    setTimeout(() => {
      res.redirect("/");
    }, 1000);
  }
});

app.listen(3000, () => {
  console.log(`Server running on port 3000
  `);
});