from flask import Flask
from flask_cors import CORS
from blueprint.login import auth_bp
from blueprint.getInfo import inf_bp
from blueprint.md_picture import mdpic_bp
from blueprint.md_file import mdfile_bp
from blueprint.admin import admin_bp
from blueprint.manage_bp import manage_bp
from blueprint.photo_bp import photo_bp
from models import db

app = Flask(__name__)
allowed_origins = ["http://vagueame.top",
        "http://vagueame.top:5174"]
CORS(app, supports_credentials=True, origins=allowed_origins)  # 允许跨域请求
app.secret_key = 'your-secret-key'  # 用于会话加密
app.register_blueprint(manage_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(inf_bp)
app.register_blueprint(mdpic_bp)
app.register_blueprint(mdfile_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(photo_bp)
app.config['PERMANENT_SESSION_LIFETIME'] = 360000
app.config['SESSION_PERMANENT'] = True

# 数据库配置 (使用 SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///blog.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='::', port=5000)



