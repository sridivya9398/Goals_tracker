from db import db
from models import DailyData
from flask import Flask

# Initialize Flask and database connection
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

with app.app_context():
    # Delete all records from the DailyData table
    try:
        deleted_count = db.session.query(DailyData).delete()
        db.session.commit()
        print(f"{deleted_count} records deleted successfully from DailyData table.")
    except Exception as e:
        print(f"An error occurred: {e}")
