let isChatOpen = false;

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    isChatOpen = !isChatOpen;
    chatWindow.style.display = isChatOpen ? 'flex' : 'none';
    if (isChatOpen) {
        document.getElementById('chatInput').focus();
    }
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendChatMessage();
    }
}

function sendChatMessage() {
    const inputField = document.getElementById('chatInput');
    const message = inputField.value.trim();
    if (!message) return;

    // Append User Message
    appendMessage(message, 'user-message');
    inputField.value = '';

    // Show Loading in Chat
    const loadingId = 'chat-loading-' + Date.now();
    appendLoader(loadingId);

    // Call Backend
    fetch('/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: message }),
    })
        .then(response => response.json())
        .then(data => {
            removeLoader(loadingId);
            let resultText = parseResponse(data);
            appendMessage(resultText, 'bot-message');
        })
        .catch((error) => {
            console.error('Error:', error);
            removeLoader(loadingId);
            appendMessage("Sorry, I'm having trouble connecting right now.", 'bot-message');
        });
}

function appendMessage(text, className) {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.innerHTML = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendLoader(id) {
    const chatMessages = document.getElementById('chatMessages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = id;
    loadingDiv.innerHTML = '<i class="fas fa-ellipsis-h fa-fade"></i>';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeLoader(id) {
    const loader = document.getElementById(id);
    if (loader) loader.remove();
}

function parseResponse(data) {
    console.log("Raw API Response:", data);

    try {
        // 1. Standard Nested Langflow Structure
        if (data.outputs && data.outputs[0].outputs && data.outputs[0].outputs[0].results) {
            const result = data.outputs[0].outputs[0].results;
            if (result.message && result.message.text) return result.message.text.replace(/\n/g, '<br>');
            if (result.message && result.message.data && result.message.data.text) return result.message.data.text.replace(/\n/g, '<br>');
        }

        // 2. Fallbacks
        if (data.result) return data.result.replace(/\n/g, '<br>');
        if (data.message) return data.message.replace(/\n/g, '<br>');

        return "I didn't understand that. (Check console for details)";
    } catch (error) {
        console.error("Error parsing response:", error);
        return "Error parsing response.";
    }
}

// --- Main Hero Search Logic ---
// --- Main Hero Search Logic ---
function processInput() {
    // 1. Gather Structured Data
    const hsCode = document.getElementById('hsCode').value;
    const actionType = document.getElementById('actionType').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;
    const originCountry = document.getElementById('originCountry').value;
    const destCountry = document.getElementById('destCountry').value;

    if (!hsCode || !quantity || !price || !originCountry || !destCountry) {
        alert("Please fill in all fields.");
        return;
    }

    // 2. Construct Natural Language Prompt
    const input = `I want to ${actionType} ${quantity} units of product with HS Code ${hsCode} and unit price ${price} USD from ${originCountry} to ${destCountry}. Please calculate the landed cost, tariffs, and compliance requirements.`;

    console.log("Constructed Prompt:", input);

    // 2.1 Trigger Map Animation
    drawRoute(originCountry, destCountry);

    // 3. Show Loading in Main Result Area
    const mainResults = document.getElementById('mainResults');
    const resultCard = document.getElementById('resultCard');
    mainResults.style.display = 'block';
    resultCard.innerHTML = '<div class="loader"></div><p style="text-align:center; margin-top:10px;">Analyzing Global Trade Data...</p>';

    // 4. Call Backend for Main Answer
    fetch('/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: input }),
    })
        .then(response => response.json())
        .then(data => {
            // 5. Display Result in Main Area
            let resultText = parseResponse(data);
            resultCard.innerHTML = `
            <h3 style="margin-bottom: 15px; color: var(--accent-black);">Analysis Result</h3>
            <div style="font-size: 1.1rem; line-height: 1.6;">${resultText}</div>
        `;

            // 6. Trigger AI Advisor "Suggestion" (Simulated per Architecture)
            setTimeout(() => {
                triggerAdvisorSuggestion(input);
            }, 1500);
        })
        .catch((error) => {
            console.error('Error:', error);
            resultCard.innerHTML = '<p style="color:red; text-align:center;">Error processing request. Please try again.</p>';
        });
}

function triggerAdvisorSuggestion(query) {
    // Open Chat if closed
    if (!isChatOpen) toggleChat();

    // 5. Generate a context-aware suggestion (Simulated Logic based on PDF)
    // Ideally, this would call a second flow "AI Advisor". 
    // For now, we simulate the "Optimization Engine" response.
    let suggestion = "";

    if (query.toLowerCase().includes("cost")) {
        suggestion = "💡 **Optimization Tip:** I checked alternative routes. sourcing from **Vietnam** could reduce tariffs by **15%** due to the new trade agreement. Would you like to see the comparison?";
    } else if (query.toLowerCase().includes("hs code")) {
        suggestion = "🔍 **Compliance Check:** Verify if this HS Code requires a **COO (Certificate of Origin)** to avoid delays at customs. I can generate a template if needed.";
    } else {
        suggestion = "✨ **Insight:** I can also calculate the **Carbon Border Adjustment Mechanism (CBAM)** liability for this shipment. Just ask!";
    }

    appendMessage(suggestion, 'bot-message');
}

// --- Map Visualization Logic ---
const countryCoords = {
    "China": { x: 600, y: 150, code: 'cn' },
    "USA": { x: 180, y: 140, code: 'us' },
    "India": { x: 550, y: 180, code: 'in' },
    "Vietnam": { x: 610, y: 200, code: 'vn' },
    "Germany": { x: 420, y: 115, code: 'de' },
    "UAE": { x: 500, y: 170, code: 'ae' },
    "UK": { x: 400, y: 110, code: 'gb' },
    "Canada": { x: 180, y: 100, code: 'ca' },
    "Australia": { x: 680, y: 300, code: 'au' },
    "Japan": { x: 680, y: 140, code: 'jp' },
    "South Korea": { x: 660, y: 145, code: 'kr' },
    "France": { x: 410, y: 125, code: 'fr' },
    "Italy": { x: 425, y: 130, code: 'it' },
    "Brazil": { x: 280, y: 280, code: 'br' },
    "Mexico": { x: 180, y: 180, code: 'mx' }
};

function drawRoute(origin, destination) {
    const svg = document.getElementById('routeSvg');
    const mapContainer = document.getElementById('mapContainer');

    // Clear previous paths (keep background rect if any, but we use div bg now)
    // Clear all children to be safe and redraw
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }

    // Normalize inputs for lookup
    const originKey = Object.keys(countryCoords).find(k => k.toLowerCase() === origin.trim().toLowerCase());
    const destKey = Object.keys(countryCoords).find(k => k.toLowerCase() === destination.trim().toLowerCase());

    console.log(`Mapping Route: ${origin} (${originKey}) -> ${destination} (${destKey})`);

    if (!originKey || !destKey) {
        console.warn("Coordinates not found for", origin, destination);
        mapContainer.style.display = 'none';
        return;
    }

    mapContainer.style.display = 'block';

    const start = countryCoords[originKey];
    const end = countryCoords[destKey];

    // Helper to create Pin with Flag
    function createPin(x, y, countryCode) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Pin Drop (Red Marker) with White Stroke for Visibility
        const pinPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // Simple map marker shape
        pinPath.setAttribute("d", "M12 0c-4.4 0-8 3.6-8 8 0 5.4 8 16 8 16s8-10.6 8-16c0-4.4-3.6-8-8-8z");
        pinPath.setAttribute("fill", "#ff4757");
        pinPath.setAttribute("stroke", "#ffffff"); // White border
        pinPath.setAttribute("stroke-width", "2");
        pinPath.setAttribute("transform", `translate(${x - 12}, ${y - 24}) scale(1.2)`); // Slightly larger pin
        pinPath.setAttribute("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.4))"); // Stronger shadow

        // White circle inside pin
        const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        innerCircle.setAttribute("cx", x);
        innerCircle.setAttribute("cy", y - 16); // Adjusted for scale
        innerCircle.setAttribute("r", "4"); // Slightly larger dot
        innerCircle.setAttribute("fill", "white");

        // Flag Image sitting on top of pin
        const flag = document.createElementNS("http://www.w3.org/2000/svg", "image");
        flag.setAttribute("href", `https://flagcdn.com/w160/${countryCode}.png`); // High-res flag
        flag.setAttribute("x", x - 15); // Center flag horizontally above pin
        flag.setAttribute("y", y - 48); // Sit right above the scaled pin
        flag.setAttribute("width", "30"); // Larger flag
        flag.setAttribute("height", "20");
        flag.setAttribute("class", "waving-flag"); // Keep class for static display
        flag.setAttribute("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.3))"); // Shadow for flag

        // No Pole (Line removed as requested)

        group.appendChild(pinPath);
        group.appendChild(innerCircle);
        group.appendChild(flag); // Flag effectively "sticks" to top of pin
        return group;
    }

    // Add Start Pin
    svg.appendChild(createPin(start.x, start.y, start.code));

    // Add End Pin
    svg.appendChild(createPin(end.x, end.y, end.code));

    // Calculate Curve
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2 - 50;

    // Create Route Path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const d = `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
    path.setAttribute("d", d);
    path.setAttribute("class", "route-line");
    svg.appendChild(path);

    // Create Aeroplane Icon Group
    const iconGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Aeroplane Shape
    const plane = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Simple plane icon (pointing right by default)
    plane.setAttribute("d", "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z");
    plane.setAttribute("fill", "#333"); // Dark grey plane for contrast
    plane.setAttribute("transform", "translate(-12, -12) rotate(90 12 12)"); // Adjust center and rotation

    iconGroup.appendChild(plane);

    // Animation along path
    const animateMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
    animateMotion.setAttribute("dur", "3s");
    animateMotion.setAttribute("repeatCount", "indefinite");
    animateMotion.setAttribute("path", d);
    animateMotion.setAttribute("rotate", "auto");

    iconGroup.appendChild(animateMotion);
    svg.appendChild(iconGroup);
}

// --- Custom Combobox Logic ---
function showOptions(input) {
    const list = input.nextElementSibling;
    if (list && list.classList.contains('custom-options')) {
        // Reset all options to visible when showing
        const options = list.querySelectorAll('li');
        options.forEach(opt => opt.style.display = 'block');

        list.classList.remove('hidden');
    }
}

function hideOptions(input) {
    // Delay hiding to handle clicks that aren't caught by mousedown (fallback)
    setTimeout(() => {
        const list = input.nextElementSibling;
        if (list && list.classList.contains('custom-options')) {
            list.classList.add('hidden');
        }
    }, 200);
}

function filterOptions(input) {
    const filter = input.value.toLowerCase();
    const list = input.nextElementSibling;
    const options = list.querySelectorAll('li');

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(filter)) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    });
}

// Global Event Delegation for Dropdown Selection
document.addEventListener('DOMContentLoaded', () => {
    const dropdowns = document.querySelectorAll('.custom-options');

    dropdowns.forEach(list => {
        list.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'LI') {
                e.preventDefault(); // Prevent input blur

                const input = list.previousElementSibling;
                input.value = e.target.textContent;

                list.classList.add('hidden');

                // If it's an action or country, we might want to trigger something?
                // For now just setting value is enough per original logic
            }
        });
    });
});

// Remove inline selectOption if we use delegation, but for backward compatibility/simplicity
// we can keep the function or let the delegation handle it. 
// The inline onclicks in HTML will still fire click, but mousedown runs first and hides list.
// To be safe, we can keep selectOption as a no-op or fallback.
function selectOption(inputId, value) {
    // Fallback for inline onclick if mousedown didn't catch it (unlikely)
    const input = document.getElementById(inputId);
    input.value = value;
    const list = input.nextElementSibling;
    list.classList.add('hidden');
}

// Close dropdowns if clicked outside
document.addEventListener('click', function (e) {
    if (!e.target.closest('.relative-container')) {
        document.querySelectorAll('.custom-options').forEach(el => el.classList.add('hidden'));
    }
});
