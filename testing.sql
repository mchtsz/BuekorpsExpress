CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rolle TEXT NOT NULL,
    token TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS kompanier (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    navn TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS peletonger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    navn TEXT NOT NULL,
    kompani_id INTEGER NOT NULL,
    FOREIGN KEY(kompani_id) REFERENCES kompanier(id)
);


CREATE TABLE IF NOT EXISTS foreldre (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    navn TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS foreldre_medlemmer (
    forelder_id INTEGER NOT NULL,
    medlem_id INTEGER NOT NULL,
    PRIMARY KEY(forelder_id, medlem_id),
    FOREIGN KEY(forelder_id) REFERENCES foreldre(id),
    FOREIGN KEY(medlem_id) REFERENCES users(id)
);