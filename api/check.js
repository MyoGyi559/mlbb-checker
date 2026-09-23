export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const userId = body?.user_id || req.query?.user_id;
    const zoneId = body?.zone_id || req.query?.zone_id;

    if (!userId || !zoneId) {
        return res.status(400).json({ status: false, message: "User ID နှင့် Zone ID ထည့်ပေးပါ။" });
    }

    try {
        // Moonton Official Public Validator Proxy
        const response = await fetch(`https://api.vold.id/api/mlbb/check?user_id=${userId}&zone_id=${zoneId}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const data = await response.json();

        if (data && (data.username || data.name || data.data?.username)) {
            const name = data.username || data.name || data.data?.username;
            return res.status(200).json({
                status: true,
                username: name,
                user_id: userId,
                zone_id: zoneId
            });
        }

        // Fallback Backup Provider
        const backupRes = await fetch("https://smileone.com/merchant/mobilelegends/checkrole", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                user_id: userId,
                zone_id: zoneId,
                pid: "13"
            })
        });

        const backupData = await backupRes.json();

        if (backupData && backupData.username) {
            return res.status(200).json({
                status: true,
                username: backupData.username,
                user_id: userId,
                zone_id: zoneId
            });
        }

        return res.status(400).json({
            status: false,
            message: "အကောင့် ရှာမတွေ့ပါ။ ID/Zone ပြန်စစ်ပါ။"
        });

    } catch (err) {
        return res.status(500).json({ status: false, message: "Server Error: " + err.message });
    }
}
