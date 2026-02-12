// Wait for the DOM to fully load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Select DOM Elements ---
    // Inputs
    const populationInput = document.getElementById('population');
    const populationValue = document.getElementById('pop-value');

    const coalInput = document.getElementById('coal');
    const coalValue = document.getElementById('coal-value');

    const solarInput = document.getElementById('solar');
    const solarValue = document.getElementById('solar-value');

    const windInput = document.getElementById('wind');
    const windValue = document.getElementById('wind-value');

    const transportInput = document.getElementById('transport');
    const simulateBtn = document.getElementById('simulate-btn');

    // Result Outputs
    const energyResult = document.getElementById('energy-result');
    const co2Result = document.getElementById('co2-result');
    const pollutionResult = document.getElementById('pollution-result');
    const scoreResult = document.getElementById('score-result');
    const feedbackMsg = document.getElementById('feedback-msg');

    // --- 2. Input Event Listeners (Update numbers when sliders move) ---
    // Helper function to update text display for a slider
    function updateValue(input, display) {
        input.addEventListener('input', () => {
            display.textContent = Number(input.value).toLocaleString(); // Add commas for big numbers
        });
    }

    updateValue(populationInput, populationValue);
    updateValue(coalInput, coalValue);
    updateValue(solarInput, solarValue);
    updateValue(windInput, windValue);

    // --- 3. Simulation Logic ---
    simulateBtn.addEventListener('click', () => {

        // --- A. Read Values ---
        const population = parseInt(populationInput.value);
        const coalPercent = parseInt(coalInput.value);
        const solarPercent = parseInt(solarInput.value);
        const windPercent = parseInt(windInput.value);
        const transportType = transportInput.value;

        // --- B. Calculate Energy Usage ---
        // Assume each person uses roughly 10 kWh of energy per day
        const energyPerPerson = 10;
        const totalEnergy = population * energyPerPerson;

        // --- C. Calculate CO2 Emissions ---
        // Coal is very dirty (High factor), Solar/Wind are clean (Low factor)
        // Transport also adds to emissions

        // Base emissions from energy (normalized by percentage usage)
        // Note: We divide by 100 because inputs are percentages
        // If percentages exceed 100, it just means "extra capacity" or mix intensity
        const coalEmissionFactor = 0.8; // High CO2
        const renewableEmissionFactor = 0.05; // Very low CO2 (manufacturing only)

        // Calculate emission contribution from each source
        const coalCO2 = totalEnergy * (coalPercent / 100) * coalEmissionFactor;
        const solarCO2 = totalEnergy * (solarPercent / 100) * renewableEmissionFactor;
        const windCO2 = totalEnergy * (windPercent / 100) * renewableEmissionFactor;

        let totalCO2 = coalCO2 + solarCO2 + windCO2;

        // --- D. Transport Impact ---
        // Add variations based on transport choice
        let transportFactor = 1;

        if (transportType === 'car') {
            transportFactor = 2.0; // Cars double the transport pollution
        } else if (transportType === 'public') {
            transportFactor = 1.0; // Baseline
        } else if (transportType === 'electric') {
            transportFactor = 0.5; // Very clean
        }

        // Add transport emissions (scaled by population)
        // Assume transport adds roughly 5kg CO2 per person per day * factor
        const transportCO2 = population * 5 * transportFactor;

        const finalCO2 = totalCO2 + transportCO2;

        // --- E. Determine Pollution Level & Sustainability Score ---

        // Pollution level relates to CO2 but simplified for display
        let pollutionLevel = "Low";
        // We compare emissions per capita to decide level
        const perCapitaCO2 = finalCO2 / population;

        if (perCapitaCO2 > 15) {
            pollutionLevel = "Critical (Smog Alert!)";
        } else if (perCapitaCO2 > 10) {
            pollutionLevel = "High";
        } else if (perCapitaCO2 > 5) {
            pollutionLevel = "Moderate";
        } else {
            pollutionLevel = "Low (Clean Air)";
        }

        // Sustainability Score (0 to 100)
        // Higher emissions = Lower score
        // Let's create a baseline "bad" emission to scale against.
        // Bad scenario: 100% Coal + Cars -> Per capita ~ 8 (energy) + 10 (transport) = 18
        // Good scenario: 100% Solar + EV -> Per capita ~ 0.5 + 2.5 = 3

        // Formula: Score = 100 - (perCapitaCO2 * 5)
        // Clamp it between 0 and 100
        let score = 100 - (perCapitaCO2 * 5);
        if (score < 0) score = 0;
        if (score > 100) score = 100;

        score = Math.round(score); // Remove decimals

        // --- F. Update Results in DOM ---
        energyResult.textContent = totalEnergy.toLocaleString() + " kWh";
        co2Result.textContent = Math.round(finalCO2).toLocaleString() + " kg";
        pollutionResult.textContent = pollutionLevel;
        scoreResult.textContent = score + " / 100";

        // Update color of score
        if (score > 75) {
            scoreResult.style.color = "#27ae60"; // Green
            feedbackMsg.textContent = "Great job! Your city is environmentally sustainable!";
            feedbackMsg.style.color = "#27ae60";
        } else if (score > 40) {
            scoreResult.style.color = "#f39c12"; // Orange
            feedbackMsg.textContent = "Not bad, but try reducing coal or improving transport.";
            feedbackMsg.style.color = "#f39c12";
        } else {
            scoreResult.style.color = "#c0392b"; // Red
            feedbackMsg.textContent = "Warning! High pollution levels. Switch to green energy!";
            feedbackMsg.style.color = "#c0392b";
        }
    });

    // Optional: Run simulation once on load to show initial state
    simulateBtn.click();
});