import sqlite3
import random
import string
import sys
import csv
from faker import Faker

# Configure SQLite database
def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d
connection = sqlite3.connect('dashboard.db', check_same_thread=False)
connection.row_factory = dict_factory
cursor = connection.cursor()

def main():

    # Ensure correct usage
    if len(sys.argv) != 2:
        sys.exit("Usage: python3 random_data.py #")

    header = ['date', 'amount', 'description']
    data = []
    data_rows = int(sys.argv[1])

    for x in range(data_rows):

        # Define the row
        row = []

        # Generate random date in the last 2 years
        fake = Faker()
        random_date_object = fake.date_between(start_date='-2y', end_date='today')
        random_date = random_date_object.strftime("%d/%m/%Y")

        # Generate a random price
        price = round(random.triangular(-100, 100, 0), 2)

        # Generate a random description
        if price <= 0:
            type = "Expense"
        else:
            type = "Income"
        
        # Query the keywords for the chosen type
        keywords = cursor.execute("""SELECT keyword 
                                       FROM global_assignments
                                            JOIN categories
                                            ON global_assignments.cat_id = categories.cat_id
                                      WHERE type = ? """,
                                 (type,)).fetchall()

        # Generate a random index number
        index = random.randint(0, len(keywords)-1)
        # Get the random keyword
        random_keyword = keywords[index]['keyword']

        # Add additional letters to the string
        # Generate random strings
        letters_start = ''.join(random.choice(string.ascii_letters) for i in range(10))
        letters_end = ''.join(random.choice(string.ascii_letters) for i in range(5))
        
        # Define the description components
        description_components = (letters_start, random_keyword, letters_end)

        # Join the description components
        random_description = ' '.join(description_components)

        # Update the rows list
        row.append(random_date)
        row.append(str(price))
        row.append(random_description)

        # Add the row to the data list
        data.append(row)

    with open(f'sample_data-{sys.argv[1]}.csv', 'w', encoding='UTF8', newline='') as f:
        writer = csv.writer(f)

        # write the header
        writer.writerow(header)

        # write multiple rows
        writer.writerows(data)


if __name__ == "__main__":
    main()