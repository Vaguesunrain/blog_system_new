import json
import os
from flask import Flask, make_response, request, jsonify, send_file, session
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'your-secret-key'  # 用于会话加密

# MySQL连接配置
db_config = {
    'host': '127.0.0.1',
    'user': '',
    'password': '',
    'database': ''
}

# 连接到MySQL数据库
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# 存储 JSON 文件的目录
JSON_FOLDER = 'json_files'
if not os.path.exists(JSON_FOLDER):
    os.makedirs(JSON_FOLDER)

# 保存卡片数据到 JSON 文件
def save_cards_to_json(cards_data):
    json_file = os.path.join(JSON_FOLDER, 'cards_data.json')
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(cards_data, f, ensure_ascii=False, indent=4)






@app.route('/user', methods=['GET'])
def get_user():
    if 'user' in session:
        return jsonify({'loggedIn': True, 'username': session['user']})
    else:
        return jsonify({'loggedIn': False})
    
@app.route('/logout', methods=['POST'])
def logout():
    # Clear session
    session.pop('user', None)
    
    response = make_response(jsonify({'success': True}))
    # Delete the cookie by setting an expiration date in the past
    response.set_cookie('username', '', expires=0, httponly=True, secure=True)
    
    return response



@app.route('/save-cards', methods=['POST'])
def save_cards():
    cards_data = request.json  # 获取发送过来的 JSON 数据
    # 在这里处理保存卡片数据到数据库或文件等操作
    save_cards_to_json(cards_data)  # 保存卡片数据到 JSON 文件
    return jsonify({'message': '卡片数据已保存'}), 200

@app.route('/get-photo',methods=['GET'])
def get_photo():
    user_folder = '../person_img'
    default_image = os.path.join(user_folder, 'none.jpg')

    user_image = os.path.join(user_folder, f"{session['user']}.jpg")
        
    if os.path.exists(user_image):
        print("found")
        return send_file(user_image, mimetype='image/jpeg')
    else:
        print("not found")
        return send_file(default_image, mimetype='image/jpeg')



if __name__ == '__main__':
    context = ('/home/ame/cert.pem', '/home/ame/key.pem')  # Replace with your actual certificate and key filenames
    app.run(debug=True, ssl_context=context)
