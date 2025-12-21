import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import secure_filename
from PIL import Image,ImageOps  # pip install Pillow
from models import db, Photo, BlogUser


photo_bp = Blueprint('photo_bp', __name__)

# 配置允许的扩展名
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 辅助函数：生成缩略图
def create_thumbnail(image_path, thumb_path, max_size=(600, 800)):
    try:
        with Image.open(image_path) as img:
            img = ImageOps.exif_transpose(img)
            # 转换为 RGB (防止 PNG 透明通道导致保存 JPG 报错)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")

            # 保持比例缩放 (thumbnail 方法是原地修改)
            img.thumbnail(max_size)
            img.save(thumb_path, "JPEG", quality=85)
        return True
    except Exception as e:
        print(f"Thumbnail Error: {e}")
        return False

# --- 1. 上传图片 API ---
@photo_bp.route('/share-upload', methods=['POST'])
def upload_photo():
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    if 'photo' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400

    file = request.files['photo']
    description = request.form.get('description', 'Share beauty with you.')
    user_id = session['user']

    if file and allowed_file(file.filename):
        # 1. 确保目录存在
        # 假设你的 Flask app 配置了 UPLOAD_FOLDER = 'static/uploads/photos'
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'photos')
        os.makedirs(upload_folder, exist_ok=True)

        # 2. 生成安全且唯一的文件名
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_name = f"{uuid.uuid4().hex}"
        filename = f"{unique_name}.{ext}"
        thumb_filename = f"{unique_name}_thumb.jpg" # 缩略图统一存为 JPG

        file_path = os.path.join(upload_folder, filename)
        thumb_path = os.path.join(upload_folder, thumb_filename)

        # 3. 保存原图
        file.save(file_path)

        # 4. 生成缩略图
        create_thumbnail(file_path, thumb_path)

        # 5. 写入数据库
        # 确保 BlogUser 存在 (虽然通常 Session 里的用户肯定存在，但为了外键约束安全)
        user = BlogUser.query.filter_by(username=user_id).first()
        if not user:
            user = BlogUser(username=user_id) # 懒创建
            db.session.add(user)

        new_photo = Photo(
            user_id=user_id,
            filename=filename,
            thumb_filename=thumb_filename,
            description=description
        )
        db.session.add(new_photo)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Uploaded', 'data': new_photo.to_dict()})

    return jsonify({'status': 'error', 'message': 'Invalid file type'}), 400


# --- 2. 获取图片列表 API (公共瀑布流) ---
# 前端传参: ?page=1 (默认 1)
@photo_bp.route('/gallery-photos', methods=['GET'])
def get_gallery():
    page = request.args.get('page', 1, type=int)
    per_page = 9 # 一次给 9 张

    # 按时间倒序查询
    pagination = Photo.query.order_by(Photo.uploaded_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    photos = [p.to_dict() for p in pagination.items]

    return jsonify({
        'status': 'success',
        'photos': photos,
        'has_more': pagination.has_next, # 告诉前端还有没有下一页
        'total': pagination.total,
        'page': page
    })


# --- 3. 获取我的图片 API (用户管理用) ---
# photo_bp.py

@photo_bp.route('/my-photos', methods=['GET'])
def get_my_photos():
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    user_id = session['user']

    # [修改] 获取分页参数
    limit = request.args.get('limit', 16, type=int) # 默认 16
    offset = request.args.get('offset', 0, type=int)

    # 查总数
    total = Photo.query.filter_by(user_id=user_id).count()

    # 查分页数据
    my_photos = Photo.query.filter_by(user_id=user_id)\
                    .order_by(Photo.uploaded_at.desc())\
                    .limit(limit).offset(offset).all()

    return jsonify({
        'status': 'success',
        'photos': [p.to_dict() for p in my_photos],
        'total': total,
        'has_more': (offset + limit) < total
    })


# --- 4. 删除图片 API ---
@photo_bp.route('/delete-photo/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    user_id = session['user']

    # 查找图片且确认是当前用户的
    photo = Photo.query.filter_by(id=photo_id, user_id=user_id).first()

    if not photo:
        return jsonify({'status': 'error', 'message': 'Photo not found or permission denied'}), 404

    try:
        # 1. 删除磁盘文件
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'photos')
        if photo.filename:
            path = os.path.join(upload_folder, photo.filename)
            if os.path.exists(path):
                os.remove(path)

        if photo.thumb_filename:
            thumb_path = os.path.join(upload_folder, photo.thumb_filename)
            if os.path.exists(thumb_path):
                os.remove(thumb_path)

        # 2. 删除数据库记录
        db.session.delete(photo)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Deleted'})

    except Exception as e:
        db.session.rollback()
        print(f"Delete Error: {e}")
        return jsonify({'status': 'error', 'message': 'Server Error'}), 500
