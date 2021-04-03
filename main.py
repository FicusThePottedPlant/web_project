from flask import Flask, render_template, request
from flask_wtf import FlaskForm
from werkzeug.utils import redirect
from wtforms import SubmitField
from random import choice
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'сыр'


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


if __name__ == '__main__':
    app.run(port=8080, host='127.0.0.1')
