import os
import requests
import urllib.parse
import re

from flask import Flask, flash, redirect, render_template, request, session
from functools import wraps
from datetime import datetime
from dateutil import parser

def login_required(f):
    # Decorate routes to require login

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get('user_id') is None:
            return redirect('/homepage')
        return f(*args, **kwargs)
    return decorated_function


def validate_entry(entry):
    # Validate a user submitted entry is populated

    if not entry:
        flash("Enter all fields")
        return redirect('/register')
    
    return True


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


def month(value):
    # Format month int to text
    month_num = str(value)
    datetime_object = datetime.strptime(month_num, "%b")
    month_name = datetime_object.strftime("%m")

    return month_name


def past_date(field, t):
    # Return a timedelta date
    
    # Update modified field
    if field == 'year':
        year = datetime.today().year - t
        month = datetime.today().month
        day = datetime.today().day
    elif field == 'month':
        year = datetime.today().year
        month = datetime.today().month - t
        day = datetime.today().day
    elif field == 'day':
        year = datetime.today().year
        month = datetime.today().month
        day = datetime.today().day - t
    else:
        return None
    
    # Account for leap years
    try:
        # Try returning same date last year
        past_date = datetime.strptime(f"{day}/{month}/{year}",'%d/%m/%Y').date()
    except ValueError: 
        # If error (due to leap year) 
        past_date = datetime.strptime(f"{day-1}/{month}/{year}",'%d/%m/%Y').date()
    
    return (past_date.strftime("%d/%m/%y"))


def date_strip(text):
    # Remove date from string in format "\ton 01 Jan"

    return (re.sub(r'\t\w{2} \d{2} \w{3}', '', text))

def date_format(date):
    # Format the date correctly
    return parser.parse(date)

def format_string(string):
    # Strip out any tabs in a string
    return (re.sub(r'\t', '', string))