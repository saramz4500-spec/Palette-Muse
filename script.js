// Store current palette colors globally
let currentColors = [];

// Get DOM elements
const generateBtn = document.getElementById("generateBtn");
const colorPicker = document.getElementById("colorPicker");
const hexInput = document.getElementById("hexInput");
const modeSelect = document.getElementById("modeSelect");
const palette = document.getElementById("palette");
const gradientPreview = document.getElementById("gradientPreview");
const cssOutput = document.getElementById("cssOutput");
const toast = document.getElementById("toast");
const heroCard = document.getElementById("heroCard");

// Event: Click button to generate palette
generateBtn.addEventListener("click", generatePalette);

// Event: Update HEX input when color picker changes
colorPicker.addEventListener("input", function () {
  hexInput.value = colorPicker.value.toUpperCase();
});

// Event: Update color picker when HEX is valid
hexInput.addEventListener("input", function () {
  const value = hexInput.value.trim();

  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    colorPicker.value = value;
  }
});

// Fetch palette from API and update UI
async function generatePalette() {
  const hex = hexInput.value.replace("#", "").trim();
  const mode = modeSelect.value;

  // Validate HEX input
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    showToast("Invalid HEX color");
    return;
  }

  try {
    // AJAX request to Color API
    const response = await fetch(
      `https://www.thecolorapi.com/scheme?hex=${hex}&mode=${mode}&count=5`
    );

    const data = await response.json();

    // Extract colors from API response
    currentColors = data.colors.map(color => color.hex.value);

    // Clear old palette
    palette.innerHTML = "";

    // Dynamically create color cards
    currentColors.forEach(color => {
      palette.innerHTML += `
        <div class="color-card">
          <div class="color-box" style="background:${color}"></div>
          <button onclick="copyColor('${color}')">${color}</button>
        </div>
      `;
    });

    // Create gradient preview
    const gradient = `linear-gradient(135deg, ${currentColors.join(",")})`;

    gradientPreview.style.background = gradient;
    heroCard.style.background = gradient;

    updateCSS();
    showToast("Palette generated");

  } catch (error) {
    console.log(error);
    showToast("API error");
  }
}

// Update CSS variables output
function updateCSS() {
  cssOutput.value = `:root {
  --primary: ${currentColors[0]};
  --secondary: ${currentColors[1]};
  --accent: ${currentColors[2]};
  --soft: ${currentColors[3]};
  --light: ${currentColors[4]};
}`;
}

// Copy single color to clipboard
function copyColor(color) {
  navigator.clipboard.writeText(color);
  showToast("Color copied");
}

// Copy full palette colors
function copyFullPalette() {
  if (currentColors.length === 0) {
    showToast("Generate palette first");
    return;
  }

  navigator.clipboard.writeText(currentColors.join(", "));
  showToast("Palette copied");
}

// Copy generated CSS
function copyCSS() {
  navigator.clipboard.writeText(cssOutput.value);
  showToast("CSS copied");
}

// Generate random color and fetch palette
function randomColor() {
  const randomHex = "#" + Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")
    .toUpperCase();

  hexInput.value = randomHex;
  colorPicker.value = randomHex;

  generatePalette();
}

// Save palette in session storage
function savePalette() {
  if (currentColors.length === 0) {
    showToast("Generate palette first");
    return;
  }

  let saved = JSON.parse(sessionStorage.getItem("palettes")) || [];

  saved.push([...currentColors]);

  sessionStorage.setItem("palettes", JSON.stringify(saved));

  loadSaved();
  showToast("Palette saved");
}

// Load saved palettes and display them
function loadSaved() {
  const savedList = document.getElementById("savedList");
  const saved = JSON.parse(sessionStorage.getItem("palettes")) || [];

  savedList.innerHTML = "";

  if (saved.length === 0) {
    savedList.innerHTML = "<p>No saved palettes yet.</p>";
    return;
  }

  saved.forEach(paletteColors => {
    if (!Array.isArray(paletteColors)) return;

    savedList.innerHTML += `
      <div class="saved-colors">
        ${paletteColors.map(color => `
          <span class="mini-color" style="background:${color}" title="${color}"></span>
        `).join("")}
      </div>
    `;
  });
}

// Show notification message to user
function showToast(message) {
  toast.textContent = message;

  if (message.includes("Invalid") || message.includes("error")) {
    toast.style.background = "rgba(220, 38, 38, 0.9)"; // أحمر
  } else {
    toast.style.background = "rgba(15, 20, 50, 0.9)"; // عادي
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1200);
}


// Clear all saved palettes
function clearSavedPalettes() {
  sessionStorage.removeItem("palettes");
  loadSaved();
  showToast("Saved palettes cleared");
}

// Share palette (copy text)
function sharePalette() {
  if (currentColors.length === 0) {
    showToast("Generate palette first");
    return;
  }

  const shareText = `My color palette: ${currentColors.join(", ")}`;
  navigator.clipboard.writeText(shareText);
  showToast("Palette copied to share");
}

// Event: Double click copies full palette
palette.addEventListener("dblclick", function () {
  copyFullPalette();
});

// Initial load
generatePalette();
loadSaved();