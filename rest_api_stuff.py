from flask import jsonify
from flask_login import current_user
from flask_restful import Resource, reqparse

from data import db_session
from data.user import User

parser = reqparse.RequestParser()
parser.add_argument('username', required=True)
parser.add_argument('password', required=True)


class UserResource(Resource):
    def get(self, id_user):
        db_sess = db_session.create_session()
        a = db_sess.query(User).get(id_user)
        return jsonify({"user": [a.to_dict(only=('username', 'score', 'medium', 'games_played', 'created_date'))]})

    def delete(self, id_user):
        if current_user.id == id_user:
            db_sess = db_session.create_session()
            a = db_sess.query(User).get(id_user)
            if a:
                db_sess.delete(a)
                db_sess.commit()
                return jsonify({'status': ['success']})
            else:
                return jsonify({'status': ['not found']})


class AllUsersResourse(Resource):
    def get(self):
        db_sess = db_session.create_session()
        a = db_sess.query(User).order_by(User.score.desc()).limit(10)
        return jsonify(
            {'users': [i.to_dict(only=('username', 'score', 'medium', 'games_played', 'created_date')) for i in a]})

    def post(self):
        args = parser.parse_args()
        session = db_session.create_session()
        user = User()
        user.username = args['username']
        if len(args['password']) <= 6:
            return jsonify({'success': 'Bad password'})
        user.create_password_hash(args['password'])
        session.add(user)
        session.commit()
        return jsonify({'success': 'OK'})

# from requests import post, get

# print(get('http://localhost:5000/api/users').json())  # get top 10 users by score print(post(
# 'http://localhost:5000/api/users', json={'username': 'artem', 'password': 'artem22', }).json())  # add new user.
# Note that password must be 6 or more symbols

# print(get('http://localhost:5000/api/users/2').json())  # get user by id
