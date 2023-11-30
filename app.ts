import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import path from "path";
import crypto from "crypto";

const app = express();
const db = new Database("database.db");

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

const insertStmt = db.prepare(
  `INSERT INTO users (name, email, rolle, password, token, phone, adress, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
);

const findByTokenStmt = db.prepare("SELECT * FROM users WHERE token = ?");

app.get("/json/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.send(users);
});

app.get("/json/kompani/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users WHERE rolle = 'medlem'").all();
  res.send(users);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as any;

  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }

  const compare = bcrypt.compareSync(password, user.password);

  if (compare) {
    res.cookie("token", user.token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    switch (user.rolle) {
      case "admin":
        res.redirect("/admin/");
        break;
      case "leder":
        res.redirect("/leder/");
        break;
      case "medlem":
        res.redirect("/medlem/");
        break;
      default:
        res.redirect("/");
        break;
    }
  } else {
    res.status(401).send("Invalid email or password");
  }
});

app.post("/addUser", (req, res) => {
  const { name, email, rolle, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  const token = crypto.randomUUID();

  if (user) {
    res.status(409).send("Email already exists");
  } else {
    const hash = bcrypt.hashSync(password, 6);
    insertStmt.run(name, email, rolle, hash, token, "", "", "");
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

app.get("/admin/edit/user/:id", (req, res) => {
  res.sendFile(__dirname + "/public/admin/edit/user/index.html");
});

app.get("/leder/edit/:id", (req, res) => {
  res.sendFile(__dirname + "/public/leder/edit/index.html");
});

app.post("/post/redigerBruker", (req, res) => {
  const token = req.cookies.token;
  const { id, name, email, rolle, phone, adress, birthdate } = req.body;

  const user = findByTokenStmt.get(token) as any;

  if (name != user.name) {
    const updateStmt = db.prepare("UPDATE users SET name = ? WHERE id = ?");
    updateStmt.run(name, id);
  }

  if (email != user.email) {
    const updateStmt = db.prepare("UPDATE users SET email = ? WHERE id = ?");
    updateStmt.run(email, id);
  }

  if (rolle != user.rolle) {
    if (rolle != "velg") {
      const updateStmt = db.prepare("UPDATE users SET rolle = ? WHERE id = ?");
      updateStmt.run(rolle, id);
    }
  }

  if (phone != user.phone) {
    const updateStmt = db.prepare("UPDATE users SET phone = ? WHERE id = ?");
    updateStmt.run(phone, id);
  }

  if (birthdate != user.birthdate) {
    const updateStmt = db.prepare(
      "UPDATE users SET birthdate = ? WHERE id = ?"
    );
    updateStmt.run(birthdate, id);
  }

  if (adress != user.adress) {
    const updateStmt = db.prepare("UPDATE users SET adress = ? WHERE id = ?");
    updateStmt.run(adress, id);
  }

  res.redirect("/admin/edit");
});

app.post("/post/redigerMedlem", (req, res) => {
  const token = req.cookies.token;
  const { id, name, email, phone, adress, birthdate } = req.body;

  const user = findByTokenStmt.get(token) as any;

  if (name != user.name) {
    const updateStmt = db.prepare("UPDATE users SET name = ? WHERE id = ?");
    updateStmt.run(name, id);
  }

  if (email != user.email) {
    const updateStmt = db.prepare("UPDATE users SET email = ? WHERE id = ?");
    updateStmt.run(email, id);
  }

  if (phone != user.phone) {
    const updateStmt = db.prepare("UPDATE users SET phone = ? WHERE id = ?");
    updateStmt.run(phone, id);
  }

  if (birthdate != user.birthdate) {
    const updateStmt = db.prepare(
      "UPDATE users SET birthdate = ? WHERE id = ?"
    );
    updateStmt.run(birthdate, id);
  }

  if (adress != user.adress) {
    const updateStmt = db.prepare("UPDATE users SET adress = ? WHERE id = ?");
    updateStmt.run(adress, id);
  }

  res.redirect("/leder/");
});

app.get("/api/user/token", (req, res) => {
  const token = req.cookies.token;
  const user = findByTokenStmt.get(token) as any;
  if (user) {
    res.json({
      success: true,
      data: user,
    });
  } else {
    res.json({
      success: false,
    });
  }
});

app.post("/post/redigerKontakt", (req, res) => {
  const token = req.cookies.token;
  const user = findByTokenStmt.get(token) as any;

  const { id, name, email, phone, birthdate, adress } = req.body;

  if (name != user.name) {
    const updateStmt = db.prepare("UPDATE users SET name = ? WHERE id = ?");
    updateStmt.run(name, id);
  }

  if (email != user.email) {
    const updateStmt = db.prepare("UPDATE users SET email = ? WHERE id = ?");
    updateStmt.run(email, id);
  }

  if (phone != user.phone) {
    const updateStmt = db.prepare("UPDATE users SET phone = ? WHERE id = ?");
    updateStmt.run(phone, id);
  }

  if (birthdate != user.birthdate) {
    const updateStmt = db.prepare(
      "UPDATE users SET birthdate = ? WHERE id = ?"
    );
    updateStmt.run(birthdate, id);
  }

  if (adress != user.adress) {
    const updateStmt = db.prepare("UPDATE users SET adress = ? WHERE id = ?");
    updateStmt.run(adress, id);
  }

  switch (user.rolle) {
    case "admin":
      res.redirect("/admin/");
      break;
    case "leder":
      res.redirect(`/leder/`);
      break;
    case "medlem":
      res.redirect(`/medlem/`);
      break;
    default:
      res.redirect("/");
      break;
  }
});

app.use((req, res, next) => {
  let auth = "";
  const token = req.cookies.token;

  // Skip middleware for the index page and static files
  if (req.url === "/" || req.url === "/index.html" || req.url.endsWith(".css") || req.url.endsWith(".js")) {
    return next();
  }

  // if the user has no token, redirect to the index page
  if (!token) {
    res.redirect("/");
    return;
  }


  const user = findByTokenStmt.get(token) as any;

  if (!user) {
    res.redirect("/");
    return;
  }

  if (user.rolle === 'admin') {
    return next();
  } 

  if (req.url.startsWith("/admin")) {
    auth = "admin";
  } else if (req.url.startsWith("/leder")) {
    auth = "leder";
  } else if (req.url.startsWith(`/medlem/`)) {
    auth = "medlem";
  } else {
    return next();
  }

  if (user.rolle === auth) {
    next();
  } else {
    res.redirect("/");
  }
});

app.use("/", express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});