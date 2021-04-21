from flask import jsonify,url_for
from flask_restful import Resource, reqparse
from data import db_session
from data.user import User

parser = reqparse.RequestParser()
parser.add_argument('email', required=True)
parser.add_argument('password', required=True)


class UserResource(Resource):
    def get(self, id_user):
        db_sess = db_session.create_session()
        a = db_sess.query(User).get(id_user)
        return jsonify({"users": [a.to_dict()]})

    def delete(self, id_user):
        db_sess = db_session.create_session()
        a = db_sess.query(User).get(id_user)
        if a:
            db_sess.delete(a)
            db_sess.commit()
            return jsonify({'status': ['succes']})
        else:
            return jsonify({'status': ['not found']})


class AllUsersResourse(Resource):
    def get(self):
        db_sess = db_session.create_session()
        a = db_sess.query(User).all()
        return jsonify({'items': [i.to_dict() for i in a]})

    def post(self):
        args = parser.parse_args()
        session = db_session.create_session()
        user = User()
        user.username = args['email']
        user.create_password_hash(args['password'])
        session.add(user)
        session.commit()
        return jsonify({'success': 'OK'})
