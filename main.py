import os
from random import choice, random, randint

from flask import Flask, render_template, request, jsonify, make_response, redirect
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from flask_restful import abort, Api
from sqlalchemy import exc
import requests
import rest_api_stuff
from data import db_session
from data.user import User
from forms.edit_form import EditForm
from forms.login_form import LoginForm
from forms.signup_form import AuthorizeForm

app = Flask(__name__)
# set REST-API
api = Api(app)
api.add_resource(rest_api_stuff.UserResource, '/api/users/<int:id_user>')
api.add_resource(rest_api_stuff.AllUsersResource, '/api/users/')

app.config['SECRET_KEY'] = '38bb5726c679e925be0d38b4f15502eb'
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    try:
        return db_sess.query(User).get(user_id)
    except exc.InvalidRequestError:
        redirect('/')


def get_rnd(play_type):
    """getting random location from file"""
    if play_type == 'world':
        file = 'worldcities.csv'
    elif play_type == 'russia':
        file = 'russiacities.csv'
    else:
        return get_nearby(play_type)
    data = choice(open(file, encoding='utf-8').readlines())
    return list(map(float, data.split()))


def get_nearby(coords):
    lat, lng = coords
    lat, lng = float(lat) + 0.001 * randint(0, 5) + random() * 0.01 + random() * 0.01, \
               float(lng) + 0.0003 * randint(0, 5) + random() * 0.01 + random() * 0.05
    return [round(lat, 7), round(lng, 7)]


@app.route('/login', methods=['GET', 'POST'])
def login():
    """login page"""
    if current_user.is_authenticated:
        return redirect(f'/id{current_user.id}')
    form = LoginForm()
    if form.validate_on_submit():  # sign in form
        # if password and user are correct, login the user
        user = db_sess.query(User).filter(User.username == form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            return redirect("/")
        return render_template('login.html',
                               message="Неправильное имя пользователя или пароль",
                               form=form)
    return render_template('login.html', title='Авторизация', form=form, message="")


@login_required
@app.route('/session/<string:pl_type>', methods=['GET', 'POST'])
def play(pl_type):
    """game page"""
    print(pl_type)
    score_cs = {'world': 1.3, 'russia': 2, 'custom': 1000.3}
    score_c = score_cs.get(pl_type, 1000.3)

    pl_type = user_coords if pl_type == 'custom' else pl_type
    return render_template('3d.html', coordinates=[get_rnd(pl_type), get_rnd(pl_type), get_rnd(pl_type)],
                           score_c=score_c)


@app.route('/')
def simple_page():
    """main page"""
    return render_template('base.html', user=current_user)


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """signup page"""
    if current_user.is_authenticated:
        return redirect(f'/id{current_user.id}')
    form = AuthorizeForm()
    if form.validate_on_submit():
        # if password and control password are equal
        # and username are not taken, add the user to data base
        if form.password.data == form.password_control.data:
            if not db_sess.query(User).filter(User.username == form.username.data).first():
                user = User()
                user.username = form.username.data
                user.create_password_hash(form.password.data)
                db_sess.add(user)
                db_sess.commit()
                return redirect('/login')
            return render_template('signup.html', form=form, message="Такое имя пользователя уже занято")
        return render_template('signup.html', form=form, message="Пароли не совпадают")
    return render_template('signup.html', form=form, message="")  # do not remove 'message' argument here


@app.route('/add_result/<int:score>', methods=['GET', 'POST'])
def add_result(score):
    """handle score from js"""
    if request.method == 'POST' and current_user.is_authenticated and score <= 15000:
        current_user.score = score + current_user.score
        current_user.games_played += 1
        current_user.medium = round(current_user.score / current_user.games_played)
        current_user.max = score if score > current_user.max else current_user.max
        db_sess.commit()
        return 'How did you get here?'
    abort(404)


@app.route('/logout')
def logout():
    """log out from current user account"""
    if current_user.is_authenticated:
        logout_user()
    return redirect('/login')


@app.route('/id<int:profile_id>')
def profile(profile_id):
    """get profile of user with id == :param profile id"""
    profile_data = db_sess.query(User).filter(User.id == profile_id).first()
    if profile_data:
        return render_template('profile.html', user=profile_data)
    return render_template('profile.html', user='Пользователь не найден')


@app.route('/settings', methods=['GET', 'POST'])
def settings():
    return render_template('profile.html', user='Вы не можете пока ничего настроить')


@app.errorhandler(404)
def not_found(error):
    """handling errors"""
    return make_response(jsonify({'error': 'Page is not found'}), 404)


db_session.global_init("db/web_project.db")
db_sess = db_session.create_session()
# getting coordinates by ip
url = 'http://ip-api.com/json/'
r = requests.get(url)
user_coords = r.json()['lat'], r.json()['lon']
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='127.0.0.1', port=port)
