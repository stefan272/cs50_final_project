import sqlite3
import threading
from datetime import datetime, date

# Configure SQLite database
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d
connection = sqlite3.connect('dashboard.db', check_same_thread=False)
connection.row_factory = dict_factory
cursor = connection.cursor()

lock = threading.Lock()

def add_transaction(transaction, user_id):
    # Add/update a transaction for the user

    with connection:
            cursor.execute("""INSERT or REPLACE INTO transactions (user_id, date, amount, description, cat_id)
                                              VALUES (?, ?, ?, ?, ?)""",
                                                     (user_id, transaction['date'], transaction['amount'], 
                                                     transaction['description'], transaction['cat_id']))
    return '', 204


def global_assignments():
    # Query global assignments
    return cursor.execute("SELECT cat_id, keyword FROM global_assignments").fetchall()


def general_category(type):
    # Get the cat_id for the correct 'other' assignment
    return cursor.execute("SELECT cat_id FROM categories WHERE category = ?", (f'General ({type})',)).fetchone()


def categories():
    # Query list of available categories
    return cursor.execute("SELECT category FROM categories").fetchall()


def category_to_id(category):
    # Get the id for the given category
    return cursor.execute("SELECT cat_id FROM categories WHERE category = ?", (category,)).fetchone()


def oldest_year(user_id):
    # Get the oldest date from the transactions
    oldest_date = cursor.execute("""SELECT MIN(date) 
                                      FROM transactions 
                                     WHERE user_id=?""",
                                           (user_id,)).fetchone()

    if oldest_date['MIN(date)'] == None:
        return date.today().year
    else: 
        oldest_year = datetime.strptime(oldest_date['MIN(date)'], '%Y-%m-%d').year
        return oldest_year


def username_check(username):
    # Query database for username
    return cursor.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchall()


def create_user(entries):
    # Add user to database
    with connection:
        cursor.execute("""INSERT INTO users(first_name, last_name, username, hash) 
                               VALUES (?, ?, ? ,?)""", 
                                      (entries['first'], entries['last'], entries['username'], entries['hash']))
    
    # Query the new user ID
    new_userID = cursor.execute("SELECT user_id FROM users WHERE username = ?", (entries['username'],)).fetchone()

    return new_userID['user_id']

def all_transactions(user_id):
    # Query all transactions for a user
    try:
        lock.acquire(True)
        res = cursor.execute("""SELECT date, amount, description, categories.category, transaction_id, categories.type
                                FROM transactions
                                        JOIN categories
                                        ON transactions.cat_id = categories.cat_id
                                WHERE user_id = ?
                                ORDER BY date 
                                        DESC""", 
                                        (user_id,)).fetchall()
    finally:
        lock.release()

    return res


def update_category(cat_id, transaction_id):
    # Update the cateogory of a transaction
    with connection:
        cursor.execute("""UPDATE transactions
                             SET cat_id=? 
                           WHERE transaction_id=?""", 
                                 (cat_id, transaction_id))
    return '', 204


def delete_transaction(user_id, transaction_id):
    # Delete a transaction from the database
    with connection:
        cursor.execute("""DELETE FROM transactions 
                                WHERE user_id=? 
                                  AND transaction_id=?""", 
                                      (user_id, transaction_id))

    return '', 204

def update_balance(user_id, balance):
    # Update the current balance of the user
    with connection:
            cursor.execute("""INSERT or REPLACE INTO balances (user_id, current_balance)
                                              VALUES (?, ?)""",
                                                     (user_id, balance))
    return '', 204


def get_balance(user_id):
    # Get the current users balance
    try:
        lock.acquire(True)
        res = cursor.execute("""SELECT current_balance 
                               FROM balances 
                              WHERE user_id = ?""", 
                                    (user_id,)).fetchone()
    finally:
        lock.release()
    
    return res


def get_password(user_id):
    #Get the users current password
    return cursor.execute("""SELECT hash 
                               FROM users 
                              WHERE user_id=?""", 
                                    (user_id,)).fetchone()


def update_password(user_id, hash):
    # Update the users password
    return cursor.execute("""UPDATE users
                                SET hash=?
                              WHERE user_id=?""", 
                                    (hash, user_id))