import re
import database_queries

from flask import flash, redirect, session
from functools import wraps
from datetime import datetime
from dateutil import parser


def login_required(f):
    # Decorate routes to require login
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user_id') is None:
            return redirect('/welcome')
        return f(*args, **kwargs)
    return decorated_function


def validate_entries(form, fields):
    # Validate a user submitted entry is populated
    
    entries = {}
    for field in fields:
        if not form[field]: 
            break
        else:
            entries[field] = form[field]
    return entries


def validate_password(password, confirmation):
    # Vaidate the users given password

    # Check the password and confirmation match
    if password != confirmation:
        flash("Passwords do not match")
        return redirect('/register')

    # Check the password is of correct criteria
    if len(password) < 8:
        return False


def gbp(value):
    # Format value as gbp
    return f"£{value:,.2f}"


def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions


def format_date(date):
    # Format the date correctly (YYYY-mm-dd)
    return parser.parse(date, dayfirst=True).date()


def format_string(string):
    # Strip out any spaces from string
    return re.sub('\s+', ' ', string)


def month(value):
    # Format month value to short text month
    datetime_object = datetime.strptime(str(value), "%b")
    month_name = datetime_object.strftime("%m")
    return month_name


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

        # Query a list of global assignments
        rows = database_queries.global_assignments()

        # Bool to check if a category has been assigned
        assigned = False
        for row in rows:
            if row['keyword'] in item['description'].lower():
                item['cat_id'] = row['cat_id']
                database_queries.add_transaction(item, session['user_id'])
                assigned = True
        if assigned == False:
            # Get the cat_id for the correct 'other' assignment
            general = database_queries.general_category(type)
            item['cat_id'] = general['cat_id']
            database_queries.add_transaction(item, session['user_id'])
        
    return transactions


def find(list, key, value):
    # Find the index of a value in a list of dicts
    for i, dic in enumerate(list):
        if dic[key] == value:
            return i
    return -1