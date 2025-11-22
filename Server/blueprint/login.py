from flask import Blueprint, json, jsonify, request, session
from . import  dabopration
from passlib.context import CryptContext
auth_bp = Blueprint('auth', __name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def json_init():
    # Initialize the JSON file with default values ,which is used for recording user acticles
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
    password = data['password'] # 这是用户的原始密码

    # 查询是否存在冲突的记录
    select_query = "SELECT name, email FROM users WHERE name = %s OR email = %s"
    dabopration.cursor.execute(select_query, (name, email))
    existing_user = dabopration.cursor.fetchone()

    if existing_user:
        # ... (这部分冲突检查逻辑无需改动)
        conflicting_field = ""
        if existing_user[0] == name:
            conflicting_field = "Name"
        elif existing_user[1] == email:
            conflicting_field = "Email"
        print(f"Conflict: Name - {name}, Email - {email}")
        return jsonify({
            'success':False,
            'message': 'Conflict',
            'conflict_field': conflicting_field,
            'conflict_value': name if conflicting_field == "Name" else email
        })
    else:
        # 3. 哈希密码，而不是存储原始密码
        hashed_password = pwd_context.hash(password)

        # 4. 将哈希后的密码存入数据库
        # 注意：现在我们插入的是 hashed_password，而不是 password
        insert_query = "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)"
        # 确保你的数据库 `password` 字段足够长来存储哈希值, 推荐 VARCHAR(255)
        insert_values = (name, email, hashed_password)
        dabopration.cursor.execute(insert_query, insert_values)
        dabopration.conn.commit()

        # 打印日志时不应该打印原始密码
        print(f"User created: Name - {name}, Email - {email}")

        # ... (后续的 session, cookie 和文件创建逻辑无需改动)
        session['user'] = name
        response = jsonify({'success':True, 'message': 'Signup successful'})
        response.set_cookie('username', name, max_age=360000, expires=True, httponly=True, secure=False)

        user_folder = dabopration.USER_file / name
        if not user_folder.exists():
            user_folder.mkdir(parents=True)
        json_file_path = user_folder / 'user.json'
        if not json_file_path.exists():
            with open(json_file_path, 'w', encoding='utf-8') as json_file:
                json.dump(json_init(), json_file, ensure_ascii=False, indent=4)
        empty_data = {'name':name}
        with open(user_folder / 'article.json', 'w', encoding='utf-8') as f:
            json.dump(empty_data, f)
        user_folder = user_folder / 'img'
        if not user_folder.exists():
            user_folder.mkdir(parents=True)
        dabopration.copy_file(dabopration.project_root.parent /'person_img' / 'none.jpg', user_folder / 'person.jpg')
        user_folder = user_folder.parent / 'article'
        if not user_folder.exists():
            user_folder.mkdir(parents=True)
        return response


# --- 修改 login 函数 ---
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password'] # 这是用户提交的原始密码

    # 5. 修改查询逻辑：只根据 email 查询用户，取出其哈希密码
    select_query = "SELECT name, password FROM users WHERE email = %s"
    dabopration.cursor.execute(select_query, (email,))
    user_record = dabopration.cursor.fetchone()

    # 6. 验证密码
    # 首先检查用户是否存在，然后用 pwd_context.verify 比较原始密码和哈希值
    if user_record:
        username = user_record[0]
        stored_hashed_password = user_record[1]

        if pwd_context.verify(password, stored_hashed_password):
            # 密码正确
            session['user'] = username
            session.permanent = True
            response = jsonify({'success': True, 'username': username})
            response.set_cookie('username', username, max_age=360000, expires=True, httponly=True, secure=False)
            return response

    # 如果用户不存在或密码不匹配，都返回认证失败
    return jsonify({'success': False, 'message': 'Invalid email or password'})
