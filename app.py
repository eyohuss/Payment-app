from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'belgian_hub_fallback_key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///belgian_railway.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- PRODUCTION DATABASE MODEL ---
class ScheduledTrip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    destination = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    departure_date = db.Column(db.String(50), nullable=False)

# Ensure the database tables generate dynamically on startup
with app.app_context():
    db.create_all()

# --- WEB AND API ROUTING ENDPOINTS ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/schedule-itinerary', methods=['POST'])
def schedule_itinerary():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"status": "error", "message": "Incomplete payload connection"}), 400
            
        destination = data.get('destination')
        price = int(data.get('price', 0))
        date = data.get('date')
        
        # Enforce minimum macro-tariff limit rule (€100)
        if price < 100:
            return jsonify({"status": "error", "message": "Tariff adjustment deviation. Minimum fare must be €100 or greater."}), 400

        # Log the booking request securely to the local database file
        new_trip = ScheduledTrip(destination=destination, price=price, departure_date=date)
        db.session.add(new_trip)
        db.session.commit()
        
        return jsonify({"status": "success", "message": "Itinerary recorded inside database storage."}), 201
        
    except Exception as error:
        db.session.rollback()
        return jsonify({"status": "error", "message": "Database write interruption occurred."}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
