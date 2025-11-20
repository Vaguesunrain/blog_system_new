from pathlib import Path
import mysql.connector
import json


current_script_path = Path(__file__).resolve()
    # 获取脚本所在的目录 (blueprint/)
script_dir = current_script_path.parent

project_root = script_dir.parent# 获取项目根目录 (blueprint/ 的父目录: Server 目录)
    # 构建 db_config.json 的完整路径
DB_CONFIG_PATH = project_root / 'db_config.json'


USER_file = project_root.parent.parent/'User_file'   #Blog system的父目录
if not USER_file.exists():
    USER_file.mkdir(parents=True)  # Create the directory if it doesn't exist

def copy_file(src, dest):
    """复制文件"""
    with open(src, 'rb') as fsrc:
        with open(dest, 'wb') as fdst:
            fdst.write(fsrc.read())




# 从json文件获取MySQL连接配置
def get_db_config():
    with open(DB_CONFIG_PATH, 'r') as f:
        return json.load(f)
# MySQL连接配置
db_config = get_db_config()

# 连接到MySQL数据库
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

