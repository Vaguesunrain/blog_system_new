from flask import Blueprint, request, jsonify, session
import models

# 然后通过 models. 访问其中的内容
db = models.db
Article = models.Article
Tag = models.Tag
from sqlalchemy.orm.exc import NoResultFound

mdfile_bp = Blueprint('mdfile', __name__)

@mdfile_bp.route('/save', methods=['POST'])
def save_article():
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': '未登录'}), 401

    data = request.get_json()
    user_name = session['user']

    # 获取前端数据
    article_id = data.get('id') # 如果是修改，会有 ID
    title = data.get('title')
    markdown = data.get('markdown')
    tags_list = data.get('tags', [])
    status = data.get('status', 'draft') # published 或 draft

    if not title:
        return jsonify({'status': 'error', 'message': '标题不能为空'}), 400

    try:
        # --- 1. 查找或新建文章 ---
        if article_id:
            article = Article.query.filter_by(id=article_id, user_id=user_name).first()
            if not article:
                return jsonify({'status': 'error', 'message': '文章不存在或无权修改'}), 404
        else:
            article = Article(user_id=user_name)
            db.session.add(article)

        # --- 2. 更新基础信息 ---
        article.title = title
        article.content_md = markdown
        article.status = status

        # --- 3. 处理标签 (核心逻辑：自动去重、自动创建) ---
        # 先清空当前文章的标签关联
        article.tags = []
        for tag_name in tags_list:
            tag_name = tag_name.strip()
            if not tag_name: continue

            # 查找标签是否存在，不存在则创建
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)

            article.tags.append(tag)

        # --- 4. 提交事务 ---
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': '保存成功',
            'id': article.id,
            'redirect': False
        })

    except Exception as e:
        db.session.rollback()
        print(f"Save Error: {e}")
        return jsonify({'status': 'error', 'message': '服务器保存失败'}), 500

@mdfile_bp.route('/get-article/<int:article_id>', methods=['GET'])
def get_article(article_id):
    # 允许未登录用户查看已发布的，或者作者查看自己的草稿
    article = Article.query.get(article_id)

    if not article:
        return jsonify({'status': 'error', 'message': '文章未找到'}), 404


    return jsonify({
        'status': 'success',
        'article': article.to_dict()
    })

@mdfile_bp.route('/get-articles-list', methods=['GET'])
def get_articles_list():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('limit', 6, type=int)

    # 分页查询
    pagination = Article.query.filter_by(status='published').order_by(Article.updated_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    articles_data = [a.to_dict() for a in pagination.items]

    return jsonify({
        'articles': articles_data,
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    })



@mdfile_bp.route('/get-all-public-articles', methods=['GET'])
def get_all_public_articles():
    try:
        # 查询所有状态为 'published' 的文章，按时间倒序
        articles = Article.query.filter_by(status='published')\
                                .order_by(Article.updated_at.desc())\
                                .all()

        # 转换为字典
        articles_data = [a.to_summary_dict() for a in articles]
        return jsonify({
            'status': 'success',
            'articles': articles_data
        })
    except Exception as e:
        print(f"Error fetching articles: {e}")
        return jsonify({'status': 'error', 'message': 'Failed to fetch list'}), 500


@mdfile_bp.route('/read-article/<int:article_id>', methods=['GET'])
def read_article(article_id):
    try:
        article = Article.query.get(article_id)
        if not article:
            return jsonify({'status': 'error', 'message': 'DATA_NOT_FOUND'}), 404

        #  阅读数自增 (原子操作)
        article.views += 1
        db.session.commit()


        return jsonify({
            'status': 'success',
            'article': article.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        print(f"Read Error: {e}")
        return jsonify({'status': 'error', 'message': 'SYSTEM_FAILURE'}), 500
