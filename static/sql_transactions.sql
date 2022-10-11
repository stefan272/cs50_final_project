-- Create users table
CREATE TABLE IF NOT EXISTS users (
user_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
first_name TEXT NOT NULL,
last_name TEXT NOT NULL,
username TEXT NOT NULL,
hash TEXT NOT NULL);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
transaction_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
user_id INTEGER NOT NULL,
date TEXT NOT NULL,
amount INTEGER NOT NULL,
description TEXT NOT NULL,
cat_id INTEGER NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(user_id),
FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
cat_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
category TEXT NOT NULL,
type TEXT NOT NULL);

-- Create global assignments table
CREATE TABLE IF NOT EXISTS global_assignments (
global_asgn_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
cat_id INTEGER NOT NULL,
keyword TEXT UNIQUE NOT NULL,
FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
);

-- Create user assignments table
CREATE TABLE IF NOT EXISTS user_assignments (
user_asgn_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
user_id INTEGER NOT NULL,
cat_id INTEGER NOT NULL,
description TEXT UNIQUE NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(user_id),
FOREIGN KEY (cat_id) REFERENCES categories(cat_id)
);

-- Create user balance table
CREATE TABLE IF NOT EXISTS balances (
user_id INTEGER  UNIQUE NOT NULL,
current_balance INTEGER,
savings INTEGER,
house_savings INTEGER,
car_savings INTEGER,
investments INTEGER,
FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Insert global categories data
INSERT INTO categories (category, type)
VALUES
('Bills', 'Expense'),
('Eating Out', 'Expense'),
('Entertainment', 'Expense'),
('Family', 'Expense'),
('Finances', 'Expense'),
('Gifts (Giving)', 'Expense'),
('Gifts (Receiving)', 'Income'),
('Groceries', 'Expense'),
('Holidays', 'Expense'),
('Salary', 'Income'),
('Personal Care', 'Expense'),
('Savings', 'Expense'),
('Shopping', 'Expense'),
('Transfers', 'Expense'),
('Transport', 'Expense'),
('General (Income)', 'Income'),
('General (Expense)', 'Expense');

-- Insert global assignments data
INSERT or REPLACE INTO global_assignments (cat_id, keyword)
VALUES
(1, 'energy'),
(1, 'british gas'),
(1, 'united utilities'),
(1, 'bt'),
(1, 'octopus'),
(2, 'nandos'),
(2, 'greggs'),
(3, 'cinema'),
(3, 'bowling'),
(5, 'etoro'),
(5, 'vanguard'),
(5, 'invest'),
(5, 'cash'),
(8, 'asda'),
(8, 'tesco'),
(8, 'coop'),
(8, 'sainsbury'),
(8, 'm&s'),
(8, 'aldi'),
(11, 'gym'),
(11, 'spa'),
(11, 'fitness'),
(13, 'amzn'),
(13, 'amazon'),
(13, 'john lewis'),
(15, 'metrolink'),
(15, 'bus'),
(15, 'fuel'),
(1, 'apple'),
(1, 'adobe'),
(1, 'o2'),
(1, 'nabu casa'),
(8, 'marks&spencer'),
(15, 'tfgm'),
(7, 'birthday gift'),
(10, 'salary'),
(10, 'paycheck'),
(1, 'vodafone'),
(1, 'three'),
(1, 'tesco mobile'),
(1, 'ee mobile'),
(1, 'edf energy'),
(1, 'eon'),
(1, 'npower'),
(2, 'mcdonalds'),
(2, 'slug & lettuce'),
(15, 'trainline'),
(15, 'shell'),
(15, 'esso');

-- Query to see if desc inside user_assignments
SELECT user_assignments.cat_id 
FROM user_assignments
JOIN categories
ON user_assignments.cat_id = categories.cat_id
WHERE user_id = ?
AND type = ?
AND description = ?;

-- Query to see if desc inside global_assignments
SELECT global_assignments.cat_id 
FROM global_assignments
JOIN categories
ON global_assignments.cat_id = categories.cat_id
WHERE user_id = ?
AND type = ?
AND description = ?;

-- Query for transaction history
SELECT date, amount, description, categories.category, transaction_id
FROM transactions
JOIN categories
ON transactions.cat_id = categories.cat_id
WHERE user_id = 3
ORDER BY date DESC;


INSERT INTO user_assignments(user_id, cat_id, description) VALUES (3, 3, 'text');