from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
import os
import json
from datetime import datetime
from functools import wraps
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# Banlist 파일 경로
BANLIST_FILE = os.path.join('user', 'banlist.json')

def is_mobile():
    user_agent = request.headers.get('User-Agent')
    mobile_agents = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
    return any(agent in user_agent.lower() for agent in mobile_agents)

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

@app.route('/suggestions')
@check_banned
def suggestions():
    return render_template('suggestions.html')

@app.route('/get_user_suggestions')
@check_banned
def get_user_suggestions():
    user_ip = get_client_ip()
    suggestions_file = os.path.join('data', 'suggestions.json')
    
    with open(suggestions_file, 'r', encoding='utf-8') as f:
        suggestions = json.load(f)
    
    user_suggestions = [s for s in suggestions if s['ip_address'] == user_ip]
    
    return jsonify(user_suggestions)

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

@app.route('/calc')
@check_banned
def calc():
    return render_template('calc.html')

@app.route('/profile')
@check_banned
def profile():
    return render_template('profile.html', is_mobile=is_mobile())

@app.route('/memo')
@check_banned
def memo():
    return render_template('memo.html', is_mobile=is_mobile())

@app.route('/cardpack')
@check_banned
def cardpack():
    return render_template('cardpack.html')

@app.route('/get_items/profile/<category>')
def get_profile_items(category):
    items_path = f'static/images/ProfileCustomizer/{category}'
    items = [f for f in os.listdir(items_path) if f.endswith('.webp')]
    return jsonify(items)

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

@app.route('/get_memo_skins/<category>/<job>', methods=['GET'])
def get_role_skins(category, job):
    path = f"static/images/MemoCustomizer/{category}/{job}"
    if not os.path.isdir(path):
        return jsonify([]), 404
    files = [f for f in os.listdir(path) if f.endswith('.webp')]
    return jsonify(files)

@app.route('/get_memo_skins/<path:folder_name>')
def get_memo_skins(folder_name):
    import os
    folder_path = os.path.join('static', 'images', 'MemoCustomizer', folder_name)
    if not os.path.exists(folder_path):
        return jsonify([]), 404
    files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
    return jsonify(files)

@app.route('/submit_suggestion', methods=['POST'])
def submit_suggestion():
    try:
        data = request.json
        
        suggestion = {
            'timestamp': datetime.now().isoformat(),
            'name': data['name'],
            'category': data['category'],
            'suggestion': data['suggestion'],
            'ip_address': get_client_ip(),
            'replied': False,
            'replyContent': '',
            'replyTime': None,
            'pinned': False
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
        
        print(f"제안 저장 성공: {suggestion}")  # 디버깅을 위해 추가
        
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f"제안 저장 중 오류 발생: {e}")
        return jsonify({'success': False}), 500
    
@app.route('/update_suggestion', methods=['POST'])
def update_suggestion():
    try:
        data = request.json
        timestamp = data.get('timestamp')  # 고유 식별자로 사용할 timestamp
        ip_address = data.get('ip_address')  # IP 주소로도 식별
        reply_content = data.get('reply')

        # 데이터가 제대로 전달되었는지 확인
        if not timestamp or not ip_address:
            return jsonify({'success': False, 'message': '타임스탬프 또는 IP 주소가 없습니다.'}), 400
        if not reply_content:
            return jsonify({'success': False, 'message': '답장 내용이 없습니다.'}), 400

        # suggestions.json 파일 경로
        suggestions_file = os.path.join('data', 'suggestions.json')

        # suggestions.json 파일 읽기
        with open(suggestions_file, 'r', encoding='utf-8') as f:
            suggestions = json.load(f)

        # 해당 건의사항 찾기 (timestamp와 ip_address로 검색)
        for suggestion in suggestions:
            if suggestion['timestamp'] == timestamp and suggestion['ip_address'] == ip_address:
                suggestion['replied'] = True  # 답장 상태 업데이트
                suggestion['replyContent'] = reply_content  # 답장 내용 업데이트
                suggestion['replyTime'] = datetime.now().isoformat()  # 답장 시간 기록
                break
        else:
            return jsonify({'success': False, 'message': '해당 건의사항을 찾을 수 없습니다.'}), 404

        # 수정된 내용을 다시 파일에 저장
        with open(suggestions_file, 'w', encoding='utf-8') as f:
            json.dump(suggestions, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True, 'message': '답장이 성공적으로 저장되었습니다.'}), 200

    except Exception as e:
        print(f"답장 저장 중 오류 발생: {e}")
        return jsonify({'success': False, 'message': '답장 저장 중 오류가 발생했습니다.'}), 500
    
@app.route('/pin_suggestion', methods=['POST'])
def pin_suggestion():
    try:
        data = request.json
        timestamp = data.get('timestamp')  # 타임스탬프
        ip_address = data.get('ip_address')  # IP 주소
        pinned = data.get('pinned')  # pinned 상태

        # 유효성 확인
        if not timestamp or not ip_address:
            return jsonify({'success': False, 'message': '유효하지 않은 요청입니다. 타임스탬프 또는 IP 주소가 없습니다.'}), 400
        if pinned is None:
            return jsonify({'success': False, 'message': 'pinned 상태가 제공되지 않았습니다.'}), 400

        suggestions_file = os.path.join('data', 'suggestions.json')

        # suggestions.json 파일 읽기
        with open(suggestions_file, 'r', encoding='utf-8') as f:
            suggestions = json.load(f)

        # timestamp와 ip_address로 건의사항 찾기
        suggestion_to_pin = None
        for suggestion in suggestions:
            if suggestion['timestamp'] == timestamp and suggestion['ip_address'] == ip_address:
                suggestion_to_pin = suggestion
                break

        # 건의사항을 찾지 못한 경우
        if suggestion_to_pin is None:
            return jsonify({'success': False, 'message': '해당 건의사항을 찾을 수 없습니다.'}), 404

        # pinned 상태 업데이트
        suggestion_to_pin['pinned'] = pinned

        # 수정된 내용을 다시 파일에 저장
        with open(suggestions_file, 'w', encoding='utf-8') as f:
            json.dump(suggestions, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True, 'message': '건의사항의 pinned 상태가 업데이트되었습니다.'}), 200

    except Exception as e:
        print(f"건의사항 pinned 상태 업데이트 중 오류 발생: {e}")
        return jsonify({'success': False, 'message': '건의사항 pinned 상태 업데이트 중 오류가 발생했습니다.'}), 500


@app.route('/delete_suggestion', methods=['POST'])
def delete_suggestion():
    try:
        data = request.json
        timestamp = data.get('timestamp')  # 타임스탬프
        ip_address = data.get('ip_address')  # IP 주소

        # timestamp와 ip_address가 제공되었는지 확인
        if not timestamp or not ip_address:
            return jsonify({'success': False, 'message': '유효하지 않은 요청입니다. 타임스탬프 또는 IP 주소가 없습니다.'}), 400

        suggestions_file = os.path.join('data', 'suggestions.json')

        # suggestions.json 파일 읽기
        with open(suggestions_file, 'r', encoding='utf-8') as f:
            suggestions = json.load(f)

        # timestamp와 ip_address로 건의사항 찾기
        suggestion_to_delete = None
        for suggestion in suggestions:
            if suggestion['timestamp'] == timestamp and suggestion['ip_address'] == ip_address:
                suggestion_to_delete = suggestion
                break

        # 건의사항을 찾지 못한 경우
        if suggestion_to_delete is None:
            return jsonify({'success': False, 'message': '해당 건의사항을 찾을 수 없습니다.'}), 404

        # 건의사항 삭제
        suggestions.remove(suggestion_to_delete)

        # 수정된 내용을 다시 파일에 저장
        with open(suggestions_file, 'w', encoding='utf-8') as f:
            json.dump(suggestions, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True, 'message': '건의사항이 성공적으로 삭제되었습니다.'}), 200

    except Exception as e:
        print(f"제안 삭제 중 오류 발생: {e}")
        return jsonify({'success': False, 'message': '제안 삭제 중 오류가 발생했습니다.'}), 500
    
@app.route('/check_ban_status', methods=['GET'])
def check_ban_status():
    ip_to_check = request.args.get('ip')  # GET 파라미터로 IP를 받음
    
    if not ip_to_check:
        return jsonify({'success': False, 'message': 'IP 주소가 제공되지 않았습니다.'}), 400
    
    # banlist.json 파일이 존재하는지 확인
    if not os.path.exists(BANLIST_FILE):
        return jsonify({'success': False, 'message': 'banlist 파일이 존재하지 않습니다.'}), 404
    
    # banlist.json 파일을 읽어서 IP가 차단되었는지 확인
    with open(BANLIST_FILE, 'r', encoding='utf-8') as f:
        banlist = json.load(f)
    
    banned_user = next((ban for ban in banlist if ban['ip'] == ip_to_check), None)
    
    if banned_user:
        return jsonify({
            'success': True, 
            'banned': True,
            'reason': banned_user['reason'],
            'timestamp': banned_user['timestamp']
        }), 200
    else:
        return jsonify({'success': True, 'banned': False}), 200

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


if __name__ == '__main__':
    app.run(debug=True, port=5000, host="0.0.0.0")
