from flask import Flask, render_template, request
from data import db_session
from data.user import User
from flask_wtf import FlaskForm
from flask_login import LoginManager, login_user, current_user
from werkzeug.utils import redirect
from wtforms import SubmitField
from random import choice
import os
from forms.user_form import AuthorizeForm
from forms.login_form import LoginForm

app = Flask(__name__)
app.config['SECRET_KEY'] = 'cheese'
login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    db_sess = db_session.create_session()
    return db_sess.query(User).get(user_id)


def get_rnd():
    from random import choice
    data = choice(open('worldcities.csv', encoding='utf-8').readlines())
    print(data)
    # data = '"Moscow","Moscow","55.7558","37.6178","Russia","RU","RUS","Moskva","primary","17125000","1643318494"'
    return data.replace('"', '').split(',')[2:4]


@app.route('/session', methods=['GET', 'POST'])
def play():
    x, y = get_rnd()
    return render_template('3d.html', lat=float(x), lng=float(y))


@app.route('/')
def simple_page():
    db_sess = db_session.create_session()
    if current_user.is_authenticated:
        man = current_user.id
    else:
        man = ''
    try:
        return render_template('index.html', user=man)
    except Exception as e:
        print('aboba_2')


@app.route('/register', methods=['GET', 'POST'])
def register():
    form = AuthorizeForm()
    if form.validate_on_submit():
        db_sess = db_session.create_session()
        if form.password.data == form.password_control.data:
            user = User()
            user.surname = form.surname.data
            user.name = form.name.data
            user.age = form.age.data
            user.email = form.email.data
            user.create_password_hash(form.password.data)
            user.score = 0
            db_sess.add(user)
            db_sess.commit()
            return redirect('/login')
    return render_template('register.html', form=form)


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        db_sess = db_session.create_session()
        user = db_sess.query(User).filter(User.email == form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            return redirect("/")
        return render_template('login.html',
                               message="Неправильный логин или пароль",
                               form=form)
    return render_template('login.html', title='Авторизация', form=form)


if __name__ == '__main__':
    db_session.global_init("db/web_project.db")
    app.run()
    app.run(port=8080, host='127.0.0.1')
