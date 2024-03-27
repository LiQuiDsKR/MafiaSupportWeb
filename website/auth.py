from flask import Blueprint

auth = Blueprint('auth', __name__)

@auth.route('/prob_master')
def sign_in():
    return "<p>Sign-In</p>"

@auth.route('/logout')
def logout():
    return "<p>Logout</p>"

@auth.route('/sign-up')
def sign_up():
    return "<p>Sign-Up</p>"