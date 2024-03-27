from flask import Flask
import sqlite3

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'HelloGuysThisisLiQuiDsKRandThisisMyWebsiteForGameHelp'
    
    # 블루프린트 인스턴스 가져오기
    from .views import views
    from .auth import auth
    
    # 플라스크 앱에 등록하기
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')
    
    def create_table():
        conn = sqlite3.connect('item.db')
        cursor = conn.cursor()
        cursor.execute(
            '''
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY,
                name TEXT,
                defaultPercentage INTEGER,
                equip BOOLEAN
            )
            '''
        )
        conn.close()

    create_table()
    print('Database connection established and tables checked/created.')
    
    return app