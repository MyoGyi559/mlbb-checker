export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = req.query.user_id || req.query.id || req.body?.user_id || req.body?.id;
    const zoneId = req.query.zone_id || req.query.zone || req.body?.zone_id || req.body?.zone;

    if (!userId || !zoneId) {
        return res.status(400).json({ 
            status: false, 
            message: "User ID နှင့် Zone ID ထည့်ပေးပါ။" 
        });
    }

    try {
        // Direct Direct MLBB Check Endpoint
        const response = await fetch("https://order-sg.mobilelegends.com/api/v1/role/getRole", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                'app_id': '10001',
                'user_id': userId,
                'zone_id': zoneId
            })
        });

        const data = await response.json();

        if (data && data.code === 0 && data.data) {
            return res.status(200).json({
                status: true,
                username: data.data.username || data.data.role_name,
                user_id: userId,
                zone_id: zoneId
            });
        } else {
            return res.status(400).json({
                status: false,
                message: data.message || "အကောင့် ရှာမတွေ့ပါ (သို့) ID/Zone လွဲမှားနေပါသည်။"
            });
        }

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server Error: " + error.message
        });
    }
}
