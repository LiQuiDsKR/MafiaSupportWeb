from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'

ADMIN_PASSWORD = 'liquid'  # 관리자 비밀번호 설정

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/randbox')
def randbox():
    return render_template('randbox.html')

@app.route('/admin-login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        password = request.form['password']
        if password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin'))
        else:
            flash('잘못된 비밀번호입니다.')
    return render_template('admin_login.html')

@app.route('/admin-logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('home'))

@app.route('/admin')
def admin():
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin.html')

@app.route('/simulator')
def simulator():
    return render_template('simulator.html')

@app.route('/get_items/<box_type>')
def get_items(box_type):
    file_path = os.path.join('data', f'Lootbox{box_type}.txt')
    items = []
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                name, chance, equip = line.strip().split(':')
                items.append({'name': name, 'chance': float(chance), 'equip': equip == 'true'})
    return jsonify(items)

@app.route('/save_items', methods=['POST'])
def save_items():
    data = request.json
    box_type = data.get('box_type')
    items = data.get('items')
    file_path = os.path.join('data', f'Lootbox{box_type}.txt')
    with open(file_path, 'w', encoding='utf-8') as file:
        for item in items:
            name = item['name']
            chance = item['chance']
            equip = 'true' if item['equip'] else 'false'
            file.write(f'{name}:{chance}:{equip}\n')
    return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True, port=80, host="0.0.0.0")
