from flask import Blueprint, json, jsonify, request, session
from . import dabopration
from passlib.context import CryptContext
import os

auth_bp = Blueprint('auth', __name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def json_init():
    default_data = {
        "file_num": "0",
        "max_index": "0",
    }
    return default_data

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data['name']
    email = data['email']
    password = data['password']

    # 【关键修改点】: 获取独立连接，而不是用全局 cursor
    conn = dabopration.get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. 检查冲突
        select_query = "SELECT name, email FROM users WHERE name = %s OR email = %s"
        cursor.execute(select_query, (name, email))
        existing_user = cursor.fetchone()

        if existing_user:
            conflicting_field = "Name" if existing_user[0] == name else "Email"
            return jsonify({
                'success': False,
                'message': 'Conflict',
                'conflict_field': conflicting_field,
                'conflict_value': name if conflicting_field == "Name" else email
            })
        else:
            # 2. 加密并插入
            hashed_password = pwd_context.hash(password)
            insert_query = "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)"
            cursor.execute(insert_query, (name, email, hashed_password))
            conn.commit()

            print(f"User created: {name}")

            # 3. Session设置
            session['user'] = name
            response = jsonify({'success': True, 'message': 'Signup successful'})
            response.set_cookie('username', name, max_age=360000, httponly=True)

            # 4. 初始化文件结构 (完全兼容新的 admin 功能)
            user_folder = dabopration.USER_file / name
            if not user_folder.exists():
                user_folder.mkdir(parents=True)

            # 写入基础 json
            user_json_path = user_folder / 'user.json'
            if not user_json_path.exists():
                dabopration.write_json_safe(user_json_path, json_init())

            # 写入文章 json
            dabopration.write_json_safe(user_folder / 'article.json', {'name': name})

            # 写入扩展数据 json (这就是 Admin 面板读取的文件)
            # 我们给一个默认空的 json 即可，管理员后续可以追加字段
            dabopration.write_json_safe(user_folder / 'extended_profile.json', {})

            # 复制头像
            img_folder = user_folder / 'img'
            if not img_folder.exists():
                img_folder.mkdir(parents=True)

            try:
                dabopration.copy_file(
                    dabopration.project_root.parent / 'person_img' / 'none.jpg',
                    img_folder / 'person.jpg'
                )
            except:
                pass # 防止图片不存在报错

            # 创建文章目录
            article_folder = user_folder / 'article'
            if not article_folder.exists():
                article_folder.mkdir(parents=True)

            return response

    except Exception as e:
        print(f"Signup Error: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    conn = dabopration.get_db_connection()
    cursor = conn.cursor()

    try:
        select_query = "SELECT name, password FROM users WHERE email = %s"
        cursor.execute(select_query, (email,))
        user_record = cursor.fetchone()

        if user_record:
            username = user_record[0]
            stored_hashed_password = user_record[1]

            # 验证密码
            if pwd_context.verify(password, stored_hashed_password):
                session['user'] = username
                session.permanent = True
                response = jsonify({'success': True, 'username': username})
                response.set_cookie('username', username, max_age=360000, httponly=True)
                return response

        return jsonify({'success': False, 'message': 'Invalid email or password'})

    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({'success': False, 'message': 'Server Error'}), 500
    finally:
        cursor.close()
        conn.close()
