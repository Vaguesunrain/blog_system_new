import os
from flask import Blueprint, jsonify, make_response, request, session,send_file
from  blueprint import dabopration
inf_bp = Blueprint('information', __name__)

@inf_bp.route('/user', methods=['GET'])
def get_user():
    if 'user' in session:
        return jsonify({'loggedIn': True, 'username': session['user']})
    else:
        return jsonify({'loggedIn': False})

@inf_bp.route('/logout', methods=['POST'])
def logout():
    # Clear session
    session.pop('user', None)

    response = make_response(jsonify({'success': True}))
    # Delete the cookie by setting an expiration date in the past
    response.set_cookie('username', '', expires=0, httponly=True, secure=True)

    return response

@inf_bp.route('/get-photo',methods=['GET'])
def get_photo():
    username = session['user']
    user_folder = dabopration.USER_file / str(username) /'img'
    default_image = os.path.join(dabopration.DB_CONFIG_PATH.parent / 'person_img' , 'none.jpg')

    user_image = os.path.join(user_folder, "person.jpg")

    if os.path.exists(user_image):
        print("found")
        return send_file(user_image, mimetype='image/jpeg')
    else:
        print("not found")
        return send_file(default_image, mimetype='image/jpeg')

@inf_bp.route('/push-photo', methods=['POST'])
def upload_photo():
    if 'avatar' not in request.files:
        return jsonify({'error': '请求中未找到名为 "avatar" 的文件部分'}), 400
    file = request.files['avatar']

    if file.filename == '':
        return jsonify({'error': '未选择任何文件'}), 400

    username = session['user']
    user_folder = dabopration.USER_file / str(username) /'img'
    # c. 如果文件存在，则进行保存
    if file:
        try:
            # 定义保存的文件名和完整路径
            filename = 'person.jpg'
            save_path = os.path.join(user_folder, filename)

            # 保存文件到指定路径，如果文件已存在，它将被覆盖
            file.save(save_path)

            # d. 返回成功的 JSON 响应和 200 状态码 (OK)
            print(f"图片已成功保存至: {save_path}")
            return jsonify({
                'message': '图片上传成功并已保存',
                'filepath': save_path
            }), 200

        except Exception as e:
            print(f"文件保存时出错: {e}")
            # 如果保存过程中出现任何异常，返回服务器错误信息
            return jsonify({'error': f'服务器内部错误: {str(e)}'}), 500
