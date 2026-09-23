export default async function handler(req, res) {
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

    try {
        const response = await fetch("https://order-sg.mobilelegends.com/pay/v1/rechargecheck", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            body: new URLSearchParams({
                app_id: "10001",
                params: JSON.stringify({ user_id: userId, zone_id: zoneId })
            })
        });

        const data = await response.json();

        if (data && data.data && data.data.username) {
            return res.status(200).json({
                status: true,
                username: data.data.username,
                user_id: userId,
                zone_id: zoneId
            });
        } else {
            return res.status(400).json({ status: false, message: "အကောင့် ရှာမတွေ့ပါ။ ID/Zone ပြန်စစ်ပါ။" });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: "Server Connection Error" });
    }
}
