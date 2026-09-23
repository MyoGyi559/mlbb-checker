export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ID နှင့် Zone ID Parameter များ ဖတ်ယူခြင်း
    const userId = req.query.user_id || req.query.id || req.body?.user_id || req.body?.id;
    const zoneId = req.query.zone_id || req.query.zone || req.body?.zone_id || req.body?.zone;

    if (!userId || !zoneId) {
        return res.status(400).json({ 
            status: false, 
            message: "User ID နှင့် Zone ID ထည့်ပေးပါ။" 
        });
    }

    try {
        // Parameter နာမည်ကို id နှင့် zone သို့ ပြောင်းလဲထားပါသည်
        const targetUrl = `https://sacoliofficial.com/api/api/games/check_region?id=${userId}&zone=${zoneId}`;
        
        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        // Target API မှ အချက်အလက်များ အဆင်ပြေစွာ ပြန်ရပါက
        if (response.ok) {
            return res.status(200).json({
                status: true,
                username: data.username || data.name || data.nickname || data.result || data,
                user_id: userId,
                zone_id: zoneId,
                raw_data: data
            });
        } else {
            return res.status(400).json({
                status: false,
                message: "အကောင့် ရှာမတွေ့ပါ (သို့) ID လွဲမှားနေပါသည်။",
                error: data
            });
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error: " + error.message
        });
    }
}
