from flask_wtf import FlaskForm
from wtforms import StringField, IntegerField, SubmitField, PasswordField, TextAreaField
from wtforms.validators import DataRequired
from wtforms.fields.html5 import EmailField


class AuthorizeForm(FlaskForm):
    email = EmailField('Почта', validators=[DataRequired()])
    name = StringField('Имя', validators=[DataRequired()])
    surname = StringField('Фамилия', validators=[DataRequired()])
    age = StringField('Возраст', validators=[DataRequired()])
    password = PasswordField('Пароль', validators=[DataRequired()])
    password_control = PasswordField('Повторите пароль', validators=[DataRequired()])
    submit = SubmitField('Авторизация')