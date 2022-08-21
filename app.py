import os
import csv
import json
import database_queries
import helpers

from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from textwrap import indent
from datetime import date

# Configure application
app = Flask(__name__)

# Configure application
app.config['TEMPLATES_AUTO_RELOAD'] = True # Ensure templates are reloaded
app.config['SECRET_KEY'] = 'supersecretkey' # Set secret key for file upload
app.config['UPLOAD_FOLDER'] = 'static/uploads' # Set file upload folder
ALLOWED_EXTENSIONS = {'csv'}

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

# Custom filter
app.jinja_env.filters['gbp'] = helpers.gbp
app.jinja_env.filters['month'] = helpers.month


@app.after_request
def after_request(response):
    # Ensure responses aren't cached
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Expires'] = 0
    response.headers['Pragma'] = 'no-cache'
    return response


@app.route('/')
@helpers.login_required
def index():
    
    # Create list of available years
    
    # Get current year
    currentYear = date.today().year

    # Get the oldest date from the transactions
    oldestYear = database_queries.oldest_year(session['user_id'])
 
    years = []
    for year in range(oldestYear, currentYear+1):
        years.append(year)

    # Get the current month for the initial chart filter
    currentMonth = date.today().strftime('%b')

    return render_template('index.html', currentMonth=currentMonth, currentYear=currentYear, years=years)


@app.route('/welcome')
def welcome():
    # Display the welcome page
    return render_template('welcome.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    # Log user in

    # Forget any user_id
    session.clear()

    # User reached route via POST (form submission)
    if request.method == 'POST':

        # Validate the user has entered all fields
        # Define list of form fields
        fields = ['username', 'password']

        # Validate all fields are entered
        entries = helpers.validate_entries(request.form, fields)
        if len(entries) != len(fields):
            flash("Enter all fields")
            return redirect('/register')

        # Query database for username
        rows = database_queries.username_check(entries['username'])

        # Ensure username and password are valid
        if len(rows) != 1 or not check_password_hash(rows[0]['hash'], entries['password']):
            flash("Invalid credentials")
            return redirect('/login')
        
        # Remember which user has logged in and redirect
        session["user_id"] = rows[0]['user_id']
        flash("Welcome Back!")
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
def register(): #TODO - password validation
    # Register new user

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # Define list of form fields
        fields = ['first', 'last', 'username', 'password', 'confirmation']
        # Validate all fields are entered
        entries = helpers.validate_entries(request.form, fields)
        if len(entries) != len(fields):
            flash("Enter all fields")
            return redirect('/register')

        # Check the username is not already taken
        rows = database_queries.username_check(entries['username'])
        if len(rows) > 0:
            flash("Username already taken")
            return redirect('/register')
        
        # Check the password length/character inclusion & matching
        if helpers.validate_password(entries['password'], entries['confirmation']) == False:
            flash("Invalid password")
            redirect("/register")
        else:
            # Hash the users given password
            pwhash = generate_password_hash(entries['password'], method='pbkdf2:sha256', salt_length=16)
            # Add hashed password to entries
            entries['hash'] = pwhash
            # Create user and store new user ID
            session['user_id'] = database_queries.create_user(entries)

        # Return back to the homescreen
        flash("Registered!")
        return redirect('/')

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template('register.html')



@app.route('/add', methods=['GET', 'POST'])
@helpers.login_required
def add():
    # Allow user to add a transaction

    # Query list of available categories
    categories = database_queries.categories()
    
    # User reached route via POST (form submission)
    if request.method == 'POST':
        
        # Define list of form fields
        fields = ['date', 'description', 'amount', 'category']
        # Validate all fields are entered
        print(request.form)
        entries = helpers.validate_entries(request.form, fields)
        if len(entries) != len(fields):
            flash("Enter all fields")
            return redirect('/register')
        
        # Get the id for the given category
        res = database_queries.category_to_id(entries['category'])
        # Add transaction to database
        entries['cat_id'] = res['cat_id']
        database_queries.add_transaction(entries, session['user_id'])
 
        flash("Transaction Added!")
        return redirect('/add')

    # User reached route via GET (clicking a link or via redirect)
    else:
        return render_template('add.html', categories=categories)


@app.route('/add/upload', methods=['POST'])
@helpers.login_required
def upload():
    # Allow .csv data upload

    # Check if file object has been submitted
    if 'file' not in request.files:
        flash("No file part")
        return redirect ('/add')
    # Store the file object
    file = request.files['file']
    # Check if filename empty
    if file.filename == '':
        flash("No file selected")
        return redirect('/add')
    # Check the file extension is acceptable
    if file and helpers.allowed_file(file.filename, ALLOWED_EXTENSIONS):
        # Get the file a secure filename and save
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    else:
        flash('Only .csv files can be uploaded')
        return redirect('/add')
        
    # Read the .csv file into a list
    transactions = []
    columns = ['date', 'amount', 'description']

    with open('static/uploads/{}'.format(file.filename), 'r', encoding='utf-8') as data: # Date, Amount, Description
        reader = csv.DictReader(data)
        # Convert column headers to lowercase
        reader.fieldnames = [name.lower() for name in reader.fieldnames]
        # Check correct column configuration
        for name in reader.fieldnames:
            if not name in columns:
                flash("Incorrect column configuration")
                return redirect('/add')
        for item in reader:
            if item['date'] == None:
                break
            else:
                # Format the fields correctly
                item['date'] = helpers.format_date(item['date'])
                item['amount'] = float(item['amount'])
                item['description'] = helpers.format_string(item['description'])
                # Add item to transactions list
                transactions.append(item)
    
    # Remove the uploaded file
    os.remove('static/uploads/{}'.format(file.filename))
        
    helpers.categorize(transactions)

    flash('Transactions Uploaded!')
    return redirect('/add')


@app.route('/history')
@helpers.login_required
def history():
    # Display list of historical transactions
    
    return render_template('history.html')


@app.route('/api/data')
@helpers.login_required
def data():
    # Query the users transaction data

    transactions = database_queries.all_transactions(session['user_id'])

    # print(json.dumps(transactions, indent=2))
    return json.dumps(transactions)


@app.route('/api/data/update', methods=['POST'])
@helpers.login_required
def update():
    
    data = request.get_json()
    print(f"Update data: {data}")
    if 'id' not in data:
        return render_template('error.html')

    # Query for new cat id
    try:
        new_categoryID = database_queries.category_to_id(data['category'])
        database_queries.update_category(new_categoryID['cat_id'], data['id'])
    except TypeError:
        flash("Invalid Category")
        return redirect('/history'), 400

    return '', 204


@app.route('/api/data/categories')
@helpers.login_required
def category_return():

    categories = database_queries.categories()
    # print(categories)
    cat_list=[]

    for item in categories:
        cat_list.append(item['category'])

    print(cat_list)

    return json.dumps(cat_list)


@app.route('/api/data/delete', methods=['POST'])
@helpers.login_required
def multi_delete():
    
    data = request.get_json()
    print(data)
    for id in request.get_json():
        database_queries.delete_transaction(session['user_id'], id)

    return '', 204


@app.route('/support')
def support():
    return render_template('support.html')


if __name__ == '__main__':
    app.run(debug=True)   


# TODO
    # Create more extensive categorization
    # Allow customer to add a category
        # if new category added, re-sort data
    # For dashboard:
        # Add list of top spends for the selected month
        # Add more insights
    # Fix display overspill for main div