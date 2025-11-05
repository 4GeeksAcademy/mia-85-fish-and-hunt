"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Location, Fish
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


@api.route("/users", methods=["GET"])
def get_all_users():
    users = db.session.execute(select(User)).scalars().all()
    return jsonify([user.serialize() for user in users]), 200


@api.route('/signup', methods=["POST"])
def handle_signup():
    # ensure a JSON body was provided
    try:
        body = request.get_json()
    except Exception:
        return jsonify({"message": "Request body required"}), 400
    if not body:
        return jsonify({"message": "Request body required"}), 400
    # read expected fields
    email = body.get("email")
    password = body.get("password")
    user_name = body.get("username")

    # validate required fields
    missing = []
    if not email:
        missing.append("email")
    if not password:
        missing.append("password")
    if not user_name:
        missing.append("username")
    if missing:
        return jsonify({"message": "Missing required fields", "fields": missing}), 400

    # only check by email for existence
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists, please login!"}), 400

    # create & persist the mapped instance
    newUser = User(email=email, password=password, user_name=user_name)
    db.session.add(newUser)
    db.session.commit()              # newUser.id is now available

    token = create_access_token(identity=str(newUser.id))
    return jsonify({"token": token, "user": newUser.serialize()}), 201


@api.route("/location", methods=["GET"])
def get_all_locations():
    locations = db.session.execute(select(Location)).scalars().all()
    return jsonify([location.serialize() for location in locations]), 200


@api.route('/location', methods=['POST'])
def create_locations():
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


@api.route('/fish-species', methods=['POST'])
def create_fish_species():
    # ensure a JSON body was provided
    try:
        body = request.get_json()
    except Exception:
        return jsonify({"message": "Request body required"}), 400
    if not body:
        return jsonify({"message": "Request body required"}), 400
    name = body.get("name")
    wiki_link = body.get("type")
    image_link = body.get("position")

# validate required fields
    missing = []
    if not name:
        missing.append("name")
    if not wiki_link:
        missing.append("wiki_link")
    if not image_link:
        missing.append("image_link")
    if missing:
        return jsonify({"message": "Missing required fields", "fields": missing}), 400

    new_fish = Fish(
        name=name,
        wiki_link=wiki_link,
        image_link=image_link
    )

    db.session.add(new_fish)
    db.session.commit()

    return jsonify({
        "message": "Fish species added",
        "fish": new_fish.serialize()
    }), 201


@api.route("/login", methods=["POST"])
def handle_login():
    body = request.json
    email = body.get("email", None)
    password = body.get("password", None)
    if email is None or password is None:
        return jsonify(dict(message="Missing Credentials")), 400
    user = db.session.scalars(select(User).where(
        User.email == email)).one_or_none()
    if user is None:
        return jsonify(dict(message="User doesn't exist")), 400
    if user.password != password:
        return jsonify(dict(message="Bad Credentials")), 400
    # user has been authenticated
    # create the token
    user_token = create_access_token(identity=str(user.id))
    response_body = dict(
        token=user_token,
        user=user.serialize()
    )
    return jsonify(response_body), 201
