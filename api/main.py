from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

@app.route('/check-id', methods=['GET'])
def check_id():
    user_id = request.args.get('userId')
    zone_id = request.args.get('zoneId')

    if not user_id or not zone_id:
        return jsonify({"success": False, "message": "User ID နှင့် Zone ID ထည့်ပါ။"})

    # RedX Game MLBB Checker Target URL
    target_url = "https://redxgame.com/tools/mobile-legends-id-checker"
    
    # RedX Game သို့ ပို့မည့် Data
    payload = {
        'id': user_id,
        'zone': zone_id
    }

    # Real Browser အဖြစ် ဟန်ဆောင်ရန် Headers
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': target_url
    }

    try:
        # RedX Game သို့ Request ပို့ခြင်း
        session = requests.Session()
        response = session.post(target_url, data=payload, headers=headers, timeout=10)
        
        # JSON Response ပြန်လာပါက
        try:
            data = response.json()
            username = data.get('name') or data.get('username') or data.get('result') or data.get('nickname')
            if username:
                return jsonify({"success": True, "username": username})
        except Exception:
            pass

        # HTML Form ပြန်လာပါက စာသားထဲမှ Name ကို သီးသန့်ထုတ်ယူခြင်း (HTML Parsing)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # RedX Game ရဲ့ Name ပေါ်သည့် Tag/Element များကို ရှာဖွေခြင်း
        result_element = soup.find(id="result") or soup.find(class_="result") or soup.find('div', {'id': 'nickname'})
        
        if result_element:
            username = result_element.get_text(strip=True)
            if username and "invalid" not in username.lower() and "error" not in username.lower():
                return jsonify({"success": True, "username": username})

        return jsonify({"success": False, "message": "ID သို့မဟုတ် Zone ID မှားယွင်းနေပါသည်။"})

    except Exception as e:
        return jsonify({"success": False, "message": "RedX Game သို့ ချိတ်ဆက်၍ မရပါ သို့မဟုတ် Server နှေးကွေးနေပါသည်။"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
