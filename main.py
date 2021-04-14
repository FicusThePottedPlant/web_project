from random import choice
from flask import Flask, render_template, request
import flask
from flask_ngrok import run_with_ngrok
from flask_restful import abort

app = Flask(__name__)
app.config['SECRET_KEY'] = 'сыр'


def get_rnd():
    data = choice(open('worldcities.csv', encoding='utf-8').readlines())
    return list(map(float, data.replace('"', '').split(',')[2:4]))


@app.route('/session')
def play():
    return render_template('3d.html', coordinates=[get_rnd(), get_rnd(), get_rnd()])


@app.route('/')
def general():
    return render_template('main.html')


@app.route('/home')
def profile():
    return render_template('profile.html')


@app.route('/add_result/<int:score>', methods=['GET', 'POST'])
def add_result(score):
    with app.app_context():
        if request.method == 'POST':
            return 'TEST'


if __name__ == '__main__':
    app.run()
