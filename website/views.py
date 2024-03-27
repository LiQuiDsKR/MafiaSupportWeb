from flask import Blueprint, render_template, request, flash, redirect, url_for
import sqlite3

views = Blueprint('views', __name__)

@views.route('/prob')
def prob():
    conn = sqlite3.connect('item.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM items")
    items = cursor.fetchall()
    conn.close()
    return render_template('prob.html', items=items)

@views.route('/prob_master', methods=['GET', 'POST'])
def prob_master():
    if request.method == 'POST':
        # POST 요청 처리 로직 (새로운 데이터를 저장하는 부분)
        try:
            # 기존 데이터베이스 초기화
            conn = sqlite3.connect('item.db')
            cursor = conn.cursor()
            cursor.execute("DROP TABLE IF EXISTS items")
            conn.commit()
            
            # 새로운 데이터 저장
            cursor.execute(
                '''
                create table items (id int, name text, int defaultPercentage, boolean equip)
                '''
            )
            name = request.form['name']
            defaultPercentage = request.form['defaultPercentage']
            equip = request.form['equip']
            cursor.execute("INSERT INTO items (name, defaultPercentage, equip) VALUES (?, ?, ?)", (name, defaultPercentage, equip))
            conn.commit()
            conn.close()
            
            flash('Data saved to database successfully!', category='success')
        except Exception as e:
            flash(f'Failed to save data to database! Error: {str(e)}', category='error')
        
        return redirect(url_for('views.prob_master'))

    # GET 요청 처리 로직 (데이터베이스에서 모든 아이템을 가져와서 템플릿에 전달)
    conn = sqlite3.connect('item.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM items")
    items = cursor.fetchall()
    conn.close()

    return render_template('prob_master.html', items=items)

@views.route('/add-row', methods=['POST'])
def add_row():
    if request.method == 'POST':
        try:
            conn = sqlite3.connect('item.db')
            cursor = conn.cursor()
            # 완전히 비어있는 새로운 행을 추가
            cursor.execute("INSERT INTO items (name, defaultPercentage, equip) VALUES ('', '', '')")
            conn.commit()
            conn.close()
            flash('New row added successfully!', category='success')
        except Exception as e:
            flash(f'Failed to add new row to database! Error: {str(e)}', category='error')
        
        return redirect(url_for('views.prob_master'))

@views.route('/delete-row/<int:item_id>', methods=['POST'])
def delete_row(item_id):
    if request.method == 'POST':
        try:
            conn = sqlite3.connect('item.db')
            cursor = conn.cursor()
            cursor.execute("DELETE FROM items WHERE id=?", (item_id,))
            conn.commit()
            conn.close()
            flash('Row deleted successfully!', category='success')
        except Exception as e:
            flash(f'Failed to delete row from database! Error: {str(e)}', category='error')
        
        return redirect(url_for('views.prob_master'))
@views.route('/save_to_database', methods=['POST'])
def save_to_database():
    if request.method == 'POST':
        try:
            conn = sqlite3.connect('item.db')
            cursor = conn.cursor()
            
            # 기존 데이터 삭제
            cursor.execute("DELETE FROM items")
            
            # 새로운 데이터 추가
            data = request.json
            for row in data:
                name = row['name']
                defaultPercentage = row['defaultPercentage']
                equip = row['equip']
                cursor.execute("INSERT INTO items (name, defaultPercentage, equip) VALUES (?, ?, ?)", (name, defaultPercentage, equip))
            
            conn.commit()
            conn.close()
            return "Data saved to database successfully!", 200
        except Exception as e:
            return f'Failed to save data to database! Error: {str(e)}', 500
