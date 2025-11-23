from flask import Blueprint, jsonify, request
from . import dabopration
from passlib.context import CryptContext
import shutil

admin_bp = Blueprint('admin_bp', __name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_json_path(username):
    return dabopration.USER_file / str(username) / 'extended_profile.json'


@admin_bp.route('/admin/get-table', methods=['GET'])
def get_table_data():
    conn = dabopration.get_db_connection()
    cursor = conn.cursor(dictionary=True) # 让查询结果变成字典形式

    try:
        cursor.execute("SELECT * FROM users")
        mysql_users = cursor.fetchall()

        final_list = []
        all_keys = set(['id', 'name', 'email', 'password']) # 记录所有出现的列名

        for user in mysql_users:
            username = user['name']
            json_path = get_json_path(username)

            extra_data = dabopration.read_json_safe(json_path, default_content={})

            for k in extra_data.keys():
                all_keys.add(k)

            combined_user = {**user, **extra_data}
            final_list.append(combined_user)

        for u in final_list:
            u['password'] = u['password'][:15] + "..." if u['password'] else ""

        return jsonify({
            'success': True,
            'columns': list(all_keys), # 发送给前端用于生成表头
            'rows': final_list
        })

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@admin_bp.route('/admin/save-row', methods=['POST'])
def save_row():
    """
    前端发来一行完整数据，后端负责拆分：
    - name, email, password -> 存 MySQL
    - 其他字段 -> 存 JSON
    """
    data = request.json
    user_id = data.get('id')
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not user_id:
        return jsonify({'success': False, 'message': 'ID和Name不能为空'}), 400

    conn = dabopration.get_db_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("SELECT password FROM users WHERE id = %s", (user_id,))
        res = cursor.fetchone()
        if res:
            db_password = res[0]
            final_password = db_password
            if password and "..." not in password:
                final_password = pwd_context.hash(password)

            update_sql = "UPDATE users SET email=%s, password=%s WHERE id=%s"
            cursor.execute(update_sql, (email, final_password, user_id))
            conn.commit()

        json_path = get_json_path(name)

        # 从提交的数据中剔除 MySQL 固有字段，剩下的就是 JSON 字段
        json_data_to_save = {}
        exclude_keys = ['id', 'name', 'email', 'password']

        for k, v in data.items():
            if k not in exclude_keys:
                json_data_to_save[k] = v

        dabopration.write_json_safe(json_path, json_data_to_save)

        return jsonify({'success': True, 'message': '保存成功'})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@admin_bp.route('/admin/delete-row', methods=['POST'])
def delete_row():
    data = request.json
    user_id = data.get('id')
    name = data.get('name')

    conn = dabopration.get_db_connection()
    cursor = conn.cursor()

    try:
        # 1. 删除 MySQL 数据
        cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.commit()

        # 2. 删除文件目录
        user_folder = dabopration.USER_file / str(name)
        if user_folder.exists():
            shutil.rmtree(user_folder)

        return jsonify({'success': True, 'message': '用户已彻底删除'})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()


@admin_bp.route('/admin/add-column', methods=['POST'])
def add_column():
    """
    全员追加一个新属性（相当于 Excel 增加一列）
    """
    new_key = request.json.get('key')
    default_val = request.json.get('value', "")

    if not new_key:
        return jsonify({'success': False, 'message': '列名不能为空'}), 400

    if dabopration.USER_file.exists():
        for user_dir in dabopration.USER_file.iterdir():
            if user_dir.is_dir():
                json_path = user_dir / 'extended_profile.json'
                data = dabopration.read_json_safe(json_path, {})

                if new_key not in data:
                    data[new_key] = default_val
                    dabopration.write_json_safe(json_path, data)

    return jsonify({'success': True, 'message': f'列 [{new_key}] 已追加到所有用户'})


@admin_bp.route('/admin/delete-column', methods=['POST'])
def delete_column_globally():
    """
    全员删除一个扩展属性
    注意：这是高危操作，会从所有用户的 extended_profile.json 中移除该字段
    """
    key_to_delete = request.json.get('key')

    if not key_to_delete:
        return jsonify({'success': False, 'message': 'Key不能为空'}), 400


    protected_keys = ['id', 'name', 'email', 'password']
    if key_to_delete in protected_keys:
        return jsonify({'success': False, 'message': f'禁止删除核心数据库字段 [{key_to_delete}]'}), 403

    count = 0

    if dabopration.USER_file.exists():
        for user_dir in dabopration.USER_file.iterdir():
            if user_dir.is_dir():
                json_path = user_dir / 'extended_profile.json'

                data = dabopration.read_json_safe(json_path, {})
                if key_to_delete in data:
                    del data[key_to_delete]
                    dabopration.write_json_safe(json_path, data)
                    count += 1

    return jsonify({
        'success': True,
        'message': f'已从 {count} 个用户中移除属性 [{key_to_delete}]，表格列已销毁。'
    })
