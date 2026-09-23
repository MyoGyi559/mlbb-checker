export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET request (Query string) နှင့် POST request (JSON body) နှစ်ခုလုံး လက်ခံနိုင်အောင် လုပ်ထားပါသည်
    const userId = req.query.user_id || req.body?.user_id || req.body?.id;
    const zoneId = req.query.zone_id || req.body?.zone_id || req.body?.zone;

    if (!userId || !zoneId) {
        return res.status(400).json({ 
            status: false, 
            message: "User ID နှင့် Zone ID ထည့်ပေးပါ။ Example: ?user_id=123456&zone_id=1234" 
        });
    }

    try {
        // Sacoli API သို့ Direct Request ပို့ခြင်း
        const response = await fetch("https://sacoliofficial.com/api/api/games/check_region", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            },
            body: JSON.stringify({
                game: "mlbb",
                user_id: userId.toString(),
                zone_id: zoneId.toString()
            })
        });

        const rawData = await response.text();
        let data;

        try {
            data = JSON.parse(rawData);
        } catch (e) {
            return res.status(500).json({
                status: false,
                message: "API မှ JSON မဟုတ်သော Response ပြန်ပေးနေပါသည် (Server Down ဖြစ်နိုင်ပါသည်)။",
                raw_response: rawData
            });
        }

        // Response မြင်ရအောင် ပို့ပေးမည်
        return res.status(response.status).json({
            status: response.ok,
            result: data
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "API ခေါ်ယူစဉ် Error တက်ပါသည်: " + error.message
        });
    }
}
