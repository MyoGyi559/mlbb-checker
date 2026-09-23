export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = req.query.user_id || req.body?.user_id || req.body?.id;
    const zoneId = req.query.zone_id || req.body?.zone_id || req.body?.zone;

    if (!userId || !zoneId) {
        return res.status(400).json({ 
            status: false, 
            message: "User ID နှင့် Zone ID ထည့်ပေးပါ။" 
        });
    }

    try {
        // Sacoli API သို့ GET Request ပြောင်းလဲ ပို့ဆောင်ခြင်း
        const targetUrl = `https://sacoliofficial.com/api/api/games/check_region?game=mlbb&user_id=${userId}&zone_id=${zoneId}`;
        
        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "Accept": "application/json"
            }
        });

        const rawData = await response.text();
        let data;

        try {
            data = JSON.parse(rawData);
        } catch (e) {
            return res.status(500).json({
                status: false,
                message: "API မှ JSON ပြန်မပေးပါ - " + rawData
            });
        }

        return res.status(200).json({
            status: response.ok,
            data: data
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error: " + error.message
        });
    }
}
