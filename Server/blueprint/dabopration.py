from pathlib import Path
import mysql.connector
import json
import os
from flask import current_app

current_script_path = Path(__file__).resolve()
script_dir = current_script_path.parent
project_root = script_dir.parent
DB_CONFIG_PATH = project_root / 'db_config.json'

USER_file = project_root.parent.parent / 'User_file'

if not USER_file.exists():
    USER_file.mkdir(parents=True)

def copy_file(src, dest):
    """复制文件"""
    try:
        with open(src, 'rb') as fsrc:
            with open(dest, 'wb') as fdst:
                fdst.write(fsrc.read())
    except FileNotFoundError:
        print(f"Error: Source file not found {src}")

def get_db_config():
    with open(DB_CONFIG_PATH, 'r') as f:
        return json.load(f)

# --- 优化点 1: 数据库连接池/按需连接 ---
def get_db_connection():
    """每次请求调用此函数获取连接，避免全局连接超时"""
    config = get_db_config()
    # 建议在 db_config.json 中添加 pool_name 等配置以启用连接池，这里使用基础连接
    conn = mysql.connector.connect(**config)
    return conn

# --- 优化点 2: 健壮的 JSON 读写工具 (实现防报错的核心) ---

def read_json_safe(file_path, default_content=None):
    """
    安全读取 JSON。如果文件不存在或损坏，返回默认值。
    """
    if default_content is None:
        default_content = {}

    if not os.path.exists(file_path):
        return default_content

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return default_content

def write_json_safe(file_path, data):
    """
    安全写入 JSON。
    """
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        return True
    except Exception as e:
        print(f"Write JSON Error: {e}")
        return False

def update_json_key(file_path, key, value):
    """更新单个键值，如果文件不存在会自动创建"""
    data = read_json_safe(file_path)
    data[key] = value
    return write_json_safe(file_path, data)
