"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Location
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required
from sqlalchemy import select

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route("/location", methods=["GET"])
def get_all_locations():
    locations = db.session.execute(select(Location)).scalars().all()
    return jsonify([location.serialize() for location in locations]), 200


@api.route('/location', methods=['POST'])
def create_locations():
@api.route('/signup', methods=["POST"])
def handle_signup():
    # ensure a JSON body was provided
    try:
        body = request.get_json()
    except Exception:
        return jsonify({"message": "Request body required"}), 400
    if not body:
        return jsonify({"message": "Request body required"}), 400
    name = body.get("name")
    type = body.get("type")
    position = body.get("position")
    directions = body.get("directions")

# validate required fields
    missing = []
    if not name:
        missing.append("name")
    if not type:
        missing.append("type")
    if not position:
        missing.append("position")
    if missing:
        return jsonify({"message": "Missing required fields", "fields": missing}), 400

    new_location = Location(
        name=name,
        type=type,
        position=position,
        directions=directions
    )

    db.session.add(new_location)
    db.session.commit()

    return jsonify({
        "message": "Location added",
        "location": new_location.serialize()
    }), 201

    # Example request body:
    # {
    #   "name": "Lackawana",
    #   "type": "fishing",
    #   "position": { "longitude": 45.0, "latitude": 62.0 }
    # }
