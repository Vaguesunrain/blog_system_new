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
        # 1. 基础上传目录
        base_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'photos')

        # 2. [新增] 生成日期子目录
        now = datetime.now()
        date_folder = now.strftime('%Y/%m') # 使用 / 作为路径分隔符(兼容URL)

        save_folder = os.path.join(base_folder, *date_folder.split('/'))

        # 如果目录不存在，创建它
        os.makedirs(save_folder, exist_ok=True)

        # 3. 生成文件名
        ext = file.filename.rsplit('.', 1)[1].lower()
        unique_id = uuid.uuid4().hex
        name_only = f"{unique_id}.{ext}"
        thumb_name_only = f"{unique_id}_thumb.jpg"

        # 物理全路径
        file_path = os.path.join(save_folder, name_only)
        thumb_path = os.path.join(save_folder, thumb_name_only)

        # 4. 保存文件
        file.save(file_path)
        create_thumbnail(file_path, thumb_path)

        # 5. [关键] 存入数据库的相对路径
        db_filename = f"{date_folder}/{name_only}"
        db_thumb_filename = f"{date_folder}/{thumb_name_only}"

        # 确保 User 存在
        user = BlogUser.query.filter_by(username=user_id).first()
        if not user:
            user = BlogUser(username=user_id)
            db.session.add(user)

        new_photo = Photo(
            user_id=user_id,
            filename=db_filename,        # 存的是: 2024/05/uuid.jpg
            thumb_filename=db_thumb_filename,
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

@photo_bp.route('/delete-photo/<int:photo_id>', methods=['DELETE'])
def delete_photo(photo_id):
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401

    user_id = session['user']
    photo = Photo.query.filter_by(id=photo_id, user_id=user_id).first()

    if not photo:
        return jsonify({'status': 'error', 'message': 'Photo not found'}), 404

    try:
        base_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'photos')

        # photo.filename 可能是 "2024/05/abc.jpg" 也可能是老的 "abc.jpg"
        # os.path.join 都能正确处理
        if photo.filename:
            full_path = os.path.join(base_folder, os.path.normpath(photo.filename))
            if os.path.exists(full_path):
                os.remove(full_path)

        if photo.thumb_filename:
            thumb_full_path = os.path.join(base_folder, os.path.normpath(photo.thumb_filename))
            if os.path.exists(thumb_full_path):
                os.remove(thumb_full_path)

        db.session.delete(photo)
        db.session.commit()

        return jsonify({'status': 'success', 'message': 'Deleted'})

    except Exception as e:
        db.session.rollback()
        print(f"Delete Error: {e}")
        return jsonify({'status': 'error', 'message': 'Server Error'}), 500
