import datetime

import sqlalchemy
from flask_login import UserMixin
from sqlalchemy_serializer import SerializerMixin
from werkzeug.security import generate_password_hash, check_password_hash

from .db_session import SqlAlchemyBase


class User(SqlAlchemyBase, UserMixin, SerializerMixin):
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer,
                           primary_key=True, autoincrement=True)
    username = sqlalchemy.Column(sqlalchemy.String,
                                 index=True, unique=True, nullable=True)
    score = sqlalchemy.Column(sqlalchemy.Integer, nullable=True, default=0)
    medium = sqlalchemy.Column(sqlalchemy.Integer, nullable=True, default=0)
    games_played = sqlalchemy.Column(sqlalchemy.Integer, nullable=True, default=0)
    max = sqlalchemy.Column(sqlalchemy.Integer, nullable=True, default=0)

    hashed_password = sqlalchemy.Column(sqlalchemy.String, nullable=True)
    created_date = sqlalchemy.Column(sqlalchemy.String,
                                     default=datetime.datetime.now().strftime('%d.%m.%Y'))

    def create_password_hash(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)

    def __str__(self):
        return f'{self.id}, {self.username}, {self.score}, {self.created_date}'
