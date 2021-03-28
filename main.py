from flask import Flask, render_template

app = Flask(__name__)


def get_rnd():
    from random import randint
    a = randint(1, 26570)
    data = open('worldcities.csv', encoding='utf-8').readlines()[a]
    return data.replace('"', '').split(',')[2:4]


@app.route('/load')
def file():
    return render_template('file.html')


@app.route('/load2')
def street_view():
    x, y = get_rnd()
    return render_template('3d.html', lat=float(x), lng=float(y))


@app.route('/')
def play():
    x, y = get_rnd()
    print(x, y)
    return render_template('3d.html', lat=float(x), lng=float(y))


if __name__ == '__main__':
    app.run(port=8080, host='127.0.0.1')
