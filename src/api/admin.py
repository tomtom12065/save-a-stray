# admin.py
import os
from flask import session, redirect, url_for, request, render_template
from flask_admin import Admin, AdminIndexView, expose
from flask_admin.contrib.sqla import ModelView
from .models import db, User, Cat, ChatMessage, Application

class AuthenticatedModelView(ModelView):
    def is_accessible(self):
        return session.get('logged_in', False)

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for('admin.login'))

class AdminHomeView(AdminIndexView):
    @expose('/')
    def index(self):
        if not session.get('logged_in'):
            return redirect(url_for('admin.login'))
        return super().index()

    @expose('/login', methods=['GET', 'POST'])
    def login(self):
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            if username == os.getenv('ADMIN_USERNAME') and password == os.getenv('ADMIN_PASSWORD'):
                session['logged_in'] = True
                return redirect(url_for('admin.index'))
            return render_template('admin/login.html', error='Invalid credentials')
        return render_template('admin/login.html')

    @expose('/logout')
    def logout(self):
        session.pop('logged_in', None)
        return redirect(url_for('admin.login'))

def setup_admin(app):
    # Create admin interface
    admin = Admin(
        app,
        name='Save-A-Stray Admin',
        index_view=AdminHomeView(name='Home'),
        template_mode='bootstrap3'
    )

    # Add protected views
    admin.add_view(AuthenticatedModelView(User, db.session))
    admin.add_view(AuthenticatedModelView(Cat, db.session))
    admin.add_view(AuthenticatedModelView(ChatMessage, db.session))
    admin.add_view(AuthenticatedModelView(Application, db.session))