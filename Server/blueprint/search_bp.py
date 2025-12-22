import os
from flask import Blueprint, request, jsonify, send_file, current_app
from blueprint import dabopration
from models import db, Article, BlogUser, Photo

search_bp = Blueprint('search_bp', __name__)

# --- 1. 核心搜索接口 ---
@search_bp.route('/search', methods=['GET'])
def search_global():
    search_type = request.args.get('type', 'title') # 'title' or 'author'
    query = request.args.get('q', '').strip()
    offset = request.args.get('offset', 0, type=int)
    limit = 10

    if not query:
        return jsonify({'status': 'error', 'message': 'Query empty'}), 400

    # ==========================
    # 模式 A: 搜索文章标题
    # ==========================
    if search_type == 'title':
        # 1. 数据库模糊查询 (仅限已发布文章)
        # ilike 是不区分大小写的匹配
        articles_query = Article.query.filter(Article.title.ilike(f'%{query}%'))\
                                      .filter_by(status='published')\
                                      .order_by(Article.created_at.desc())

        # 2. 分页处理
        total = articles_query.count()
        articles = articles_query.offset(offset).limit(limit).all()

        # 3. 返回摘要数据
        return jsonify({
            'status': 'success',
            'type': 'title',
            'results': [a.to_summary_dict() for a in articles],
            'has_more': (offset + limit) < total
        })

    # ==========================
    # 模式 B: 搜索作者
    # ==========================

    elif search_type == 'author':
        # 1. 数据库查找用户 (匹配用户名 OR 昵称)
        users = BlogUser.query.filter(
            (BlogUser.username == query) |  # 优先全等匹配用户名
            (BlogUser.nickname == query)    # 优先全等匹配昵称
        ).all()

        # 如果全等没找到，再退化为模糊搜索 (可选)
        # if not users:
        #      users = BlogUser.query.filter(
        #         (BlogUser.username.ilike(f'%{query}%')) |
        #         (BlogUser.nickname.ilike(f'%{query}%'))
        #     ).limit(5).all() # 限制数量，防止搜 "a" 出来太多

        results = []

        # 默认主题配置 (兜底)
        default_theme = {
            'color': '#EBF0F3',
            'opacity': 60,
            'gradientStop': 50
        }

        for user in users:
            # 2. 核心逻辑：结合数据库与 JSON 文件
            # 数据库负责检索，JSON 负责提供展示细节 (motto, themeConfig)
            username = user.username
            json_path = dabopration.USER_file / str(username) / 'extended_profile.json'

            # 安全读取 JSON，如果文件不存在返回空字典
            profile_data = dabopration.read_json_safe(json_path, default_content={})

            # 3. 获取邮箱 (优先用数据库里的，没有则用 JSON 里的占位)

            user_email = profile_data.get('email', 'Hidden')

            # 4. 构建返回对象
            results.append({
                'username': username,  # 这是唯一标识 ID
                'name': profile_data.get('nickname', user.nickname or username), # 优先用 JSON 里的最新昵称
                'role': profile_data.get('Role', 'User'),
                'motto': profile_data.get('MOTTO', 'No motto yet.'),
                'email': user_email,
                'themeConfig': profile_data.get('themeConfig', default_theme) # 关键：用于前端渲染卡片背景色
            })

        return jsonify({
            'status': 'success',
            'type': 'author',
            'results': results,
            'has_more': False # 作者通常不会很多，不做分页
        })

    return jsonify({'status': 'error', 'message': 'Invalid search type'}), 400


# --- 2. 获取特定作者的背景图 (公开接口) ---
# 前端 SearchResult 卡片需要加载这个
@search_bp.route('/author-background/<username>')
def get_public_author_background(username):
    try:
        # 构造路径：USER_file/username/img/background.jpg
        target_bg = dabopration.USER_file / str(username) / 'img' / 'background.jpg'

        if target_bg.exists():
            return send_file(target_bg, mimetype='image/jpeg')

    except Exception as e:
        print(f"Error fetching public bg: {e}")

    # 失败则返回系统默认图
    system_backup = dabopration.DB_CONFIG_PATH.parent / 'person_img' / 'default_bg.jpg'
    return send_file(system_backup, mimetype='image/jpeg')


# --- 3. 公开作者空间 - 获取文章列表 (只读) ---
# 用于点击作者卡片后跳转的页面
@search_bp.route('/public-author/<username>/articles')
def get_public_articles(username):
    limit = request.args.get('limit', 16, type=int)
    offset = request.args.get('offset', 0, type=int)

    # 强制只查 published
    query = Article.query.filter_by(user_id=username, status='published').order_by(Article.created_at.desc())

    total = query.count()
    articles = query.offset(offset).limit(limit).all()

    return jsonify({
        'status': 'success',
        'articles': [a.to_summary_dict() for a in articles],
        'has_more': (offset + limit) < total
    })


# --- 4. 公开作者空间 - 获取图片列表 (只读) ---
@search_bp.route('/public-author/<username>/photos')
def get_public_photos(username):
    limit = request.args.get('limit', 16, type=int)
    offset = request.args.get('offset', 0, type=int)

    # 查询该用户所有图片
    query = Photo.query.filter_by(user_id=username).order_by(Photo.uploaded_at.desc())

    total = query.count()
    photos = query.offset(offset).limit(limit).all()

    return jsonify({
        'status': 'success',
        'photos': [p.to_dict() for p in photos],
        'has_more': (offset + limit) < total
    })
