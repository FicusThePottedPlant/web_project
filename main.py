from random import choice
from flask import Flask, render_template

app = Flask(__name__)
app.config['SECRET_KEY'] = 'сыр'


def get_rnd():
    # data = choice(open('worldcities.csv', encoding='utf-8').readlines())
    data = '"Moscow","Moscow","55.7558","37.6178","Russia","RU","RUS","Moskva","primary","17125000","1643318494"'
    return list(map(float, data.replace('"', '').split(',')[2:4]))


@app.route('/session')
def play():
    return render_template('3d.html', coordinates=[[-23.5504, -46.6339], [-4.3317, 15.3139], [34.1139, -118.4068]])
    # return render_template('3d.html', coordinates=[get_rnd(), get_rnd(), get_rnd()])


@app.route('/')
def general():
    return "Hello"
    # return render_template('3d.html', coordinates=[get_rnd(), get_rnd(), get_rnd()])


if __name__ == '__main__':
    app.run(port=8080, host='127.0.0.1')
