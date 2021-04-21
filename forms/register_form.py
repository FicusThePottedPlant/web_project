from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField
from wtforms.validators import DataRequired


class AuthorizeForm(FlaskForm):
    nickname = StringField('Имя пользователя', validators=[DataRequired()])
    password = PasswordField('Пароль', validators=[DataRequired()])
    password_control = PasswordField('Повторите пароль', validators=[DataRequired()])
    submit = SubmitField('Авторизация')
