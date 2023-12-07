import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import path from "path";
import crypto from "crypto";

const app = express();
const db = new Database("database.db");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.get("/admin/edit/:id", (req, res) => {
  res.sendFile(__dirname + "/public/admin/id.html");
});

app.get("/admin/edit/", (req, res) => {
  res.sendFile(__dirname + "/public/admin/edit.html");
})

app.get("/admin/create/", (req, res) => {
  res.sendFile(__dirname + "/public/admin/create.html");
});

app.get("/admin/createPel/", (req, res) => {
  res.sendFile(__dirname + "/public/admin/createPel.html");
});

app.get("/leder/add/", (req, res) => {
  res.sendFile(__dirname + "/public/leder/add.html");
});

app.get("/leder/edit/:id", (req, res) => {
  res.sendFile(__dirname + "/public/leder/edit.html");
});

app.get("/leder/info/", (req, res) => {
  res.sendFile(__dirname + "/public/leder/info.html");
});

app.get("/leder/kompani/", (req, res) => {
  res.sendFile(__dirname + "/public/leder/kompani.html");
});

app.get("/json/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.send(users);
});

app.get("/json/peletong", (req, res) => {
  const peletong = db.prepare(`SELECT * FROM users WHERE peletong_id =1`).all();
  res.send(peletong);
});

app.get("/json/peletongNULL", (req, res) => {
  const peletong = db.prepare(`SELECT * FROM users WHERE peletong_id IS NULL`).all();
  res.send(peletong);
});

app.get("/livsglede", (req, res) => {
  res.sendFile(__dirname + "/public/livsglede.html");
})

app.get("/api/user/token", (req, res) => {
  const token = req.cookies.token;
  const user = sql.findByToken.get(token) as any;
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

// SQL statements
const sql = {
  insertUser: db.prepare(
    `INSERT INTO users (name, email, rolle, password, phone, adress, birthdate, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
  ),
  createParent: db.prepare(
    `INSERT INTO forelder (name, email, password, token) VALUES (?, ?, ?, ?);`
  ),
  createPeletong: db.prepare(`INSERT INTO peletong (name) VALUES (?);`),
  addMedlem: db.prepare(`UPDATE users SET peletong_id = 1 WHERE id = ?`),
  removeMedlem: db.prepare(`UPDATE users SET peletong_id = NULL WHERE id = ?`),
  deleteUser: db.prepare("DELETE FROM users WHERE id = ?"),
  findByToken: db.prepare("SELECT * FROM users WHERE token = ?"),
};

// TestData
function createTestData() {
  const hashPassword = (password:any) => {
    const saltRounds = 6;
    return bcrypt.hashSync(password, saltRounds);
  };''
  sql.insertUser.run("admin", "admin@test.com", "admin", hashPassword("Passord01"), "", "", "", crypto.randomUUID());
  sql.insertUser.run("leder", "leder@test.com", "leder", hashPassword("Passord01"), "", "", "", crypto.randomUUID());
  sql.insertUser.run("forelder", "forelder@test.com", "forelder", hashPassword("Passord01"), "", "", "", crypto.randomUUID());
  sql.createParent.run("forelder", "forelder@test.com", hashPassword("Passord01"), crypto.randomUUID());
  sql.insertUser.run("medlem", "medlem@test.com", "medlem", hashPassword("Passord01"), "", "", "", crypto.randomUUID());
  sql.createPeletong.run("Peletong 1");
}

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
      case "forelder":
        res.redirect("/forelder/");
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

app.post("/createUser", (req, res) => {
  const { name, email, rolle, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  const token = crypto.randomUUID();

  if (user) {
    res.status(409).send("Email already exists");
  } else {
    const hash = bcrypt.hashSync(password, 6);

    const insertUser = () => {
      sql.insertUser.run(name, email, rolle, hash, "", "", "", token,);
    };

    switch (rolle) {
      case "forelder":
        insertUser();
        sql.createParent.run(name, email, hash, token);
        setTimeout(() => {
          res.redirect("/admin/edit/");
        }, 1000);
        break;
      default:
        insertUser();
        setTimeout(() => {
          res.redirect("/admin/");
        }, 1000);
    }
  }
});

app.post("/addMedlem/:id", (req, res) => {
  const id = req.params.id;
  sql.addMedlem.run(id);
  res.redirect("/leder/kompani");
});

app.post("/removeMedlem/:id", (req, res) => {
  const { id } = req.params;
  sql.removeMedlem.run(id);
  res.redirect("/leder/kompani");
});

app.post("/createPeletong", (req, res) => {
  const { name } = req.body;
  sql.createPeletong.run(name);
  setTimeout(() => {
    res.redirect("/admin/");
  }, 1000);
});

app.post("/post/slettBruker/:id", (req, res) => {
  const id = req.params.id;
  sql.deleteUser.run(id);
  res.redirect("/admin/edit");
});

app.post("/post/redigerBruker", (req, res) => {
  const token = req.cookies.token;
  const { id, name, email, rolle, phone, adress, birthdate } = req.body;

  const user = sql.findByToken.get(token) as any;

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

  const user = sql.findByToken.get(token) as any;

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

  res.redirect("/leder/kompani");
});

app.post("/post/redigerKontakt", (req, res) => {
  const token = req.cookies.token;
  const user = sql.findByToken.get(token) as any;

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
    case "forelder":
      res.redirect(`/forelder/`);
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
  if (
    req.url === "/" ||
    req.url === "/index.html" ||
    req.url.endsWith(".css") ||
    req.url.endsWith(".js")
  ) {
    return next();
  }

  // if the user has no token, redirect to the index page
  if (!token) {
    res.redirect("/");
    return;
  }

  const user = sql.findByToken.get(token) as any;

  if (!user) {
    res.redirect("/");
    return;
  }

  if (user.rolle === "admin") {
    return next();
  }

  if (req.url.startsWith("/admin")) {
    auth = "admin";
  } else if (req.url.startsWith("/leder")) {
    auth = "leder";
  } else if (req.url.startsWith(`/forelder/`)) {
    auth = "forelder";
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
