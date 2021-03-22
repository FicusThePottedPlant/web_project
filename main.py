from flask import Flask, render_template

app = Flask(__name__)


@app.route('/load')
def file():
    return render_template('file.html')


@app.route('/load2')
def street_view():
    return render_template('3d.html')


if __name__ == '__main__':
    app.run(port=8080, host='127.0.0.1')
