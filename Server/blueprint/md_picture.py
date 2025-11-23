import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, send_from_directory, make_response
from werkzeug.utils import secure_filename

# 定义蓝图
mdpic_bp = Blueprint('mdpicture', __name__)


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
BACKEND_DOMAIN = "http://vagueame.top:5000"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'}


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@mdpic_bp.route('/uploads/image', methods=['POST', 'OPTIONS'])
def upload_image():
    # 1. 处理跨域预检 (CORS OPTIONS)
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', '*')
        resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return resp

    # 2. 获取文件对象 (兼容 ByteMD 和 EditorMD)
    if 'file' in request.files:
        f = request.files['file']
    elif 'editormd-image-file' in request.files:
        f = request.files['editormd-image-file']
    else:
        return jsonify({'error': '未找到文件字段，请检查前端 FormData'}), 400

    if f.filename == '':
        return jsonify({'error': '文件名为空'}), 400

    if f and allowed_file(f.filename):
        try:
            # 3. 生成日期路径 (YYYY/MM/DD)
            now = datetime.now()
            year = now.strftime('%Y')
            month = now.strftime('%m')
            day = now.strftime('%d')

            # 物理存储路径: .../uploads/2023/10/27
            file_dir = os.path.join(UPLOAD_FOLDER, year, month, day)
            if not os.path.exists(file_dir):
                os.makedirs(file_dir, exist_ok=True)

            # 4. 生成安全且唯一的文件名
            # 格式: HHMMSS_随机码.jpg (防止文件名冲突)
            ext = f.filename.rsplit('.', 1)[1].lower()
            original_safe = secure_filename(f.filename.rsplit('.', 1)[0])
            unique_id = uuid.uuid4().hex[:6]
            timestamp = now.strftime('%H%M%S')

            new_filename = f"{timestamp}_{unique_id}.{ext}"

            # 5. 保存文件
            save_path = os.path.join(file_dir, new_filename)
            f.save(save_path)

            file_url = f"{BACKEND_DOMAIN}/uploads/{year}/{month}/{day}/{new_filename}"
            print(f"[UPLOAD SUCCESS] Saved to: {save_path}")

            return jsonify({
                "url": file_url,
                "alt": new_filename,
                "title": new_filename
            })

        except Exception as e:
            print(f"[UPLOAD ERROR] {e}")
            return jsonify({'error': '服务器内部保存失败'}), 500
    else:
        return jsonify({'error': '不支持的文件格式'}), 400


# --- 图片访问接口 ---
#TODO: 后期不使用这个，转到apache2挂载图片

@mdpic_bp.route('/uploads/<year>/<month>/<day>/<filename>')
def serve_uploaded_file(year, month, day, filename):
    # 拼接完整的物理目录路径
    directory = os.path.join(UPLOAD_FOLDER, year, month, day)
    return send_from_directory(directory, filename)


