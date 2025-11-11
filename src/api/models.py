from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Integer, JSON, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

# ---------------------------------------------------------------------
# Association table for the many-to-many "likes" relation
# (must be defined BEFORE the models that reference it)
# ---------------------------------------------------------------------
user_likes = Table(
    "user_likes",
    db.metadata,
    Column("user_id", Integer, ForeignKey("user.id"), primary_key=True),
    Column("location_id", Integer, ForeignKey(
        "location.id"), primary_key=True),
)


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    user_name: Mapped[str] = mapped_column(String, nullable=False)
    zipcode: Mapped[int] = mapped_column(Integer, nullable=True)

    # Many-to-many: the locations this user liked
    liked_locations = relationship(
        "Location",
        secondary=user_likes,
        back_populates="liked_by_users",
    )

    # One-to-many: the locations this user created
    added_locations = relationship(
        "Location",
        back_populates="creator",
        cascade="all, delete-orphan",
    )

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "user_name": self.user_name,
            "liked_location_ids": [loc.id for loc in self.liked_locations],
            "added_location_ids": [loc.id for loc in self.added_locations],
        }


class Location(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[dict] = mapped_column(JSON, nullable=False)
    directions: Mapped[str] = mapped_column(String(255), nullable=True)

    # creator (one-to-many back to User.added_locations)
    creator_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=True)
    creator = relationship("User", back_populates="added_locations")

    # liked-by (many-to-many back to User.liked_locations)
    liked_by_users = relationship(
        "User",
        secondary=user_likes,
        back_populates="liked_locations",
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "position": self.position,
            "directions": self.directions,
            "creator_id": self.creator_id,
            "liked_by_user_ids": [u.id for u in self.liked_by_users],
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
