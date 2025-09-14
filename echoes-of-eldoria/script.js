let currentSceneId = "start";
let storyData = null;
let health = 100;

function getScreenCategory() {
    const width = window.innerWidth;
    if (width >= 1024) return "desktop";
    if (width >= 768) return "tablet";
    return "mobile";
}

function applyButtonStyles(btn) {
    if (!storyData || !storyData.config.ui.buttonResponsive) return;
    const category = getScreenCategory();
    const styles = storyData.config.ui.buttonResponsive[category];
    if (styles) {
        btn.style.padding = styles.padding;
        btn.style.fontSize = styles.fontSize;
        btn.style.maxWidth = styles.maxWidth;
    }
}

function loadScene(sceneId) {
    const scene = storyData.scenes.find(s => s.id === sceneId);
    if (!scene) {
        // If scene not found, show error message and stop loading
        const textEl = document.getElementById("scene-text");
        textEl.innerText = "Error: Scene not found.";
        const choicesEl = document.getElementById("choices");
        choicesEl.innerHTML = "";
        return;
    }

    // Smooth background change
    const bg = document.getElementById("background");
    const newBg = scene.background ? `url(${scene.background})` : "";
    if (newBg !== bg.style.backgroundImage) {
        bg.style.opacity = 0;
        setTimeout(() => {
            bg.style.backgroundImage = newBg;
            bg.style.opacity = 1;
        }, 300);
    }

    // Scene text with blur effect
    const textEl = document.getElementById("scene-text");
    textEl.classList.add("blur");
    setTimeout(() => {
        textEl.innerText = scene.text;
        textEl.classList.remove("blur");
    }, 300);

    // Choices
    const choicesEl = document.getElementById("choices");
    choicesEl.innerHTML = "";
    if (!scene.choices || scene.choices.length === 0) {
        const btn = document.createElement("button");
        btn.classList.add("choice-btn");
        btn.innerText = "Restart Adventure";
        btn.onclick = () => {
            health = 100;
            updateHealthBar();
            loadScene("start");
        };
        choicesEl.appendChild(btn);
        return;
    }
    scene.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.classList.add("choice-btn");
        btn.innerText = choice.text;
        applyButtonStyles(btn);
        btn.onclick = () => {
            if (choice.healthDeduct) {
                health -= choice.healthDeduct;
                if (health <= 0) {
                    health = 0;
                    updateHealthBar();
                    loadScene("game_over");
                    return;
                }
                updateHealthBar();
            }
            // Use nextScene to load the next scene, not choice.id
            if (choice.nextScene) {
                loadScene(choice.nextScene);
            } else {
                console.error("Choice missing nextScene:", choice);
            }
        };
        choicesEl.appendChild(btn);
    });
}

function updateHealthBar() {
    const fillEl = document.getElementById("health-fill");
    const textEl = document.getElementById("health-text");
    fillEl.style.width = health + "%";
    textEl.innerText = "Health: " + health;
}

function fetchStory() {
    // Use fetch with a relative path, but if running locally via file:// protocol, this will fail due to CORS.
    // Suggestion: Use a local server or fallback to embedded story data.
    fetch('story.json')
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            storyData = data;
            loadScene(currentSceneId);
            updateHealthBar();
            console.log("Story loaded:", data);
            // Add resize listener to update button styles dynamically
            window.addEventListener('resize', () => {
                const buttons = document.querySelectorAll('.choice-btn');
                buttons.forEach(applyButtonStyles);
            });
        })
        .catch(err => {
            console.error("Fetch failed:", err);
            // Fallback: Show error message in UI
            const textEl = document.getElementById("scene-text");
            textEl.innerText = "Failed to load story data. Please run on a local server.";
            const choicesEl = document.getElementById("choices");
            choicesEl.innerHTML = "";
        });
}

// Call fetchStory on script load
fetchStory();
