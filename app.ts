import express from "express"
import Database from "better-sqlite3"
import bcrypt from "bcrypt" 
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import session from "express-session"
import path from "path"
import crypto from "crypto"

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

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any

  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }

  const compare = bcrypt.compareSync(password, user.password);

  if (compare) {
    res.cookie("token", user.token, { maxAge: 1000*60*60*24*7, httpOnly: true });
    switch (user.rolle) {
      case "admin":
        res.redirect("/admin/edit/");
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

  } else {
    res.status(401).send("Invalid email or password");
  }
});

app.post("/addUser", (req, res) => {
  const { name, email, rolle, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  const token = crypto.randomUUID()

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

app.get("/medlem/kontaktinfo/:token", (req, res) => {
  const token = req.params.token;
  const user = findByTokenStmt.get(token) as any
  res.send(user)
})

app.post("/post/redigerBruker", (req, res) => {
  const token = req.cookies.token;
  console.log(token)
   const { id, name, email, rolle } = req.body;

  const user = findByTokenStmt.get(token) as any

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

app.get("/api/user/token", (req, res) => {
  const token = req.cookies.token;
  const user = findByTokenStmt.get(token) as any
  console.log(user, token)
  if (user) {
    res.json({
      success: true,
      data: user
    })
  } else {
    res.json({
      success: false
    })
  }
})

app.post("/post/redigerKontakt", (req, res) => {
  const token = req.cookies.token;
  const user = findByTokenStmt.get(token) as any

  const { id, name, email, phone, birthdate, adress } = req.body;

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

  if (phone != user.phone) {
    const updateStatement = db.prepare(
      "UPDATE users SET phone = ? WHERE id = ?"
    );
    updateStatement.run(phone, id);
  }

  if (birthdate != user.birthdate) {
    const updateStatement = db.prepare(
      "UPDATE users SET birthdate = ? WHERE id = ?"
    );
    updateStatement.run(birthdate, id);
  }

  if (adress != user.adress) {
    const updateStatement = db.prepare(
      "UPDATE users SET adress = ? WHERE id = ?"
    );
    updateStatement.run(adress, id);
  }
  res.redirect("/medlem/");
})

app.use((req, res, next) => {
  let auth = ""

  if (req.url.startsWith("/admin")) {
    auth = "admin"
  } else if (req.url.startsWith("/leder")) { 
    auth = "leder"
  } else if (req.url.startsWith(`/medlem/`)) {
    auth = "medlem"
  } else {
    return next()
  }

  const token = req.cookies.token;

  if (!token) {
    res.redirect("/");
    return;
  }
  const user = findByTokenStmt.get(token) as any

  if (user.rolle === auth) {
    next();
  } else {
    res.redirect("/");
  }
});

app.use("/", express.static(path.join(__dirname, "public")));


app.listen(3000, () => {
  console.log(`Server running on port 3000`);
});