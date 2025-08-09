-- init-db.sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    gender VARCHAR(10),
    birthdate DATE,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Admin account (login: admin, password: admin)
INSERT INTO users (username, password, first_name, last_name, gender, birthdate, is_admin)
VALUES (
  'admin',
  '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK',
  'Admin',
  'User',
  'male',
  '1990-01-01',
  TRUE
) ON CONFLICT (username) DO NOTHING;

-- Test users (password: admin)
INSERT INTO users (username, password, first_name, last_name, gender, birthdate, is_admin)
VALUES
  ('user1', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'John', 'Doe', 'male', '1991-02-15', FALSE),
  ('user2', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'Jane', 'Smith', 'female', '1992-03-20', FALSE),
  ('user3', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'Bob', 'Johnson', 'male', '1989-07-05', FALSE),
  ('user4', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'Alice', 'Williams', 'female', '1993-12-11', FALSE),
  ('user5', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'Charlie', 'Brown', 'male', '1994-04-23', FALSE),
  ('user6', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'Diana', 'Miller', 'female', '1995-06-18', FALSE),
  ('user7', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'Ethan', 'Davis', 'male', '1996-09-29', FALSE),
  ('user8', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'Fiona', 'Garcia', 'female', '1997-11-14', FALSE),
  ('user9', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'George', 'Martinez', 'male', '1998-08-08', FALSE),
  ('user10', '$2b$10$GGgIDvdvFa/7.SFiMdcPruXB2OdxMidlZYaDx2m48.vCPzlLvMWEK', 'Hannah', 'Lopez', 'female', '1999-05-02', FALSE)
ON CONFLICT (username) DO NOTHING;

