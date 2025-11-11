from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean,  JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    user_name: Mapped[str] = mapped_column(String, nullable=False)
    zipcode: Mapped[int] = mapped_column(Integer, nullable=True)
    liked_locations = relationship(
        "Location",
        secondary="user_likes",
        back_populates="liked_by_users"
    )
    added_locations = relationship(
        "Location",
        backref="added_by_user",
        cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "user_name": self.user_name,
            "liked_locations": [location.serialize() for location in self.liked_locations],
            "added_locations": [location.serialize() for location in self.added_locations],
            # do not serialize the password, its a security breach
        }


class Location(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[dict] = mapped_column(JSON, nullable=False)
    directions: Mapped[str] = mapped_column(String(255), nullable=True)

    creator_id: Mapped[int] = mapped_column(
        db.ForeignKey('user.id'), nullable=True)
    creator: Mapped["User"] = relationship("User", backref="created_locations")

    liked_by_users = relationship(
        "User",
        secondary="user_likes",
        back_populates="liked_locations"
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "position": self.position,
            "directions": self.directions,
            "creator_id": self.creator_id,
            "liked_by": [u.id for u in self.liked_by_users],
        }


class Fish(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    wiki_link: Mapped[str] = mapped_column(String(255), nullable=True)
    image_link: Mapped[str] = mapped_column(String(255), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "wiki_link": self.wiki_link,
            "image_link": self.image_link,
        }
