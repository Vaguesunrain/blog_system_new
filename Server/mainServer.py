from flask import Flask
from flask_cors import CORS
from blueprint.login import auth_bp
from blueprint.delete_user import du_bp
from blueprint.getInfo import inf_bp
from blueprint.md_picture import mdpic_bp
from blueprint.md_file import mdfile_bp
from blueprint.statistic import statistic_bp
import blueprint
app = Flask(__name__)
allowed_origins = ["http://vagueame.top"]
CORS(app, supports_credentials=True, origins=allowed_origins)  # 允许跨域请求
app.secret_key = 'your-secret-key'  # 用于会话加密
blueprint.create_json()
app.register_blueprint(auth_bp)
app.register_blueprint(du_bp)
app.register_blueprint(inf_bp)
app.register_blueprint(mdpic_bp)
app.register_blueprint(mdfile_bp)
app.register_blueprint(statistic_bp)

if __name__ == '__main__':
    app.run(host='::', port=5000)



