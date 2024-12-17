from db import db
from models import User, Goal, DailyData

# Initialize the database connection
from flask import Flask
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    # Query and display all data in DailyData table
    entries = DailyData.query.all()
    print("\nSaved Data in DailyData Table:")
    for entry in entries:
        print(f"ID: {entry.id}, User ID: {entry.user_id}, Date: {entry.date}, Type: {entry.type_of_data}, Value: {entry.value}")
