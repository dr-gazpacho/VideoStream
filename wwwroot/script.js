// ---- Test Button
function handleButtonClick() {
    console.log('get fucked buddy')
}

const button = document.querySelector('#clickable');
button.addEventListener('click', handleButtonClick);

// ---- Drag and Drop
const dropZone = document.getElementById("drop-zone");

const preview = document.getElementById("preview");

const fileInput = document.getElementById("file-input");

const clearBtn = document.getElementById("clear-btn");


clearBtn.addEventListener("click", () => {
    for (const img of preview.querySelectorAll("img")) {
        URL.revokeObjectURL(img.src);
    }
    preview.textContent = "";
});


fileInput.addEventListener("change", (e) => {
    displayImages(e.target.files);
});

// can attach an event listener to the entire window to disable default
window.addEventListener("drop", (e) => {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
        e.preventDefault();
    }
});

window.addEventListener("dragover", (e) => {
    const fileItems = [...e.dataTransfer.items].filter(
        (item) => item.kind === "file",
    );
    if (fileItems.length > 0) {
        e.preventDefault();
        if (!dropZone.contains(e.target)) {
            e.dataTransfer.dropEffect = "none";
        }
    }
});

dropZone.addEventListener("drop", dropHandler);

dropZone.addEventListener("dragover", (e) => {
    const fileItems = [...e.dataTransfer.items].filter(
        (item) => item.kind === "file",
    );
    if (fileItems.length > 0) {
        e.preventDefault();
        if (fileItems.some((item) => item.type.startsWith("image/") || item.type.startsWith("video/"))) {
            e.dataTransfer.dropEffect = "copy";
        } else {
            fileItems.map((item) => console.log(item.type))
            e.dataTransfer.dropEffect = "none";
        }
    }
});

function displayImages(files) {
    for (const file of files) {
        if (file.type.startsWith("image/")) {
            const li = document.createElement("li");
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            li.appendChild(img);
            li.appendChild(document.createTextNode(file.name));
            preview.appendChild(li);
        } else if (file.type.startsWith("video/")) {
            const li = document.createElement("li");
            const video = document.createElement("video");
            video.addEventListener("error", () => {
                console.log("video error:", video.error.code, video.error.message);
            });
            video.src = URL.createObjectURL(file);
            video.controls = true; //video.setAttribute("controls", "") empty string also means true
            li.appendChild(video);
            li.appendChild(document.createTextNode(file.name));
            preview.appendChild(li);
        }
    }
}

function dropHandler(ev) {
    ev.preventDefault();
    const files = [...ev.dataTransfer.items]
        .map((item) => item.getAsFile())
        .filter((file) => file);
    displayImages(files);
}