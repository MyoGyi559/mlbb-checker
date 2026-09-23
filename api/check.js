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
        // Sacoli API Endpoint သို့ Request ပို့ခြင်း
        const response = await fetch("https://sacoliofficial.com/api/api/games/mobile-legends", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            body: JSON.stringify({
                user_id: userId,
                zone_id: zoneId
            })
        });

        const data = await response.json();

        if (data && (data.username || data.data?.username || data.nickname)) {
            return res.status(200).json({
                status: true,
                username: data.username || data.data?.username || data.nickname,
                user_id: userId,
                zone_id: zoneId
            });
        } else {
            return res.status(400).json({
                status: false,
                message: data?.message || "အကောင့် ရှာမတွေ့ပါ။ ID/Zone ပြန်စစ်ပါ။"
            });
        }
    } catch (err) {
        return res.status(500).json({ status: false, message: "API Error: " + err.message });
    }
}
