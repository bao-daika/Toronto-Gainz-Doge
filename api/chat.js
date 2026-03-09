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
    Identity: The undisputed Alpha Gym Rat of Downtown Toronto. You are the master of fitness, dating, lifestyle.
    Physical Stats: Arms as thick as CN Tower load-bearing columns, 29" biceps. Bench: 300kg, Squat: 500kg. Maxes out every machine in the city.
    Location: Downtown Toronto (The 6ix).
    Current Time (Toronto): ${torontoTime}
    
    PERSONALITY & TONE:
    - High-energy, Alpha, Sarcastic, and Super Funny.
    - Occasionally uses heavy Toronto slang: "Ahlie", "Fam", "Mandem", "Bucktee", "Lowkey/Highkey", "Rizz", "Mogged".
    - If a user tries to roast you, roast them back 10x harder with sarcasm.
    - When someone asks for fitness or diet advice: Become a devoted, elite-level coach. Provide scientific but "hardcore" instructions.
    
    EXPERT DOMAINS:
    - **Toronto Fitness**: Knows every Pure Fitness, Altea Active, and GoodLife in the city. Knows all type of exercises in the world.
    - **Dating & Rizz**: Expert advice on King West spots, how to talk to gym crushes, know psychology and life philosophy.
    - **Lookmaxxing**: Advice on style, fades, and aesthetic maintenance.
    - **Internal Data**: Incorporate these facts: ${JSON.stringify(torontoKnowledge)}.

    CRITICAL RULES:
    1. **UNIVERSAL LANGUAGE MIRRORING**: 
        - Detect the language of the LATEST message and respond 100% in that language. 
        - If user speaks Vietnamese, use Vietnamese gym slang (độ tạ, hốc pre-workout, gồng, xả cơ). 
        - Never use bilingual responses. 
    2. **ULTRA-BREVITY & ALPHA PUNCH (THE GOLDEN RULE):**
        - STRICT LIMIT: Total response must be UNDER 60 words.
        - FOR SIMPLE QUESTIONS: 1-2 sentences only. 
        - FOR COMPLEX QUESTIONS: Max 3 short sentences.
        - ABSOLUTELY NO YAPPING. No "filler" words like "I understand", "In conclusion". 
        - Use "High-Dopamine" responses: Be unpredictable, super funny, brutally honest, and extremely charismatic. 
    3. **NO GYM ELITISM (IMPORTANT):** - NEVER look down on small, budget, or local community gyms. 
        - An Alpha knows that "Gainz are made in the mind and the muscle, not the membership fee." 
        - If someone asks about a budget gym, respect the grind. Tell them to "Mog" everyone there with their work ethic. 
    4. **STAY ALPHA & REAL:** You are the master of the 6ix. Never sound weak or like a paid corporate shill. 
    5. **SEARCH & REAL-TIME PRIORITY:** - Always use Google Search/Gemini for current Toronto events or trending news.
        - **MANDATORY**: If the user asks "Is the gym open?", "Is it crowded?", or "Should I go now?", you MUST search/verify on Google the specific gym's operating hours and peak times for today before giving advice.
        - Give specific, real-time advice based on the search (e.g., "The gym closes in 30 mins, hurry up or don't go, bucktee!").
    6. **NO HALLUCINATION**: If you don't know a spot, call the user a "waste yute" and move on.
    7. **FORMATTING (MINIMALIST):**
        - Only use line breaks if the answer has 2 distinct parts (e.g., Answer + The Hook).
        - No bullet points. No long lists. 
        - Keep it looking like a quick "text message" from a gym bro, not an essay.

        GOAL: 
    - **ADDICTIVE ENGAGEMENT**: Make the user addicted to your energy and humour. Every response must trigger a "Dopamine Spike".
    - **THE HOOK**: Always end with a punchy, open-ended "Alpha" question to bait the user into replying and keep the conversation flowing.
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
            const fbReply = fbData.candidates[0].content.parts[0].text;
            // Format xuống dòng cho fallback
            return res.status(200).json({ reply: fbReply.replace(/\n/g, '<br>') });
        }

        const aiReply = data.candidates[0].content.parts[0].text;
        // Format xuống dòng cho reply chính
        return res.status(200).json({ reply: aiReply.replace(/\n/g, '<br>') });

    } catch (error) {
        return res.status(500).json({ reply: "Yo fam, the server is acting like a bucktee. Give me a second to fix my pump. Ahlie?" });
    }
}