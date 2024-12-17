from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
CORS(app)

# Define models
class DailyData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    date = db.Column(db.String(100), nullable=False)
    type_of_data = db.Column(db.String(100), nullable=False)
    value = db.Column(db.Float, nullable=False)

# Home route
@app.route('/')
def home():
    return render_template('index.html')

# Data management route (POST to add data, GET to fetch all data)
@app.route('/data', methods=['GET', 'POST'])
def manage_data():
    if request.method == 'POST':
        data = request.json
        try:
            new_entry = DailyData(
                user_id=data['user_id'],
                date=data['date'],
                type_of_data=data['type_of_data'],
                value=data['value']
            )
            db.session.add(new_entry)
            db.session.commit()
            return jsonify({"message": "Data added successfully!"}), 200
        except Exception as e:
            return jsonify({"message": f"Error: {str(e)}"}), 400

    elif request.method == 'GET':
        try:
            data_entries = DailyData.query.all()
            results = [
                {
                    "id": entry.id,
                    "user_id": entry.user_id,
                    "date": entry.date,
                    "type_of_data": entry.type_of_data,
                    "value": entry.value,
                }
                for entry in data_entries
            ]
            return jsonify(results), 200
        except Exception as e:
            return jsonify({"message": f"Error: {str(e)}"}), 400

# DELETE route to delete a record by ID
@app.route('/data/<int:id>', methods=['DELETE'])
def delete_data(id):
    try:
        entry = DailyData.query.get(id)
        if entry:
            db.session.delete(entry)
            db.session.commit()
            return jsonify({"message": f"Record {id} deleted successfully!"}), 200
        else:
            return jsonify({"message": f"Record {id} not found!"}), 404
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 400

# PUT route to update a record by ID
@app.route('/data/<int:id>', methods=['PUT'])
def update_data(id):
    data = request.json
    try:
        entry = DailyData.query.get(id)
        if entry:
            entry.user_id = data.get('user_id', entry.user_id)
            entry.date = data.get('date', entry.date)
            entry.type_of_data = data.get('type_of_data', entry.type_of_data)
            entry.value = data.get('value', entry.value)
            db.session.commit()
            return jsonify({"message": f"Record {id} updated successfully!"}), 200
        else:
            return jsonify({"message": f"Record {id} not found!"}), 404
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 400

# Trends route to calculate average values for each type_of_data
@app.route('/trends/<int:user_id>', methods=['GET'])
def get_trends(user_id):
    try:
        # Fetch all records for the given user
        data_entries = DailyData.query.filter_by(user_id=user_id).all()
        if not data_entries:
            return jsonify([]), 200

        # Calculate trends (average value per type_of_data)
        trends = {}
        for entry in data_entries:
            if entry.type_of_data not in trends:
                trends[entry.type_of_data] = []
            trends[entry.type_of_data].append(entry.value)

        # Compute average values
        trends_average = [{key: sum(values) / len(values)} for key, values in trends.items()]

        return jsonify(trends_average), 200
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 400

# Initialize database
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
