CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rolle TEXT NOT NULL,
    phone TEXT NOT NULL,
    adress TEXT NOT NULL,
    birthdate TEXT NOT NULL,
    peletong_id INTEGER,
    forelder_id INTEGER,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    token TEXT NOT NULL,
    FOREIGN KEY(peletong_id) REFERENCES peletong(id),
    FOREIGN KEY(forelder_id) REFERENCES forelder(id)
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