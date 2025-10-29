from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    locations: Mapped["LocationsList"] = relationship(
        back_populates="user", cascade="all, delete-orphan", uselist=False)
    user_name: Mapped[str] = mapped_column(String, nullable=False)
    zipcode: Mapped[int] = mapped_column(Integer)
    # latitude: Mapped[int] =  mapped_column(Integer)
    # longitude: Mapped[int] = mapped_column(Integer)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "locations": self.locations,
            "user_name": self.user_name,
            "zipcode": self.zipcode,
            # do not serialize the password, its a security breach
        }
