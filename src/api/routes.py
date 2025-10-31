"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
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


@api.route('/signup', methods=["POST"])
def handle_signup():
    body = request.json or {}
    email = body.get("email")
    password = body.get("password")
    user_name = body.get("user_name")
    zipcode = body.get("zipcode")

    # only check by email for existence
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists, please login!"}), 400

    # create & persist the mapped instance
    newUser = User(email=email, password=password,
                   user_name=user_name, zipcode=zipcode)
    db.session.add(newUser)
    db.session.commit()              # newUser.id is now available

    token = create_access_token(identity=str(newUser.id))
    return jsonify({"token": token, "user": newUser.serialize()}), 201
