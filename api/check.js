import https from 'https';

export default async function handler(req, res) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            body = {};
        }
    }

    const userId = body?.user_id || req.query?.user_id;
    const zoneId = body?.zone_id || req.query?.zone_id;

    if (!userId || !zoneId) {
        return res.status(400).json({ status: false, message: "User ID နှင့် Zone ID ထည့်သွင်းပေးပါ။" });
    }

    const postData = new URLSearchParams({
        app_id: "10001",
        params: JSON.stringify({ user_id: userId, zone_id: zoneId })
    }).toString();

    const options = {
        hostname: 'order-sg.mobilelegends.com',
        path: '/pay/v1/rechargecheck',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Origin': 'https://order-sg.mobilelegends.com',
            'Referer': 'https://order-sg.mobilelegends.com/pay'
        }
    };

    try {
        const result = await new Promise((resolve, reject) => {
            const request = https.request(options, (response) => {
                let data = '';
                response.on('data', (chunk) => { data += chunk; });
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(new Error("Invalid JSON response from Moonton"));
                    }
                });
            });

            request.on('error', (error) => {
                reject(error);
            });

            request.write(postData);
            request.end();
        });

        if (result && result.data && result.data.username) {
            return res.status(200).json({
                status: true,
                username: result.data.username,
                user_id: userId,
                zone_id: zoneId
            });
        } else {
            return res.status(400).json({
                status: false,
                message: result?.resMsg || "အကောင့် ရှာမတွေ့ပါ။ ID/Zone ပြန်စစ်ပါ။"
            });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: "Moonton Server Connection Error: " + err.message });
    }
}
