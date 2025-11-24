from flask import Blueprint, jsonify, session, request
from models import db, Article

manage_bp = Blueprint('manage', __name__)

# 1. 获取当前登录用户的所有文章 (用于 Profile 和 Manage 页面)
@manage_bp.route('/my-articles-list', methods=['GET'])
def get_my_articles():
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Authentication required'}), 401

    username = session['user']
    
    try:
        articles = Article.query.filter_by(user_id=username)\
                                .order_by(Article.updated_at.desc())\
                                .all()
        
        # 使用 to_summary_dict 获取轻量级数据
        data = [a.to_summary_dict() for a in articles]
        
        return jsonify({
            'status': 'success',
            'articles': data,
            'count': len(data)
        })
    except Exception as e:
        print(f"Error fetching my articles: {e}")
        return jsonify({'status': 'error', 'message': 'Database error'}), 500

# 2. 删除文章
@manage_bp.route('/delete-article/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    if 'user' not in session:
        return jsonify({'status': 'error', 'message': 'Authentication required'}), 401

    username = session['user']

    try:
        article = Article.query.get(article_id)
        
        if not article:
            return jsonify({'status': 'error', 'message': 'Article not found'}), 404
            
        # 权限检查：只能删除自己的
        if article.user_id != username:
            return jsonify({'status': 'error', 'message': 'Permission denied'}), 403

        db.session.delete(article)
        db.session.commit()
        
        return jsonify({'status': 'success', 'message': 'Article deleted'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500