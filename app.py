# app.py
from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/randbox')
def randbox():
    return render_template('randbox.html')

@app.route('/admin')
def admin():
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
    app.run(debug=True)
