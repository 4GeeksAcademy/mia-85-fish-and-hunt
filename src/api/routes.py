"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from werkzeug.security import generate_password_hash, check_password_hash
from api.models import db, User, Location, Fish
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
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

# ---------------------------------------------------------------------------- #
#                                 GET All Users                                #
# ---------------------------------------------------------------------------- #


@api.route("/users", methods=["GET"])
def get_all_users():
    users = db.session.execute(select(User)).scalars().all()
    return jsonify([user.serialize() for user in users]), 200


# ---------------------------------------------------------------------------- #
#                               GET Current User                               #
# ---------------------------------------------------------------------------- #
@api.route("/user", methods=["GET"])
@jwt_required()
def get_current_user():
    """Return the currently authenticated user's public info.

    Protected route: client must send Authorization: Bearer <access_token>.
    Returns the `user_name` and `email` for the logged-in user.
    """
    identity = get_jwt_identity()
    try:
        user_id = int(identity)
    except Exception:
        return jsonify({"message": "Invalid token identity"}), 401

    user = db.session.scalars(select(User).where(
        User.id == user_id)).one_or_none()
    if user is None:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"user_name": user.user_name, "email": user.email}), 200

# ---------------------------------------------------------------------------- #
#                            PUT Update Current User                           #
# ---------------------------------------------------------------------------- #


@api.route("/user", methods=["PUT"])
@jwt_required()
def update_current_user():
    identity = get_jwt_identity()
    try:
        user_id = int(identity)
    except Exception:
        return jsonify({"message": "Invalid token identity"}), 401

    user = db.session.scalars(select(User).where(
        User.id == user_id)).one_or_none()
    if user is None:
        return jsonify({"message": "User not found"}), 404

    try:
        body = request.get_json(force=True, silent=True) or {}
    except Exception:
        return jsonify({"message": "Invalid JSON body"}), 400

    allowed = ["liked_locations", "added_locations"]
    updated = {}

    for key in allowed:
        if key in body:
            ids = body.get(key) or []
            if not isinstance(ids, list):
                return jsonify({"message": f"Field '{key}' must be an array of location ids"}), 400

            # fetch Location instances for provided ids
            if ids:
                locs = db.session.scalars(
                    select(Location).where(Location.id.in_(ids))).all()
            else:
                locs = []

            # if the User model has this attribute, set it (relationship assignment)
            if hasattr(user, key):
                try:
                    setattr(user, key, locs)
                    updated[key] = [l.id for l in locs]
                except Exception as e:
                    db.session.rollback()
                    return jsonify({"message": f"Failed to update {key}: {str(e)}"}), 500
            else:
                # model not yet updated to support this field
                return jsonify({"message": f"User model does not implement '{key}' yet"}), 501

    # persist changes if any
    if updated:
        try:
            db.session.add(user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": f"Failed to save changes: {str(e)}"}), 500

    return jsonify({"message": "User updated", "updated": updated}), 200


# ---------------------------------------------------------------------------- #
#                               POST User Signup                               #
# ---------------------------------------------------------------------------- #
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

    hashed_password = generate_password_hash(
        password, method='pbkdf2:sha256', salt_length=16)

    # create & persist the user
    newUser = User(email=email.strip(), password=hashed_password,
                   user_name=user_name.strip())
    db.session.add(newUser)
    db.session.commit()

    token = create_access_token(identity=str(newUser.id))
    return jsonify({"token": token, "user": newUser.serialize()}), 201
    # Example request body:
    # {
    #   "email": "user@example.com",
    #   "password": "securepassword",
    #   "username": "newuser"
    # }


# ---------------------------------------------------------------------------- #
#                                POST Login User                               #
# ---------------------------------------------------------------------------- #
@api.route("/login", methods=["POST"])
def handle_login():
    body = request.json
    email = body.get("email", None)
    password = body.get("password", None)
    if email is None or password is None:
        return jsonify(dict(message="Missing Credentials")), 400
    user = db.session.scalars(select(User).where(
        User.email == email.strip())).one_or_none()
    if user is None:
        return jsonify(dict(message="User doesn't exist")), 400
    # compare the provided password with the stored hash
    if not check_password_hash(user.password, password):
        return jsonify(dict(message="Bad Credentials")), 400
    # user has been authenticated
    # create the token
    user_token = create_access_token(identity=str(user.id))
    response_body = dict(
        token=user_token,
        user=user.serialize()
    )
    return jsonify(response_body), 201


# ---------------------------------------------------------------------------- #
#                               POST Logout                              #
# ---------------------------------------------------------------------------- #
@api.route("/logout", methods=["POST"])
def handle_logout():
    body = request.json
    return jsonify(body), 201


# ---------------------------------------------------------------------------- #
#                               GET All Locations                              #
# ---------------------------------------------------------------------------- #
@api.route("/location", methods=["GET"])
def get_all_locations():
    locations = db.session.execute(select(Location)).scalars().all()
    return jsonify([location.serialize() for location in locations]), 200


# ---------------------------------------------------------------------------- #
#                             POST Create Location                             #
# ---------------------------------------------------------------------------- #
@api.route('/location', methods=['POST'])
def create_locations():
    # ensure a JSON body was provided
    try:
        body = request.get_json(force=True, silent=True) or {}
    except Exception:
        return jsonify({"message": "Request body required"}), 400
    if not body:
        return jsonify({"message": "Request body required"}), 400
    name = (body.get("name") or "").strip()
    type = body.get("type")
    position = body.get("position") or {}
    directions = body.get("directions")

# validate required fields
    errors = []
    if not name:
        errors.append("name")
    if type not in {"fishing", "hunting"}:
        errors.append("type must be 'fishing' or 'hunting'")
    try:
        lat = float(position.get("lat"))
        lng = float(position.get("lng"))
        if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
            errors.append("position out of range")
    except (TypeError, ValueError):
        errors.append("position.lat/lng must be numbers")
    if errors:
        return jsonify({"message": "Errors in required fields", "fields": errors}), 400

    new_location = Location(
        name=name.strip(),
        type=type,
        position={"lat": lat, "lng": lng},
        directions=directions.strip()
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


# ---------------------------------------------------------------------------- #
#                               POST Create Fish                               #
# ---------------------------------------------------------------------------- #
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
    # Example request body:
    # {
    #   "name": "Largemouth Bass",
    #   "wiki_link": "https://en.wikipedia.org/wiki/Largemouth_bass",
    #   "image_link": "https://upload.wikimedia.org/wikipedia/commons/...
    # }
