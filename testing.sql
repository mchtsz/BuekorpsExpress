CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rolle TEXT NOT NULL,
    phone TEXT NOT NULL,
    adress TEXT NOT NULL,
    birthdate TEXT NOT NULL,
    peletong_id INTEGER,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    token TEXT NOT NULL,
    FOREIGN KEY(peletong_id) REFERENCES peletong(id)
);
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS kompani (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS peletong (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS forelder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS forelder (
    forelder_id INTEGER NOT NULL,
    medlem_id INTEGER NOT NULL,
    PRIMARY KEY(forelder_id, medlem_id),
    FOREIGN KEY(forelder) REFERENCES forelder(id),
    FOREIGN KEY(medlem_id) REFERENCES users(id)
);