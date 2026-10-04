from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/check-id', methods=['GET'])
def check_id():
    user_id = request.args.get('userId')
    zone_id = request.args.get('zoneId')

    if not user_id or not zone_id:
        return jsonify({"success": False, "message": "User ID နှင့် Zone ID ထည့်ပါ။"})

    target_url = f"https://api.vytal.id/mlbb?id={user_id}&zone={zone_id}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

    try:
        response = requests.get(target_url, headers=headers, timeout=10)
        data = response.json()
        
        username = data.get('name') or data.get('username') or data.get('result')
        if username:
            return jsonify({"success": True, "username": username})
        else:
            return jsonify({"success": False, "message": "ID ရှာမတွေ့ပါ။"})
    except Exception as e:
        return jsonify({"success": False, "message": "Server ချိတ်ဆက်မှု အဆင်မပြေပါ။"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
