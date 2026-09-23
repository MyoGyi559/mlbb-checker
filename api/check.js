export default async function handler(req, res) {
    // CORS Header များ သတ်မှတ်ခြင်း
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Request ထဲမှ user_id နှင့် zone_id ကို ယူခြင်း
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const userId = body?.user_id || req.query?.user_id;
    const zoneId = body?.zone_id || req.query?.zone_id;

    if (!userId || !zoneId) {
        return res.status(400).json({ 
            status: false, 
            message: "User ID နှင့် Zone ID ထည့်ပေးပါ။" 
        });
    }

    try {
        // Sacoli Official MLBB ID Verify API သို့ Request ပို့ခြင်း
        const response = await fetch("https://sacoliofficial.com/api/api/games/check_region", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            body: JSON.stringify({
                game: "mlbb",
                user_id: userId,
                zone_id: zoneId
            })
        });

        const data = await response.json();

        // API တုံ့ပြန်မှုကို စစ်ဆေးပြီး JSON ပြန်ထုတ်ပေးခြင်း
        if (data && (data.username || data.name || data.data?.username)) {
            const username = data.username || data.name || data.data?.username;
            return res.status(200).json({
                status: true,
                username: username,
                user_id: userId,
                zone_id: zoneId
            });
        } else {
            return res.status(400).json({
                status: false,
                message: data.message || "အကောင့် ရှာမတွေ့ပါ။ ID/Zone ပြန်စစ်ပါ။"
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error: " + error.message
        });
    }
}
