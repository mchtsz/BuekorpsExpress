CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rolle TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

/* CREATE TABLE IF NOT EXISTS parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS medlemmer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    parent_id INTEGER NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES parents (id)
);

CREATE TABLE IF NOT EXISTS kompani (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    medlem_id INTEGER NOT NULL,
    FOREIGN KEY (medlem_id) REFERENCES medlemmer (id)
);

CREATE TABLE IF NOT EXISTS administrator (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    kompani_id INTEGER NOT NULL,
    FOREIGN KEY (kompani_id) REFERENCES kompani (id)
);

CREATE TABLE IF NOT EXISTS bruker (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    administrator_id INTEGER NOT NULL,
    FOREIGN KEY (administrator_id) REFERENCES administrator (id)
); */


