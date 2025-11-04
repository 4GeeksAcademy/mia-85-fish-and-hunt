"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Location
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
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
    data = request.get_json()
    name = data.get("name")
    type_ = data.get("type")
    position = data.get("position")
    directions = data.get("directions")

    if not name or not type_ or not position:
        return jsonify({"error": "Missing required fields: name, type, or position"}), 400

    new_location = Location(
        name=name,
        type=type_,
        position=position,
        directions=directions
    )

    db.session.add(new_location)
    db.session.commit()

    return jsonify({
        "message": "Location added",
        "location": new_location.serialize()
    }), 201
