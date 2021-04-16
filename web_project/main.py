import os
from random import choice

from flask import Flask, render_template, request, jsonify, make_response, redirect
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from flask_restful import abort

from data import db_session
from data.user import User
from forms.login_form import LoginForm
from forms.register_form import AuthorizeForm

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cheese'
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return db_sess.query(User).get(user_id)


def get_rnd():
    """getting random location from file"""
    data = choice(open('worldcities.csv', encoding='utf-8').readlines())
    return list(map(float, data.replace('"', '').split(',')[2:4]))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """login page"""
    if current_user.is_authenticated:
        return redirect(f'/id{current_user.id}')
    form = LoginForm()
    if form.validate_on_submit():
        user = db_sess.query(User).filter(User.username == form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            return redirect("/")
        return render_template('login.html',
                               message="Неправильное имя пользователя или пароль",
                               form=form)
    return render_template('login.html', title='Авторизация', form=form)


@login_required
@app.route('/session', methods=['GET', 'POST'])
def play():
    """game page"""
    if current_user.is_authenticated:
        return render_template('3d.html', coordinates=[get_rnd(), get_rnd(), get_rnd()])
    return redirect('/login')


@app.route('/')
def simple_page():
    """main page"""
    if current_user.is_authenticated:
        return render_template('base.html', user=current_user)
    return redirect('/login')


@app.route('/register', methods=['GET', 'POST'])
def register():
    """register page"""
    if current_user.is_authenticated:
        return redirect(f'/id{current_user.id}')
    form = AuthorizeForm()
    if form.validate_on_submit():
        if form.password.data == form.password_control.data:
            user = User()
            user.username = form.username.data
            user.create_password_hash(form.password.data)
            db_sess.add(user)
            db_sess.commit()
            return redirect('/login')
    return render_template('register.html', form=form)


@app.route('/add_result/<int:score>', methods=['GET', 'POST'])
def add_result(score):
    """handle score from js"""
    with app.app_context():
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
    if current_user.is_authenticated:
        logout_user()
    return redirect('/login')


@app.route('/id<int:profile_id>')
def profile(profile_id):
    profile_data = db_sess.query(User).filter(User.id == profile_id).first()
    return f'{profile_data}'


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Page is not found'}), 404)


if __name__ == '__main__':
    db_session.global_init("db/web_project.db")
    db_sess = db_session.create_session()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
