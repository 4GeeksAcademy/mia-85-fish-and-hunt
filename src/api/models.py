from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean,  JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            # do not serialize the password, its a security breach
        }


class Location(db.Model):

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[dict] = mapped_column(JSON, nullable=False)
    directions: Mapped[str] = mapped_column(String(255), nullable=True)

    # liked_by_users = relationship(
    #     "User",
    #     secondary="user_likes",
    #     back_populates="liked_locations"
    # )


def serialize(self):
    return {
        "id": self.id,
        "name": self.name,
        "type": self.type,
        "position": self.position,
        "directions": self.directions,
    }
