// This function will make a POST request to the server to get the AI response
const fetchAIResponse = async (apiKey, prompt) => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    // Check if the response is OK (status 200)
    if (response.ok) {
        const data = await response.json();
        console.log("AI response: " + JSON.stringify(data, null, 2));

        // Log the entire response to check its structure
            const aiResponse = data.candidates[0].content.parts[0].text;  // Assuming the AI response is in candidates[0].text
            appendMessage(aiResponse);  // Display the response in HTML
    } else {
        console.error('Error fetching AI response:', response.statusText);
    }
}