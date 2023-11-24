const express = require("express");
const db = require("better-sqlite3")("database.db");
const bcrypt = require("bcrypt");
const session = require("express-session");
const app = express();
const path = require("path");

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
  `INSERT INTO users (name, email, rolle, password) VALUES (?, ?, ?, ?);`
);

app.get("/json/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.send(users);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }

  const compare = bcrypt.compareSync(password, user.password);

  if (compare) {
    req.session.user = user;
    if (user.rolle === "admin") {
      res.redirect("/admin/edit/");
    } else {
      res.redirect("/");
    }
  } else {
    res.status(401).send("Invalid email or password");
  }
});

// this is the route for the login page
app.post("/addUser", (req, res) => {
  const { name, email, rolle, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (user) {
    res.status(409).send("Email already exists");
  } else {
    const hash = bcrypt.hashSync(password, 6);
    insertStmt.run(name, email, rolle, hash);
    setTimeout(() => {
      res.redirect("/admin/edit/");
    }, 1000);
  }
});

app.post("/post/slettBruker/:id", (req, res) => {
  const id = req.params.id;
  const deleteStatement = db.prepare("DELETE FROM users WHERE id = ?");
  deleteStatement.run(id);
  res.redirect("/admin/edit");
});

app.post("/post/redigerBruker", (req, res) => {
  const { id, name, email, rolle } = req.body;

  const selectStatement = db.prepare("SELECT * FROM users WHERE id = ?");
  const user = selectStatement.get(id);

  if (name != user.name) {
    const updateStatement = db.prepare(
      "UPDATE users SET name = ? WHERE id = ?"
    );
    updateStatement.run(name, id);
  }

  if (email != user.email) {
    const updateStatement = db.prepare(
      "UPDATE users SET email = ? WHERE id = ?"
    );
    updateStatement.run(email, id);
  }

  if (rolle != user.rolle) {
    if (rolle != "velg") {
      const updateStatement = db.prepare(
        "UPDATE users SET rolle = ? WHERE id = ?"
      );
      updateStatement.run(rolle, id);
    }
  }

  res.redirect("/admin/edit");
});

app.use((req, res, next) => {
  const id = req?.session?.user?.id;

  if (!id) {
    res.redirect("/");
    return;
  }
  const selectStatement = db.prepare("SELECT * FROM users WHERE id = ?");
  const user = selectStatement.get(id);

  if (user.rolle === "admin") {
    next();
  } else {
    res.redirect("/");
  }
}, express.static("admin"));

app.get("/admin", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.join(__dirname, "/admin/index.html"));
  }
});

app.get("/admin/edit", (req, res) => {
  res.sendFile(path.join(__dirname, "/admin/edit/index.html"));
});

app.get("/admin/create", (req, res) => {
  res.sendFile(path.join(__dirname, "/admin/create/index.html"));
});

app.get("/admin/edit/user", (req, res) => {
  res.sendFile(path.join(__dirname, "/admin/edit/user/index.html"));
});

app.get("/admin/edit/user/:id", (req, res) => {
  res.sendFile(path.join(__dirname, `/admin/edit/user/index.html`));
});

app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});