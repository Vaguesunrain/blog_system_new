import os
from flask import Blueprint, jsonify, make_response, request, session, send_file
from blueprint import dabopration

inf_bp = Blueprint('information', __name__)


def get_user_data_path(username):
    return dabopration.USER_file / str(username) / 'user_data.json'


@inf_bp.route('/user', methods=['GET'])
def get_user():
    if 'user' in session:
        username = session['user']
        file_path = get_user_data_path(username)
        extra_data = dabopration.read_json_safe(file_path)

        response_data = {
            'loggedIn': True,
            'username': username,
            'details': extra_data
        }
        return jsonify(response_data)
    else:
        return jsonify({'loggedIn': False})

@inf_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    response = make_response(jsonify({'success': True}))
    response.set_cookie('username', '', expires=0, httponly=True, secure=True)
    return response

@inf_bp.route('/get-photo', methods=['GET'])
def get_photo():
    try:
        if 'user' not in session:
             default_image = os.path.join(dabopration.DB_CONFIG_PATH.parent / 'person_img' , 'none.jpg')
             return send_file(default_image, mimetype='image/jpeg')

        username = session['user']
        user_folder = dabopration.USER_file / str(username) /'img'
        default_image = os.path.join(dabopration.DB_CONFIG_PATH.parent / 'person_img' , 'none.jpg')
        user_image = os.path.join(user_folder, "person.jpg")

        if os.path.exists(user_image):
            return send_file(user_image, mimetype='image/jpeg')
        else:
            return send_file(default_image, mimetype='image/jpeg')
    except Exception as e:
        print(f"Error getting photo: {e}")
        return jsonify({'error': 'Internal Server Error'}), 500

@inf_bp.route('/push-photo', methods=['POST'])
def upload_photo():
    if 'avatar' not in request.files:
        return jsonify({'error': '请求中未找到名为 "avatar" 的文件部分'}), 400
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'error': '未选择任何文件'}), 400

    username = session['user']
    user_folder = dabopration.USER_file / str(username) /'img'
    if file:
        try:
            filename = 'person.jpg'
            save_path = os.path.join(user_folder, filename)
            file.save(save_path)
            print(f"图片已成功保存至: {save_path}")
            return jsonify({
                'message': '图片上传成功并已保存',
                'filepath': save_path
            }), 200
        except Exception as e:
            print(f"文件保存时出错: {e}")
            return jsonify({'error': f'服务器内部错误: {str(e)}'}), 500

@inf_bp.route('/push-background', methods=['POST'])
def upload_background():

    if 'background' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['background']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    username = session['user']
    user_img_folder = dabopration.USER_file / str(username) / 'img'

    # 确保目录存在
    if not user_img_folder.exists():
        user_img_folder.mkdir(parents=True)

    if file:
        try:
            # 保存文件，强制命名为 background.jpg 以便覆盖旧图
            filename = 'background.jpg'
            save_path = user_img_folder / filename

            # file.save 接受 Path 对象或字符串
            file.save(save_path)

            return jsonify({
                'message': 'Background updated',
                'filepath': str(save_path)
            }), 200
        except Exception as e:
            print(f"Error saving background: {e}")
            return jsonify({'error': str(e)}), 500


@inf_bp.route('/get-background', methods=['GET'])
def get_background():
    """
    获取背景图逻辑：
    1. 定义全局默认背景 (User_file/background.jpg)
    2. 如果用户已登录，尝试找 (User_file/username/img/background.jpg)
    3. 如果用户背景存在，返回用户背景
    4. 否则（未登录 或 用户没传过背景），返回全局默认背景
    """
    global_default_bg = dabopration.USER_file / 'background.jpg'
    target_bg = global_default_bg
    if 'user' in session:
        username = session['user']
        user_personal_bg = dabopration.USER_file / str(username) / 'img' / 'background.jpg'

        if user_personal_bg.exists():
            target_bg = user_personal_bg

    if target_bg.exists():
        return send_file(target_bg, mimetype='image/jpeg')
    else:
        system_backup = dabopration.DB_CONFIG_PATH.parent / 'person_img' / 'default_bg.jpg'
        if system_backup.exists():
             return send_file(system_backup, mimetype='image/jpeg')
        else:
             return "Background Not Found", 404



@inf_bp.route('/user-info', methods=['GET', 'POST'])
def user_info_handler():
    if 'user' not in session:
        return jsonify({'success': False, 'message': '未登录'}), 401

    username = session['user']
    json_path = dabopration.USER_file / str(username) / 'extended_profile.json'

    if request.method == 'GET':
        data = dabopration.read_json_safe(json_path, default_content={})
        email_from_db = "Loading Error"

        conn = dabopration.get_db_connection()
        cursor = conn.cursor()
        try:

            cursor.execute("SELECT email FROM users WHERE name = %s", (username,))
            result = cursor.fetchone()
            if result:
                email_from_db = result[0]
        except Exception as e:
            print(f"Error fetching email: {e}")
        finally:
            cursor.close()
            conn.close()
        return jsonify({
            'success': True,
            'data': {
                'nickname': data.get('nickname', username),
                'motto': data.get('MOTTO', '这个人很懒，什么都没有写'),
                'role': data.get('Role', 'User'),
                'backgroundColor': data.get('backgroundColor', 'rgba(0, 0, 0, 0.5)'),
                'email': email_from_db
            }
        })

    # --- POST: 更新信息 (支持更新单个或多个) ---
    if request.method == 'POST':
        req_data = request.json
        current_data = dabopration.read_json_safe(json_path, default_content={})

        updated_fields = []
        if 'nickname' in req_data:
            current_data['nickname'] = req_data['nickname']
            updated_fields.append('nickname')
        if 'motto' in req_data:
            current_data['MOTTO'] = req_data['motto']
            updated_fields.append('MOTTO')

        if 'role' in req_data:
            current_data['Role'] = req_data['role']
            updated_fields.append('Role')

        if 'backgroundColor' in req_data:
            current_data['backgroundColor'] = req_data['backgroundColor']
            updated_fields.append('backgroundColor')

        if not updated_fields:
            return jsonify({'success': False, 'message': '未收到有效更新字段'}), 400

        if dabopration.write_json_safe(json_path, current_data):
            return jsonify({
                'success': True,
                'message': f'成功更新: {", ".join(updated_fields)}',
                'data': {
                    'motto': current_data.get('MOTTO'),
                    'role': current_data.get('Role'),
                    'backgroundColor': current_data.get('backgroundColor')
                }
            })
        else:
            return jsonify({'success': False, 'message': '保存失败'}), 500
