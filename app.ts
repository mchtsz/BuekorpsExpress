// imports
import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import path from "path";
import crypto from "crypto";

// using app and db
const app = express();
const db = new Database("database.db");

// imortant for the database and for reading data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser()); // always use cookieParser or bodyParser

// SQL statements
const sql = {
  // inserts a user into the database with the given values
  insertUser: db.prepare(
    `INSERT INTO users (name, email, rolle, password, phone, adress, birthdate, peletong_id, forelder_id, token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
  ),

  // creates a parent in the database with the given values
  createParent: db.prepare(
    `INSERT INTO forelder (name, email, password, token) VALUES (?, ?, ?, ?);`
  ),

  // creates a peletong in the database with the given values
  createPeletong: db.prepare(`INSERT INTO peletong (name) VALUES (?);`),

  // updates the peletong_id of a user
  updateMedlemPeletong: db.prepare(
    `UPDATE users SET peletong_id = ? WHERE id = ?`
  ),

  // updates the forelder_id of a user
  updateForelderID: db.prepare(`UPDATE users SET forelder_id = ? WHERE id = ?`),

  // removes a user from a peletong by setting their peletong_id to 0
  removeMedlem: db.prepare(`UPDATE users SET peletong_id = 0 WHERE id = ?`),

  // deletes a user from the database
  deleteUser: db.prepare("DELETE FROM users WHERE id = ?"),

  // finds a user by their token
  findByToken: db.prepare("SELECT * FROM users WHERE token = ?"),
};

// Function for creating test data
function createTestData() {
  const hashPassword = (password: any) => {
    const saltRounds = 6;
    return bcrypt.hashSync(password, saltRounds);
  };
  ("");
  sql.insertUser.run(
    "admin", // name
    "admin@test.com", //email
    "admin", // role
    hashPassword("Passord01"), // password
    "+1 888 333", // phone
    "1 st. Avenue", // adress
    "1990-01-01", // birthdate
    "1", // peletong_id
    "3", // forelder_id
    crypto.randomUUID() // token
  );
  sql.insertUser.run(
    "leder", // name
    "leder@test.com", // email
    "leder", // role
    hashPassword("Passord01"), // password
    "+98 90 90 20", // phone
    "2nd St. Avenue", // adress
    "1991-01-10", // birthdate
    "1", // peletong_id
    "0", // forelder_id
    crypto.randomUUID() // token
  );
  sql.insertUser.run(
    "fenrik", // name
    "fenrik@test.com", // email
    "leder", // role
    hashPassword("Passord01"), // password
    "+47 98 90 78 20", // phone
    "Haglevegen 7", // adress
    "1987-03-24", // birthdate
    "2", // peletong_id
    "0", // forelder_id
    crypto.randomUUID() // token
  );
  sql.insertUser.run(
    "forelder", // name
    "forelder@test.com", // email
    "forelder", // role
    hashPassword("Passord01"), // password
    "+90 13 34 54 20", // phone
    "Erlevegen 7", // adress
    "2000-02-05", // birthdate
    "1", // peletong_id
    "3", // forelder_id
    crypto.randomUUID() // token
  );
  sql.createParent.run(
    "forelder", // name
    "forelder@test.com", // email
    hashPassword("Passord01"), // password
    crypto.randomUUID() // token
  );
  sql.insertUser.run(
    "medlem", // name
    "medlem@test.com", // email
    "medlem", // role
    hashPassword("Passord01"), // password
    "+0 00 90 30 40", // phone
    "Optikervegen 8", // adress
    "2001-01-01", // birthdate
    "2", // peletong_id
    "0", // forelder_id
    crypto.randomUUID() // token
  );
  sql.insertUser.run(
    "ulrik", // name
    "ulrik@test.com", // email
    "medlem", // role
    hashPassword("Passord01"), // password
    "+47 99 88 77 66", // phone
    "Straumevegen 90", // adress
    "2004-05-06", // birthdate
    "1", // peletong_id
    "3", // forelder_id
    crypto.randomUUID() // token
  );
  sql.insertUser.run(
    "sigurd", // name
    "sigurd@test.com", // email
    "medlem", // role
    hashPassword("Passord01"), // password
    "+47 98 98 98 00", // phone
    "Våkleiven 9", // adress
    "2006-02-05", // birthdate
    "0", // peletong_id
    "0", // forelder_id
    crypto.randomUUID() // token
  );
  sql.insertUser.run(
    "emil", // name
    "emil@test.com", // email
    "medlem", // role
    hashPassword("Passord01"), // password
    "+98 99 88 77 44", // phone
    "HopeRoad 2", // adress
    "2000-00-00", // birthdate
    "0", // peletong_id
    "0", // forelder_id
    crypto.randomUUID() // token
  );
  sql.insertUser.run(
    "henrik", // name
    "henrik@test.com", // email
    "medlem", // role
    hashPassword("Passord01"), // password
    "+47 89 98 24 99", // phone
    "Henriks vei 8", // adress
    "2009-09-09", // birthdate
    "1", // peletong_id
    "3", // forelder_id
    crypto.randomUUID() // token
  );

  // creates peletong
  sql.createPeletong.run("Peletong 1");
  sql.createPeletong.run("Fenrik skvadron");
}

// login post
app.post("/login", (req, res) => {
  const { email, password } = req.body; // gets the email and password from the request body
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as any;

  // if the user does not exist, send a 401 status code
  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }

  // compares the password from the request body with the password in the database
  const compare = bcrypt.compareSync(password, user.password);

  if (compare) {
    res.cookie("token", user.token, {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    });

    // redirects the user to the correct page based on their role
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

// middleware for checking if the user is logged in
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

  if (user.rolle === "admin") {
    return next();
  }

  if (req.url.startsWith("/admin")) {
    auth = "admin";
  } else if (req.url.startsWith("/leder/")) {
    auth = "leder";
  } else if (req.url.startsWith("/forelder/")) {
    auth = "forelder";
  } else if (req.url.startsWith("/medlem/")) {
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

// Admin routes
const adminRoutes = {
  create: (req, res) => {
    res.sendFile(__dirname + "/public/admin/create.html");
  },
  createPel: (req, res) => {
    res.sendFile(__dirname + "/public/admin/createPel.html");
  },
  edit: (req, res) => {
    res.sendFile(__dirname + "/public/admin/edit.html");
  },
  editId: (req, res) => {
    res.sendFile(__dirname + "/public/admin/id.html");
  },
};

// Forelder routes
const forelderRoutes = {
  index: (req, res) => {
    const token = req.cookies.token;
    const user = sql.findByToken.get(token) as any;
    const userForelderID = user.forelder_id;

    res.redirect(`/forelder/${userForelderID}`);
  },
  id: (req, res) => {
    res.sendFile(__dirname + "/public/forelder/index.html");
  },
};

// Leder routes
const lederRoutes = {
  index: (req, res) => {
    const token = req.cookies.token;
    const user = sql.findByToken.get(token) as any;

    if (user.rolle === "leder" || user.rolle === "admin") {
      res.redirect(`/leder/${user.peletong_id}`);
    } else {
      res.redirect("/");
    }
  },
  add: (req, res) => {
    const token = req.cookies.token;
    const user = sql.findByToken.get(token) as any;
    res.redirect(`/leder/add/${user.peletong_id}`);
  },
  addID: (req, res) => {
    res.sendFile(__dirname + "/public/leder/add.html");
  },
  editId: (req, res) => {
    res.sendFile(__dirname + "/public/leder/edit.html");
  },
  id: (req, res) => {
    res.sendFile(__dirname + "/public/leder/kompani.html");
  },
};

// Medlem routes
const medlemRoutes = {
  peletong: (req, res) => {
    const user = sql.findByToken.get(req.cookies.token) as any;
    const userPeletongID = user.peletong_id;
    res.redirect(`/medlem/peletong/${userPeletongID}`);
  },
  peletongID: (req, res) => {
    res.sendFile(__dirname + "/public/medlem/peletong/index.html");
  },
};

// JSON routes
const jsonRoutes = {
  barn: (req, res) => {
    const { id } = req.params;
    const barn = db.prepare(`SELECT name, rolle FROM users WHERE forelder_id=?`).all(id);
    res.send(barn);
  },
  peletong: (req, res) => {
    const id = req.params.id;
    const peletong = db.prepare(`SELECT name FROM peletong WHERE id=?`).all(id);
    res.send(peletong);
  },
  peletongNULL: (req, res) => {
    const peletong = db
      .prepare(`SELECT name, rolle, id FROM users WHERE peletong_id = 0`)
      .all();
    res.send(peletong);
  },
  peletongusers: (req, res) => {
    const { id } = req.params;
    const peletongusers = db
      .prepare(`SELECT name, phone, rolle FROM users WHERE peletong_id =?`)
      .all(id);
    res.send(peletongusers);
  },
  user: (req, res) => {
    const { id } = req.params;
    const user = db.prepare("SELECT * FROM users WHERE id=?").all(id);
    res.send(user);
  },
  users: (req, res) => {
    const users = db.prepare("SELECT * FROM users").all();
    res.send(users);
  },
};

// API routes
const apiRoutes = {
  userToken: (req, res) => {
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
  },
};

// Routes for the different pages
app.get("/admin/create/", adminRoutes.create);
app.get("/admin/createPel/", adminRoutes.createPel);
app.get("/admin/edit/", adminRoutes.edit);
app.get("/admin/edit/:id", adminRoutes.editId);

app.get("/forelder/", forelderRoutes.index);
app.get("/forelder/:id", forelderRoutes.id);

app.get("/leder/", lederRoutes.index);
app.get("/leder/add/", lederRoutes.add);
app.get("/leder/add/:id", lederRoutes.addID);
app.get("/leder/edit/:id", lederRoutes.editId);
app.get("/leder/:id", lederRoutes.id);

app.get("/medlem/peletong/:id", medlemRoutes.peletongID);

app.get("/api/user/token", apiRoutes.userToken);

app.get("/json/barn/:id", jsonRoutes.barn);
app.get("/json/peletong/:id", jsonRoutes.peletong);
app.get("/json/peletongNULL", jsonRoutes.peletongNULL);
app.get("/json/peletongusers/:id", jsonRoutes.peletongusers);
app.get("/json/user/:id", jsonRoutes.user);
app.get("/json/users", jsonRoutes.users);

app.post("/createUser", (req, res) => {
  const { name, email, rolle, password } = req.body; // gets the email and password from the request body
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email); // gets the user from the database
  const token = crypto.randomUUID(); // creates a random token

  if (user) {
    res.status(409).send("Email already exists"); // if the user exists, send a 409 status code
  } else {
    // hash the password
    const hash = bcrypt.hashSync(password, 6);

    // inserts the user into the database
    const insertUser = () => {
      sql.insertUser.run(name, email, rolle, hash, "", "", "", "1", "0", token);
    };

    //
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
          res.redirect("/admin/edit/");
        }, 1000);
    }
  }
});

// creates a user with the given values
app.post("/addMedlem/:id", (req, res) => {
  const peletongID = req.params.id; // Get the peletong ID from the request params
  const userID = req.body.userID; // Get the user ID from the request body

  // Add the user to the peleton
  sql.updateMedlemPeletong.run(peletongID, userID);

  try {
    sql.updateMedlemPeletong.run(peletongID, userID);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

// removes a user from peleton based on their id
app.post("/removeMedlem/:id", (req, res) => {
  const token = req.cookies.token;
  const user = sql.findByToken.get(token) as any;
  const id = req.params.id;
  sql.removeMedlem.run(id);
  res.redirect(`/leder/${user.peletong_id}`);
});

// creates a peletong with a name
app.post("/createPeletong", (req, res) => {
  const { name } = req.body;
  sql.createPeletong.run(name);
  setTimeout(() => {
    res.redirect("/admin/");
  }, 1000);
});

// deletes a user from the database based on their id
app.post("/post/slettBruker/:id", (req, res) => {
  const id = req.params.id;
  sql.deleteUser.run(id);
  res.redirect("/admin/edit");
});

// POST FOR EDIT USER
app.post("/post/redigerBruker", (req, res) => {
  const token = req.cookies.token;
  const {
    id,
    name,
    email,
    rolle,
    peletong_id,
    phone,
    adress,
    birthdate,
    forelder_id,
  } = req.body;

  const user = sql.findByToken.get(token) as any;

  // checks if the user has changed their name, email, role, peletong_id, phone, adress, birthdate or forelder_id
  if (name != user.name) {
    const updateStmt = db.prepare("UPDATE users SET name = ? WHERE id = ?");
    updateStmt.run(name, id);
  }

  if (email != user.email) {
    const updateStmt = db.prepare("UPDATE users SET email = ? WHERE id = ?");
    updateStmt.run(email, id);
  }

  if (rolle != user.rolle) {
    const updateStmt = db.prepare("UPDATE users SET rolle = ? WHERE id = ?");
    updateStmt.run(rolle, id);
  }

  if (peletong_id != user.peletong_id) {
    sql.updateMedlemPeletong.run(peletong_id, id);
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

  if (forelder_id != user.forelder_id) {
    sql.updateForelderID.run(forelder_id, id);
  }

  res.redirect("/admin/edit/");
});

// POST FOR EDIT USERS ONLY ADMIN CAN USE
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

  res.redirect(`/leder/${user.peletong_id}`);
});

// Post for editing user information
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
      res.redirect(`/leder/${user.peletong_id}`);
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

// bruker public mappen
app.use("/", express.static(path.join(__dirname, "public")));

app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});