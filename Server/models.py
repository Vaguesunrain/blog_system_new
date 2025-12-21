from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# 关联表：文章和标签的多对多关系
article_tags = db.Table('article_tags',
    db.Column('article_id', db.Integer, db.ForeignKey('article.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)


class BlogUser(db.Model):
    __tablename__ = 'blog_user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False) # 对应 session['user']
    nickname = db.Column(db.String(50)) # 昵称

    # 反向关联：这就建立了 User 和 Article 的关系
    articles = db.relationship('Article', backref='author_info', lazy=True)

class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('blog_user.username'), nullable=False)
    # user_id = db.Column(db.String(50), nullable=False) # 对应 session['user']
    title = db.Column(db.String(200), nullable=False)
    content_md = db.Column(db.Text, nullable=True)     # Markdown 原始内容
    status = db.Column(db.String(20), default='draft') # 'draft' 或 'published'
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    views = db.Column(db.Integer, default=0)
    summary = db.Column(db.String(500), nullable=True)

    # 关系
    tags = db.relationship('Tag', secondary=article_tags, backref=db.backref('articles', lazy='dynamic'))

    def to_dict(self):
        display_name = self.author_info.nickname if self.author_info and self.author_info.nickname else self.user_id
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content_md,
            'status': self.status,
            'date': self.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'views': self.views,
            'author': self.user_id,
            'author_username': self.user_id,
            'author_nickname': display_name,
            'tags': [tag.name for tag in self.tags]
        }
    def to_summary_dict(self):
        preview_text = self.summary if self.summary else (self.content_md[:150] + '...' if self.content_md else '')
        display_name = self.author_info.nickname if self.author_info and self.author_info.nickname else self.user_id
        return {
            'id': self.id,
            'title': self.title,
            # 'content': self.content_md, <--- 列表中去掉这一行！大幅瘦身
            'preview': preview_text,
            'status': self.status,
            'date': self.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'views': self.views,
            'author': self.user_id,
            'author_nickname': display_name,
            'author_username': self.user_id, # 原始用户名，用于拼头像链接
            'tags': [tag.name for tag in self.tags]
        }
    def to_dict(self):
        display_name = self.author_info.nickname if self.author_info and self.author_info.nickname else self.user_id
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content_md,
            'excerpt': self.summary,
            'status': self.status,
            'date': self.updated_at.strftime('%Y-%m-%d %H:%M:%S'),
            'views': self.views,
            'author': self.user_id,
            'author_username': self.user_id,
            'author_nickname': display_name,
            'tags': [tag.name for tag in self.tags]
        }
class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)



class Photo(db.Model):
    __tablename__ = 'photo'
    id = db.Column(db.Integer, primary_key=True)
    # 关联用户：使用的是 username (对应 session['user'])
    user_id = db.Column(db.String(50), db.ForeignKey('blog_user.username'), nullable=False)

    # 文件路径 (相对于静态资源目录的路径)
    filename = db.Column(db.String(255), nullable=False)      # 原图文件名 (e.g., 'a1b2c3.jpg')
    thumb_filename = db.Column(db.String(255), nullable=True) # 缩略图文件名 (e.g., 'a1b2c3_thumb.jpg')

    description = db.Column(db.String(500), default="Share beauty with you.")
    uploaded_at = db.Column(db.DateTime, default=datetime.now)

    # 关联关系
    author_info = db.relationship('BlogUser', backref=db.backref('photos', lazy=True))

    def to_dict(self):
        # 你的用户模型里 nickname 是可选的，所以做个 fallback
        display_name = self.author_info.nickname if self.author_info and self.author_info.nickname else self.user_id

        return {
            'id': self.id,
            'src': f"/static/uploads/photos/{self.filename}",         # 原图 URL (前端直接用)
            'thumb': f"/static/uploads/photos/{self.thumb_filename}" if self.thumb_filename else f"/static/uploads/photos/{self.filename}",
            'date': self.uploaded_at.strftime('%Y-%m-%d'),
            'full_date': self.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'desc': self.description,
            'author': display_name,
            'author_username': self.user_id # 用于头像链接等
        }
