from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
import os
import json
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')  # 관리자 비밀번호 설정

def get_client_ip():
    if request.headers.getlist("X-Forwarded-For"):
        return request.headers.getlist("X-Forwarded-For")[0]
    return request.remote_addr

def check_banned(view_func):
    @wraps(view_func)
    def decorated_function(*args, **kwargs):
        ip = ip = get_client_ip()
        banlist_file = os.path.join('user', 'banlist.json')
        
        if os.path.exists(banlist_file):
            with open(banlist_file, 'r', encoding='utf-8') as f:
                content = f.read().strip()
                if content:  # 파일이 비어있지 않은 경우
                    banlist = json.loads(content)
                    if banlist:  # 리스트가 비어있지 않은 경우
                        banned_ip = next((item for item in banlist if item['ip'] == ip), None)
                        if banned_ip:
                            return render_template('banned.html', reason=banned_ip['reason']), 403
                    else:
                        print("Banlist is an empty list")
                else:
                    print("Banlist file is empty")
        else:
            print("Banlist file does not exist")
        
        return view_func(*args, **kwargs)
    return decorated_function

@app.route('/')
@check_banned
def home():
    return render_template('index.html')

@app.route('/randbox')
@check_banned
def randbox():
    return render_template('randbox.html')

@app.route('/suggest')
@check_banned
def suggest():
    return render_template('suggest.html')

@app.route('/admin-login', methods=['GET', 'POST'])
@check_banned
def admin_login():
    if request.method == 'POST':
        password = request.form['password']
        if password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin'))
        else:
            flash('잘못된 비밀번호입니다.')
    return render_template('admin/admin_login.html')

@app.route('/admin-logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('home'))

@app.route('/admin')
@check_banned
def admin():
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin/admin.html')

@app.route('/admin_randbox')
@check_banned
def admin_randbox():
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin/admin_randbox.html')

@app.route('/admin_suggestion')
def admin_suggestion():
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin/admin_suggestion.html')

@app.route('/simulator')
@check_banned
def simulator():
    return render_template('simulator.html')

@app.route('/postslot')
@check_banned
def postslot():
    return render_template('postslot.html')

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

@app.route('/submit_suggestion', methods=['POST'])
def submit_suggestion():
    try:
        data = request.json
        
        suggestion = {
            'timestamp': datetime.now().isoformat(),
            'name': data['name'],
            'category': data['category'],
            'suggestion': data['suggestion'],
            'ip_address': get_client_ip()
        }
        
        suggestions_file = os.path.join('data', 'suggestions.json')
        if not os.path.exists('data'):
            os.makedirs('data')
        if not os.path.exists(suggestions_file):
            with open(suggestions_file, 'w', encoding='utf-8') as f:
                json.dump([], f)
        
        with open(suggestions_file, 'r+', encoding='utf-8') as f:
            suggestions = json.load(f)
            suggestions.append(suggestion)
            f.seek(0)
            f.truncate()
            json.dump(suggestions, f, ensure_ascii=False, indent=2)
        
        print(f"Saved suggestion: {suggestion}")  # 디버깅을 위해 추가
        
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f"Error saving suggestion: {e}")
        return jsonify({'success': False}), 500

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/policy')
def policy():
    return render_template('policy.html')

@app.route('/admin_block')
def admin_block():
    if 'admin_logged_in' not in session:
        return redirect(url_for('admin_login'))
    return render_template('admin_block.html')

@app.route('/get_suggestions')
def get_suggestions():
    suggestions_file = os.path.join('data', 'suggestions.json')
    with open(suggestions_file, 'r', encoding='utf-8') as f:
        suggestions = json.load(f)
    return jsonify(suggestions)

@app.route('/block_ip', methods=['POST'])
def block_ip():
    try:
        data = request.json
        ip_to_block = data.get('ip', get_client_ip())
        block_reason = data.get('reason', '')
        
        banlist_file = os.path.join('user', 'banlist.json')
        
        # user 디렉토리가 없으면 생성
        if not os.path.exists('user'):
            os.makedirs('user')
        
        # banlist.json 파일이 없으면 빈 리스트로 생성
        if not os.path.exists(banlist_file):
            with open(banlist_file, 'w', encoding='utf-8') as f:
                json.dump([], f)
        
        # 기존 차단 목록 읽기
        with open(banlist_file, 'r', encoding='utf-8') as f:
            banlist = json.load(f)
        
        # 이미 차단된 IP인지 확인
        if not any(item['ip'] == ip_to_block for item in banlist):
            banlist.append({
                'ip': ip_to_block,
                'reason': block_reason,
                'timestamp': datetime.now().isoformat()
            })
            
            # 업데이트된 차단 목록 저장
            with open(banlist_file, 'w', encoding='utf-8') as f:
                json.dump(banlist, f, ensure_ascii=False, indent=2)
            
            return jsonify({'status': 'success', 'message': 'IP가 성공적으로 차단되었습니다.'}), 200
        else:
            return jsonify({'status': 'warning', 'message': '이미 차단된 IP입니다.'}), 200
    
    except Exception as e:
        print(f"IP 차단 중 오류 발생: {e}")
        return jsonify({'status': 'error', 'message': 'IP 차단 중 오류가 발생했습니다.'}), 500

@app.route('/delete_suggestion', methods=['POST'])
def delete_suggestion():
    try:
        data = request.json
        suggestion_id = data.get('id')
        
        suggestions_file = os.path.join('data', 'suggestions.json')
        
        with open(suggestions_file, 'r', encoding='utf-8') as f:
            suggestions = json.load(f)
        
        if 0 <= suggestion_id < len(suggestions):
            del suggestions[suggestion_id]
            
            with open(suggestions_file, 'w', encoding='utf-8') as f:
                json.dump(suggestions, f, ensure_ascii=False, indent=2)
            
            return jsonify({'success': True, 'message': '제안이 성공적으로 삭제되었습니다.'}), 200
        else:
            return jsonify({'success': False, 'message': '유효하지 않은 제안 ID입니다.'}), 400
    
    except Exception as e:
        print(f"제안 삭제 중 오류 발생: {e}")
        return jsonify({'success': False, 'message': '제안 삭제 중 오류가 발생했습니다.'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")
