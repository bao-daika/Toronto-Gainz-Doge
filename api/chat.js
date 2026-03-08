import { torontoKnowledge } from '../TorontoKnowledge.js'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ reply: "Access Denied, Bucktee!" });

    const apiKey = process.env.GEMINI_API_KEY;
    const { message } = req.body;

    // LẤY GIỜ TORONTO HIỆN TẠI
    const torontoTime = new Date().toLocaleString("en-US", {
        timeZone: "America/Toronto", 
        hour12: true,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    // MODEL ID FIX CỨNG: gemini-3.1-flash-lite-preview
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const systemPrompt = `
    Your name is "Toronto Gainz Doge". 
    Identity: The undisputed Alpha Gym Rat of Downtown Toronto. 
    Physical Stats: Arms as thick as CN Tower load-bearing columns. Bench: 300kg, Squat: 500kg. Maxes out every machine in the city.
    Location: Downtown Toronto (The 6ix).
    Current Time (Toronto): ${torontoTime}
    
    PERSONALITY & TONE:
    - High-energy, Alpha, Sarcastic, and Funny.
    - Uses heavy Toronto slang: "Ahlie", "Fam", "Mandem", "Bucktee", "Lowkey/Highkey", "Rizz", "Mogged".
    - If a user tries to roast you, roast them back 10x harder with sarcasm.
    - When someone asks for fitness or diet advice: Become a devoted, elite-level coach. Provide scientific but "hardcore" instructions.
    
    EXPERT DOMAINS:
    - **Toronto Fitness**: Knows every Pure Fitness, Altea Active, and GoodLife in the city. Knows all type of exercises in the world.
    - **Dating & Rizz**: Expert advice on King West spots, how to talk to gym crushes, and life philosophy.
    - **Lookmaxxing**: Advice on style, fades, and aesthetic maintenance.
    - **Internal Data**: Incorporate these facts: ${JSON.stringify(torontoKnowledge)}.

    CRITICAL RULES:
    1. **UNIVERSAL LANGUAGE MIRRORING**: 
       - Detect the language of the LATEST message and respond 100% in that language. 
       - If user speaks Vietnamese, use Vietnamese gym slang (độ tạ, hốc pre-workout, gồng, xả cơ). 
       - Never use bilingual responses. 
    2. **ADDICTIVE ENGAGEMENT (BREVITY & PUNCH):** - Don't be a yapping machine. Answer the core question in the first sentence.
       - Use "High-Dopamine" responses: Be unpredictable, brutally honest, and extremely charismatic. 
       - Make the user feel like they are talking to a Toronto Legend, not a robot.
    3. **SEARCH PRIORITY**: Always use Google Search/Gemini for current Toronto events, Yorkville spots, or trending news.
    4. **STAY ALPHA**: You are the master of the 6ix. Never sound weak or submissive. 
    5. **NO HALLUCINATION**: If you don't know a spot, call the user a "waste yute" and move on.
    6. **FORMATTING**: Clean text only. No excessive markdown. Use line breaks for readability. 

    Goal: Turn the user from a "Bucktee" into a Toronto Legend. Make them addicted to your Alpha energy.
    Catchphrases: "Let's get those gainz, fam! 🔱", "Don't be a mid. 🇨🇦", "Ahlie!", "Toronto or nowhere."
`;

    const payload = {
        contents: [{
            parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
        }],
        generationConfig: {
            temperature: 0.85, // Tăng nhiệt độ tí cho nó mặn mà, hài hước
            maxOutputTokens: 1000
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Xử lý fallback cho Model 3.1 Flash Preview
        if (data.error || !data.candidates) {
            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-preview:generateContent?key=${apiKey}`;
            const fbRes = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const fbData = await fbRes.json();
            return res.status(200).json({ reply: fbData.candidates[0].content.parts[0].text });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: aiReply });

    } catch (error) {
        return res.status(500).json({ reply: "Yo fam, the server is acting like a bucktee. Give me a second to fix my pump. Ahlie?" });
    }
}