import os
from pathlib import Path
import re
from flask import Flask, json, make_response, request, redirect,  jsonify, send_from_directory,Blueprint,session
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from datetime import datetime
from flask_cors import CORS # 1. Import Flask-CORS
from werkzeug.utils import secure_filename
from . import dabopration
from . import jsonoperation
mdfile_bp = Blueprint('mdfile', __name__)


MARKDOWN_FOLDER = 'saved_files' # Directory to save markdown files
PAGE_SIZE = 6

# --- Create Flask App ---
app = Flask(__name__)
CORS(app,supports_credentials=True) # 2. Enable CORS for the entire app (allows all origins by default)


def  sanitiza_filename2(user_directory_path, format):

    user_config_path = os.path.join(user_directory_path, 'user.json')
    print(user_directory_path)
    print(user_config_path)
    with open(user_config_path, 'r') as f:
        user_config = json.load(f)
    # file_num is the number of files, max_index is the last file index
    if user_config['max_index'] == '0':
        # 直接返回默认文件名
        name = '1'+ '.'+format
    else:
        # 否则，返回 max_index + 1
        name = str(int(user_config['max_index'])+1) + '.'+format
    print(name)
    user_config['file_num'] = str(int(user_config['file_num']) + 1)
    user_config['max_index'] = str(int(user_config['max_index']) + 1)
    with open(user_config_path, 'w', encoding='utf-8') as f:
        json.dump(user_config, f, ensure_ascii=False, indent=4)
    return name

def update_label_classification(user_name: str, article_index: str, old_labels: list, new_labels: list):
    """
    更新 lableClass.json 文件。
    比较新旧标签列表，将文章索引添加到新标签中，并从旧标签中移除。
    """
    label_class_path = dabopration.USER_file / 'lableClass.json'
    unique_article_ref = f"{user_name}{article_index}"

    label_data = {}
    if label_class_path.exists() and label_class_path.stat().st_size > 0:
        try:
            loaded_data = json.loads(label_class_path.read_text(encoding='utf-8'))
            if isinstance(loaded_data, dict):
                label_data = loaded_data
            else:
                print(f"[WARNING] 'lableClass.json' 的根格式不是对象(字典)，而是 {type(loaded_data)}。将重置为空字典处理。")
        except json.JSONDecodeError:
            print(f"[WARNING] 'lableClass.json' 文件解析失败。将重置为空字典处理。")

    old_set = set(old_labels)
    new_set = set(new_labels)

    labels_to_add = new_set - old_set
    labels_to_remove = old_set - new_set

    for label in labels_to_add:
        if label not in label_data:
            label_data[label] = []

        if unique_article_ref not in label_data[label]:
            label_data[label].append(unique_article_ref)
        print(f"    [+] 添加文章 '{unique_article_ref}' 到标签 '{label}'")

    for label in labels_to_remove:
        if label in label_data and unique_article_ref in label_data[label]:
            label_data[label].remove(unique_article_ref)
            print(f"    [-] 从标签 '{label}' 移除文章 '{unique_article_ref}'")
            if not label_data[label]:
                del label_data[label]
                print(f"    [*] 标签 '{label}' 已空，将其移除")

    label_class_path.write_text(json.dumps(label_data, ensure_ascii=False, indent=4), encoding='utf-8')
    print(f"[*] 'lableClass.json' 更新完毕。")

@mdfile_bp.route('/save', methods=['POST'])
def save_content():
    """
    根据前端发送的 'mode' 参数，处理新建('new')或修改('fix')文章的请求。
    新增了对文章标签的处理。
    """
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

    user_name = session['user']
    user_folder = dabopration.USER_file / user_name
    article_dir_path = user_folder / 'article'
    article_json_path = user_folder / 'article.json'

    mode = request.form.get('mode')
    article_id = request.form.get('id')
    md_content = request.form.get('md_content')
    html_content = request.form.get('html_content')
    filename_base_from_client = request.form.get('filename_base')
    image_urls = request.form.getlist('images[]') or request.form.getlist('images')
    labels = request.form.getlist('labels[]') or request.form.getlist('labels')

    print(f"收到保存请求: mode='{mode}', id='{article_id}', title='{filename_base_from_client}', labels={labels}")

    if not all([md_content, filename_base_from_client, mode]):
        return jsonify({'status': 'error', 'message': 'Missing required data (md_content, filename_base, or mode).'}), 400

    try:
        # 确保目录存在
        article_dir_path.mkdir(parents=True, exist_ok=True)
        final_file_index = None

        if mode == 'new':
            print("[*] 执行新建 (new) 逻辑...")
            temp_unique_filename = sanitiza_filename2(user_folder, 'md')
            final_file_index = Path(temp_unique_filename).stem

            # 更新 article.json
            try:
                data = json.loads(article_json_path.read_text(encoding='utf-8')) if article_json_path.exists() else []
            except json.JSONDecodeError:
                data = []

            new_entry = {
                'filename': filename_base_from_client,
                'index': final_file_index,
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'image_urls': image_urls,
                'views': 0,
                'content': md_content[:30],
                'labels': labels  # 新增：保存标签
            }
            data.append(new_entry)
            article_json_path.write_text(json.dumps(data, ensure_ascii=False, indent=4), encoding='utf-8')

            # 更新 lableClass.json
            update_label_classification(user_name, final_file_index, old_labels=[], new_labels=labels)

            # 为新文章在 viewTimes.json 中创建条目
            jsonoperation.insert_entry(dabopration.USER_file / 'viewTimes.json', user_name + final_file_index, 0)

        elif mode == 'fix':
            print(f"[*] 执行修改 (fix) 逻辑, 目标 ID: {article_id}")
            if not article_id:
                return jsonify({'status': 'error', 'message': 'Missing article ID for fix mode.'}), 400

            final_file_index = article_id
            if not article_json_path.exists():
                return jsonify({'status': 'error', 'message': f'Article data file not found for user {user_name}.'}), 404

            data = json.loads(article_json_path.read_text(encoding='utf-8'))

            # 查找并更新指定条目
            article_found = False
            old_labels = [] # 初始化旧标签列表
            for article in data:
                if str(article.get('index')) == str(final_file_index):
                    # 在更新前，获取旧的标签
                    old_labels = article.get('labels', [])

                    # 更新文章元数据
                    article['filename'] = filename_base_from_client
                    article['date'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    article['image_urls'] = image_urls
                    article['content'] = md_content[:30]
                    article['labels'] = labels  # 更新为新的标签列表
                    article_found = True
                    break

            if not article_found:
                return jsonify({'status': 'error', 'message': f'Article with ID {final_file_index} not found.'}), 404

            # 将更新后的数据写回 article.json
            article_json_path.write_text(json.dumps(data, ensure_ascii=False, indent=4), encoding='utf-8')

            # 根据新旧标签列表更新 lableClass.json
            update_label_classification(user_name, final_file_index, old_labels=old_labels, new_labels=labels)

        else:
            return jsonify({'status': 'error', 'message': f"Invalid mode '{mode}' provided."}), 400


        md_filename = f"{final_file_index}.md"
        html_filename = f"{final_file_index}.html"
        md_filepath = article_dir_path / md_filename
        html_filepath = article_dir_path / html_filename

        # print(f"[*] User '{user_name}' saving MD to: {md_filepath}")
        md_filepath.write_text(md_content, encoding='utf-8')

        # print(f"[*] User '{user_name}' saving HTML to: {html_filepath}")
        html_filepath.write_text(html_content, encoding='utf-8')

        # 更新 recently.json
        if not image_urls:
            image_urls = ['http://vagueame.top/sources/nebula.avif']

        jsonoperation.update_recently_queue_by_time(dabopration.USER_file / 'recently.json', {
            'index': final_file_index,
            'user': user_name,
            'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'title': filename_base_from_client,
            'content': md_content[:30],
            'image_urls': image_urls[0]
        })

        print(f"[SUCCESS] Files saved for user '{user_name}'")
        return jsonify({
            'status': 'success',
            'message': '文件已成功保存。',
            'md_filepath': str(md_filepath)
        }), 200

    except Exception as e:
        print(f"[ERROR] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'status': 'error', 'message': f'发生意外的服务器错误。'}), 500


@mdfile_bp.route('/get-markdown/<filename>',methods=['GET'])
def server_markdown(filename):
    """
    获取指定文章的 Markdown 内容和其关联的标签。
    返回一个包含 markdown_content 和 labels 的 JSON 对象。
    """
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

    try:
        user_name = session['user']
        user_folder = dabopration.USER_file / user_name
        article_dir_path = user_folder / 'article'
        article_json_path = user_folder / 'article.json'
        md_filepath = article_dir_path / filename

        # 1. 读取 Markdown 文件内容
        if not md_filepath.exists():
            print(f"File not found: {md_filepath}")
            return jsonify({"status": "error", "message": "Article file not found"}), 404

        md_content = md_filepath.read_text(encoding='utf-8')

        # 2. 读取 article.json 查找对应的标签
        labels = []  # 默认标签为空列表
        article_id = Path(filename).stem # 从 "uuid.md" 中获取 "uuid"

        if article_json_path.exists():
            articles_data = json.loads(article_json_path.read_text(encoding='utf-8'))
            # 遍历查找匹配的文章条目
            for article in articles_data:
                if article.get('index') == article_id:
                    # 找到文章，获取其标签，如果不存在 'labels' 键，则返回空列表
                    labels = article.get('labels', [])
                    break # 找到后即可退出循环

        # 3. 将内容和标签打包成 JSON 返回
        return jsonify({
            "status": "success",
            "markdown_content": md_content,
            "labels": labels
        }), 200

    except FileNotFoundError:
        # 这个异常现在由上面的 if not md_filepath.exists() 处理，但保留以防万一
        return jsonify({"status": "error", "message": "File or directory not found"}), 404
    except json.JSONDecodeError:
        print(f"Error decoding JSON from: {article_json_path}")
        return jsonify({"status": "error", "message": "Failed to parse article metadata"}), 500
    except Exception as e:
        print(f"An unexpected error occurred in server_markdown: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": "An unexpected server error occurred"}), 500


@mdfile_bp.route('/get-html', methods=['POST'])
def server_html():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON in request body"}), 400

    user = data.get('user')
    index = data.get('index') # 先获取 index

    # 验证 index 是否存在 (数字 0 也是有效值)
    if not user or index is None:
        return jsonify({"error": "Missing 'user' or 'index' in request body"}), 400

    # 使用 f-string 将 index 转换为字符串并拼接
    filename = f"{index}.md"

    try:
        user_folder = dabopration.USER_file / user / 'article'

        # 调试日志：确认最终路径和文件名
        # print(f"Attempting to serve file '{filename}' from directory '{user_folder}'")
        jsonoperation.increment_and_update_stats(dabopration.USER_file / 'viewTimes.json',dabopration.USER_file / 'statistic.json' ,user + str(index))
        return send_from_directory(user_folder, filename)

    except FileNotFoundError:
        error_msg = f"File not found: {filename} for user: {user}"
        print(error_msg) # 在服务器日志中打印明确的未找到信息
        return jsonify({"error": error_msg}), 404
    except Exception as e:
        # 捕获其他未知错误，并打印详细堆栈
        import traceback
        print("--- AN UNEXPECTED ERROR OCCURRED ---")
        traceback.print_exc()
        print("------------------------------------")
        error_msg = f"An unexpected error occurred: {e}"
        return jsonify({"error": "An internal server error occurred"}), 500


@mdfile_bp.route('/get-my-articles-list', methods=['GET'])
def get_my_articles():
    user_name = session['user']
    if not user_name:
        return jsonify({'status': 'error', 'message': 'Authentication required: Missing user identifier (cookie).' }), 401 # Or 400
    user_folder = dabopration.USER_file / session['user']
    json_file_path = user_folder / 'article.json'

    if not json_file_path.exists():
        return jsonify([])
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            articles_data = json.load(f)

        processed_articles = []
        for article in articles_data:
            image_url = article['image_urls'][0] if article.get('image_urls') else "http://vagueame.top/sources/nebula.avif"  # 默认图片URL
            if article.get("content", ""):
                article_content = article["content"]
            else:
                article_content = 'no content available'
            processed_article = {
                "id": article.get("index", "N/A"),
                "title": article.get("filename", "Untitled Article"),
                "date": article.get("date", "Unknown Date"),
                "views": article.get("views", 0),
                "imageUrl": image_url,
                "author": session['user'],
                "content": article_content
            }
            processed_articles.append(processed_article)

        # 返回文章数量和列表
        return jsonify(processed_articles)

    except Exception as e:
        print(f"Error processing articles: {e}")
        return jsonify({"error": "Failed to process articles"}), 500


# 2025/8/26 add used for blog manage
@mdfile_bp.route('/get-paginated-articles', methods=['GET'])
def get_paginated_articles():
    # 1. 用户身份验证
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Authentication required.'}), 401

    user_name = session['user']
    user_folder = dabopration.USER_file / user_name
    json_file_path = user_folder / 'article.json'

    if not json_file_path.exists():
        return jsonify({'articles': [], 'all_loaded': True})

    try:
        page = request.args.get('page', default=0, type=int)

        with open(json_file_path, 'r', encoding='utf-8') as f:
            all_articles_data = json.load(f)

        total_articles = len(all_articles_data)
        start_index = page * PAGE_SIZE
        end_index = start_index + PAGE_SIZE

        articles_for_page = all_articles_data[start_index:end_index]
        all_loaded = end_index >= total_articles

        processed_articles = []
        for article in articles_for_page:

            image_urls_list = article.get('image_urls')
            if image_urls_list: # 检查列表是否存在且不为空
                image_url = image_urls_list[0]
            else:
                image_url = "http://vagueame.top/sources/nebula.avif"

            article_content = article.get("content", "no content available")

            processed_article = {
                "id": article.get("index", "N/A"),
                "title": article.get("filename", "Untitled Article"),
                "date": article.get("date", "Unknown Date"),
                "views": article.get("views", 0),
                "imageUrl": image_url, # 使用修复后的 image_url
                "author": user_name,
                "content": article_content
            }
            processed_articles.append(processed_article)

        return jsonify({
            'articles': processed_articles,
            'all_loaded': all_loaded
        })

    except Exception as e:
        return jsonify({"error": "Failed to process articles"}), 500
