import os
import sqlite3
import csv
import json
import re

from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash
from flask_wtf import FlaskForm
from wtforms import FileField, SubmitField
from wtforms.validators import InputRequired
from werkzeug.utils import secure_filename
from textwrap import indent

from helpers import login_required, validate_entry, validate_password, gbp, past_date, date_strip, date_format, format_string

# Configure application
app = Flask(__name__)

# Configure application
app.config['TEMPLATES_AUTO_RELOAD'] = True # Ensure templates are reloaded
app.config['SECRET_KEY'] = 'supersecretkey' # Set secret key for file upload
app.config['UPLOAD_FOLDER'] = 'static/files' # Set file upload folder

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Custom filter
app.jinja_env.filters['gbp'] = gbp

# Configure SQLite database
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d
connection = sqlite3.connect('final.db', check_same_thread=False)
connection.row_factory = dict_factory
cursor = connection.cursor()

# Configure file uploading
class UploadFileForm(FlaskForm):
    file = FileField('File', validators=[InputRequired()])
    submit = SubmitField('Upload File')


# Add the transactions to the database
def add_transaction(transaction):

    with connection:
            cursor.execute("""INSERT or REPLACE INTO transactions (user_id, date, amount, description, cat_id)
            VALUES (?, ?, ?, ?, ?)""", (session['user_id'], transaction['date'], transaction['amount'], transaction['description'], transaction['cat_id']))
    return

 
# Assign categories
def categorize(transactions):

# for each of the rows
    for item in transactions:
        # if amount less than zero, type=expense
        if item['amount'] <= 0:
            type = 'Expense'
        # else type=income
        else:
            type = 'Income'
        
        # # Query the user assignments table
        # rows = cursor.execute("""SELECT user_assignments.cat_id 
        #                             FROM user_assignments
        #                             JOIN categories
        #                             ON user_assignments.cat_id = categories.cat_id
        #                             WHERE user_id = ?
        #                             AND type = ?
        #                             AND description = ?""", (session['user_id'], type, item['description'])).fetchone()
        # If a result is found
        # if rows != None:
        #     # Update the item dict
        #     item['cat_id'] = rows['cat_id']
        #     # Insert transaction into database (pass into function)
        #     add_transaction(item)
        #     break

        # # Check if a match in the global assignments
        # else:

        # Query a list of global assignments
        rows = cursor.execute("SELECT cat_id, keyword FROM global_assignments").fetchall()

        assigned = False
        for row in rows:
            if row['keyword'] in item['description'].lower():
                item['cat_id'] = row['cat_id']
                add_transaction(item)
                assigned = True
        if assigned == False:
            # Get the cat_id for the correct 'other' assignment
            general = cursor.execute("SELECT cat_id FROM categories WHERE category = ?", (f'General ({type})',)).fetchone()
            item['cat_id'] = general['cat_id']
            add_transaction(item)
        
    return transactions


@app.after_request
def after_request(response):
    # Ensure responses aren't cached
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Expires'] = 0
    response.headers['Pragma'] = 'no-cache'
    return response


@app.route('/')
@login_required
def index():
    
    # Get past date
    last_year = past_date('year', 1)
    
    # Get past date
    last_month = past_date('year', 2)
    
    
    # Get a dict list of all of the categories
    expenses = cursor.execute("SELECT category, categories.cat_id FROM transactions JOIN categories ON transactions.cat_id = categories.cat_id WHERE user_id=? GROUP BY category",(session['user_id'],)).fetchall()

    for item in expenses:
        # update each dict with the average over the last year
        average = cursor.execute("SELECT SUM(amount) FROM transactions WHERE user_id=? AND cat_id=? AND (date BETWEEN date('now','-1 year') AND date('now'))", (session['user_id'], item['cat_id'])).fetchone()
        if average['SUM(amount)'] != None:
            item['average'] = (average['SUM(amount)'])/12 # /12??
        else:
            item['average'] = 0
        # update each dict with the last month total
        current = cursor.execute("SELECT SUM(amount) FROM transactions WHERE user_id=? AND cat_id=? AND (date BETWEEN date('now','start of month') AND date('now'))", (session['user_id'], item['cat_id'])).fetchone()
        if current['SUM(amount)'] != None:
            item['current'] = current['SUM(amount)']
        else:
            item['current'] = 0

    return render_template('index.html', expenses_month=json.dumps(expenses), expenses=expenses)


@app.route('/homepage')
def homepage():
    # Display the homepage
    return render_template('homepage.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Log user in

    # Forget any user_id
    session.clear()

    # User reached route via POST (form submission)
    if request.method == 'POST':

        # Validate the user has entered all fields
        if validate_entry(request.form.get('username')):
            username = request.form.get('username')
        if validate_entry(request.form.get('password')):
            password = request.form.get('password')

        # Query database for username
        rows = cursor.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchall()

        # Ensure username and password are valid
        if len(rows) != 1 or not check_password_hash(rows[0]['hash'], password):
            flash("Invalid credentials")
            return redirect('/login')
        
        # Remember which user has logged in and redirect
        session["user_id"] = rows[0]['user_id']
        return redirect('/') 

    # User reached route via GET (clicking a link or via redirect)
    else:
        return render_template('login.html')


@app.route('/logout')
def logout():
    # Log user out

    # Clear session
    session.clear()

    # Redirect to home page
    return redirect('/')


@app.route('/register', methods=["GET", "POST"])
def register():
    # Register new user

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # return render_template('apology.html')

        # Validate that the user has populated all fields
        # TODO consolidate into single function
        # Check the first name is entered
        if validate_entry(request.form.get('fname')):
            first = request.form.get('fname')
        # Check the second name is entered
        if validate_entry(request.form.get('sname')):
            last = request.form.get('sname')
        # Check the username is entered
        if validate_entry(request.form.get('username')):
            username = request.form.get('username')
        # Check the password is entered
        if validate_entry(request.form.get('password')):
            password = request.form.get('password')
        # Check the confirmation is entered
        if validate_entry(request.form.get('confirmation')):
            confirmation = request.form.get('confirmation')
        
        # Check the username is not already taken
        rows = cursor.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchall()
        if len(rows) > 0:
            flash("Username already taken")
            return redirect('/register')
        
        # Check the password length/character inclusion & matching
        if validate_password(password, confirmation) == False:
            flash("Invalid password")
            redirect("/register")
        else:
            # Hash the users given password
            pwhash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
            # Insert the user into the database
            with connection:
                cursor.execute("""INSERT INTO users(first_name, last_name, username, hash) 
                                       VALUES (?, ?, ? ,?)
                               """, (first, last, username, pwhash))
        
        # Return back to the homescreen
        flash("Registered!")
        return redirect('/')

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template('register.html')


# Allow user to upload a file
@app.route('/upload', methods=['GET', 'POST'])
@login_required
def upload():

    # Definite form allow data upload (html)
    form = UploadFileForm()
    categories = cursor.execute("SELECT category FROM categories").fetchall()
    
    # User reached route via POST (form submission)
    if request.method == 'POST':
        
        # Save the submitted file
        if form.validate_on_submit():
            file = form.file.data
            # Validate the file is .csv
            if os.path.splitext(file.filename)[-1].lower() != '.csv':
                flash('Only .csv files can be uploaded')
                return redirect('/upload')
            # Create secure filename and save file
            file.save(os.path.join(os.path.abspath(os.path.dirname(__file__)), app.config['UPLOAD_FOLDER'],secure_filename(file.filename)))
            # TODO either delete the file after use or open instead of save the file
            # TODO check column config correct

        # Read the .csv file into a list
        transactions = []

        with open('static/files/{}'.format(file.filename), 'r', encoding='utf-8') as data: # Date, Amount, Description
            reader = csv.DictReader(data)
            reader.fieldnames = [name.lower() for name in reader.fieldnames]
            for item in reader:
                if item['date'] == None:
                    break
                else:
                    # item['date'] = date_format(item['date'])
                    item['amount'] = float(item['amount'])
                    item['description'] = format_string(item['description'])
                    transactions.append(item)
                    print(item)
        
        categorize(transactions)

        flash('Uploaded!')
        return redirect('/upload')

    # User reached route via GET (clicking a link or via redirect)
    else:
        return render_template('upload.html', form=form, categories=categories)


@app.route('/upload/add', methods=['POST'])
@login_required
def manual_add():

    date = request.form.get('date')
    desc = request.form.get('desc')
    amount = request.form.get('amount')
    category = request.form.get('category')
    cat_id = cursor.execute("SELECT cat_id FROM categories WHERE category = ?", (category,)).fetchone()

    manual_transaction=[{}]

    manual_transaction[0]['date'] = date
    manual_transaction[0]['amount'] = amount
    manual_transaction[0]['description'] = desc
    manual_transaction[0]['cat_id'] = cat_id['cat_id']

    add_transaction(manual_transaction)

    flash("Added!")
    return redirect('/upload')


@app.route('/history')
@login_required
def history():
    # Display list of historical transactions

    # Query for all transactions
    # history = cursor.execute("""SELECT date, amount, description, categories.category, transaction_id
    #                             FROM transactions
    #                             JOIN categories
    #                             ON transactions.cat_id = categories.cat_id
    #                             WHERE user_id = ?
    #                             ORDER BY date DESC
    #                             """, (session['user_id'],)).fetchall()

    # # Query for list of available categories
    # categories = cursor.execute("SELECT category FROM categories").fetchall()

    return render_template('history.html')


@app.route('/api/data')
@login_required
def data():
    history = cursor.execute("""SELECT date, amount, description, categories.category, transaction_id
                                FROM transactions
                                JOIN categories
                                ON transactions.cat_id = categories.cat_id
                                WHERE user_id = ?
                                ORDER BY date DESC
                                """, (session['user_id'],)).fetchall()

    return {'data': history}


@app.route('/api/data', methods=['POST'])
def update():
    data = request.get_json()
    print(data)
    if 'id' not in data:
        return render_template('error.html')


    # Query for new cat id
    new_cat = cursor.execute("SELECT cat_id FROM categories WHERE category=?", (data['category'],)).fetchone()

    # Insert transaction into database
    with connection:
        cursor.execute("""UPDATE transactions
                            SET cat_id=? WHERE transaction_id=?""", (new_cat['cat_id'], data['id']))

    return '', 204

@app.route('/history/delete', methods=['POST'])
@login_required
def delete():
    # Allow manual transaction deletion

    # Get id of transaction to be deleted
    id = request.form.get('id')
    # If valid id, delete from database
    if id:
        with connection:
            cursor.execute("""DELETE FROM transactions 
                                    WHERE user_id=? 
                                      AND transaction_id=?
                           """, (session['user_id'], id))
    
    return redirect ('/history')
    
# TODO
    # Add delete option to table
    # Allow manual adding of transaction
    # Fix double post response when changing category
    # Allow filtering of transactions by date/category

# settings route