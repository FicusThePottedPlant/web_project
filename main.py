from random import choice
from flask import Flask, render_template

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
    return "Hello"
    # return render_template('3d.html', coordinates=[get_rnd(), get_rnd(), get_rnd()])


if __name__ == '__main__':
    app.run(port=8080, host='127.0.0.1')
