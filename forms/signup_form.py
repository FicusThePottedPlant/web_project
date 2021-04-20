from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, PasswordField
from wtforms.validators import DataRequired


class AuthorizeForm(FlaskForm):
    username = StringField('Имя пользователя', validators=[DataRequired()])
    password = PasswordField('Старый пароль', validators=[DataRequired()])
    password_control = PasswordField('Новый пароль', validators=[DataRequired()])
    submit = SubmitField('Зарегестрироваться')
