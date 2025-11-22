import os
from flask import request, jsonify, send_from_directory, make_response, Blueprint
from werkzeug.utils import secure_filename
from datetime import datetime
from . import dabopration

mdpic_bp = Blueprint('mdpicture', __name__)

UPLOAD_FOLDER = dabopration.project_root.parent / 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
EDITORMD_FILE_INPUT_NAME = 'editormd-image-file'
MAX_FILE_SIZE_KB = 2048
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024
UPLOAD_URL_BASE = '/uploads'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    print(f"创建基础上传目录: {UPLOAD_FOLDER}")

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_json_response(success, message, url=None):
    data = {"success": 1 if success else 0, "message": message}
    if success and url:
        data["url"] = url
    response = jsonify(data)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# --- 上传接口 (核心修改) ---
@mdpic_bp.route('/uploads/image', methods=['POST', 'OPTIONS'])
def upload_image():
    if request.method == 'OPTIONS':
        resp = make_response()
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return resp

    if EDITORMD_FILE_INPUT_NAME not in request.files:
        msg = f"请求中未找到文件输入字段 '{EDITORMD_FILE_INPUT_NAME}'"
        return create_json_response(False, msg), 400
    file = request.files[EDITORMD_FILE_INPUT_NAME]
    if file.filename == '':
        msg = "未选择任何文件"
        return create_json_response(False, msg), 400

    if file and allowed_file(file.filename):
        try:
            current_pos = file.tell()
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(current_pos)
            if file_size > MAX_FILE_SIZE_BYTES:
                msg = f"文件大小 ({file_size // 1024} KB) 超过限制 ({MAX_FILE_SIZE_KB} KB)"
                return create_json_response(False, msg), 400

            # 1. 分别获取年、月、日
            now = datetime.now()
            year = now.strftime('%Y')
            month = now.strftime('%m')
            day = now.strftime('%d')

            # 2. 使用 os.path.join 创建三层嵌套的物理目录路径
            target_dir = os.path.join(UPLOAD_FOLDER, year, month, day)

            # 3. 安全地创建嵌套目录
            os.makedirs(target_dir, exist_ok=True)

            # 4. 生成安全且唯一的文件名 (保持不变)
            original_filename_safe = secure_filename(file.filename)
            timestamp_unique = now.strftime('%H%M%S%f')
            new_filename = f"{timestamp_unique}_{original_filename_safe}"

            # 5. 确定最终的保存路径 (指向三层目录内)
            save_path = os.path.join(target_dir, new_filename)

            print(f"准备保存文件到: {save_path}")
            file.save(save_path)

            # 6. 构建包含三层目录的访问 URL

            uploaded_file_url = os.path.join(UPLOAD_URL_BASE, year, month, day, new_filename).replace('\\', '/')
            return create_json_response(True, "上传成功", uploaded_file_url)

        except Exception as e:
            msg = f"服务器内部错误: {e}"
            return create_json_response(False, msg), 500
    else:
        msg = f"无效的文件类型。允许的类型: {', '.join(ALLOWED_EXTENSIONS)}"
        return create_json_response(False, msg), 400


@mdpic_bp.route('/uploads/<year>/<month>/<day>/<filename>')
def uploaded_file(year, month, day, filename):
    try:
        directory = os.path.join(UPLOAD_FOLDER, year, month, day)
        return send_from_directory(directory, filename)
    except FileNotFoundError:
        return "文件未找到", 404
