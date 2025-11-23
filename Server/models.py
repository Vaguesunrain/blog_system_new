from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# 关联表：文章和标签的多对多关系
article_tags = db.Table('article_tags',
    db.Column('article_id', db.Integer, db.ForeignKey('article.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False) # 对应 session['user']
    title = db.Column(db.String(200), nullable=False)
    content_md = db.Column(db.Text, nullable=True)     # Markdown 原始内容
    status = db.Column(db.String(20), default='draft') # 'draft' 或 'published'
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    views = db.Column(db.Integer, default=0)

    # 关系
    tags = db.relationship('Tag', secondary=article_tags, backref=db.backref('articles', lazy='dynamic'))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content_md,
            'status': self.status,
            'date': self.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'views': self.views,
            'author': self.user_id,
            'tags': [tag.name for tag in self.tags]
        }
    def to_summary_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            # 'content': self.content_md, <--- 列表中去掉这一行！大幅瘦身
            'preview': self.content_md[:100] + '...' if self.content_md else '', # 可选：只截取前100字做预览
            'status': self.status,
            'date': self.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'views': self.views,
            'author': self.user_id,
            'tags': [tag.name for tag in self.tags]
        }
class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
