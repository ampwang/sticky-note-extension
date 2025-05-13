function createNote(id, contentText = "", position = { top: 50, left: 50 }, zIndex = 1) {
    const note = document.createElement("div");
    note.className = "sticky-note";
    note.style.top = position.top + "px";
    note.style.left = position.left + "px";
    note.setAttribute("data-id", id);
    note.style.zIndex = zIndex;

    // Track highest z-index
    if (zIndex > highestZ) {
        highestZ = zIndex;
    }

    // Top bar
    const topBar = document.createElement("div");
    topBar.className = "top-bar";

    const minimizeBtn = document.createElement("button");
    minimizeBtn.innerText = "—";
    minimizeBtn.className = "note-btn";

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "×";
    closeBtn.className = "note-btn";

    topBar.appendChild(minimizeBtn);
    topBar.appendChild(closeBtn);

    // Content
    const content = document.createElement("div");
    content.className = "note-content";
    content.contentEditable = true;
    content.innerText = contentText;
    content.placeholder = "Type here..."; // optional, though not visible in contentEditable

    note.appendChild(topBar);
    note.appendChild(content);
    document.body.appendChild(note);

    // Bring to front on click
    note.addEventListener("mousedown", () => {
        highestZ++;
        note.style.zIndex = highestZ;
        saveNote(id, {
            content: content.innerText.trim(),
            top: note.offsetTop,
            left: note.offsetLeft,
            zIndex: highestZ,
        });
    });

    // Save on blur
    content.addEventListener("blur", () => {
        saveNote(id, {
            content: content.innerText.trim(),
            top: note.offsetTop,
            left: note.offsetLeft,
            zIndex: parseInt(note.style.zIndex),
        });
    });

    // Drag logic
    let isDragging = false;
    let offsetX, offsetY;

    topBar.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        note.style.cursor = "move";
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            note.style.left = e.pageX - offsetX + "px";
            note.style.top = e.pageY - offsetY + "px";
        }
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            note.style.cursor = "default";
            saveNote(id, {
                content: content.innerText.trim(),
                top: note.offsetTop,
                left: note.offsetLeft,
                zIndex: parseInt(note.style.zIndex),
            });
        }
    });

    // Minimize
    let isMinimized = false;
    minimizeBtn.addEventListener("click", () => {
        isMinimized = !isMinimized;
        content.style.display = isMinimized ? "none" : "block";
        minimizeBtn.innerText = isMinimized ? "+" : "—";
    });

    // Close
    closeBtn.addEventListener("click", () => {
        note.remove();
        deleteNote(id);
    });
}

// Save a single note
function saveNote(id, data) {
    const notes = JSON.parse(localStorage.getItem("stickyNotes") || "{}");
    notes[id] = data;
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
}

// Delete a note
function deleteNote(id) {
    const notes = JSON.parse(localStorage.getItem("stickyNotes") || "{}");
    delete notes[id];
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
}

// Load all notes
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem("stickyNotes") || "{}");
    Object.entries(notes).forEach(([id, { content, top, left, zIndex }]) => {
        createNote(id, content, { top, left }, zIndex || 1);
    });
}

// Create new note with unique ID
function createNewNote() {
    const id = Date.now().toString();

    // Shift position
    lastNotePosition.top += offsetStep;
    lastNotePosition.left += offsetStep;

    // Wrap around if off-screen
    if (lastNotePosition.left > window.innerWidth - 220) lastNotePosition.left = 50;
    if (lastNotePosition.top > window.innerHeight - 220) lastNotePosition.top = 50;

    highestZ++;
    createNote(id, "", lastNotePosition, highestZ);
    saveNote(id, {
        content: "",
        top: lastNotePosition.top,
        left: lastNotePosition.left,
        zIndex: highestZ,
    });
}

let lastNotePosition = { top: 50, left: 50 };
const offsetStep = 30; // How much to offset each new note
let highestZ = 1;

// Add "New Note" button
const newNoteBtn = document.createElement("button");
newNoteBtn.innerText = "➕ New Note";
newNoteBtn.style.position = "fixed";
newNoteBtn.style.bottom = "20px";
newNoteBtn.style.right = "20px";
newNoteBtn.style.zIndex = "100000";
newNoteBtn.style.padding = "10px";
newNoteBtn.style.backgroundColor = "#ffc107";
newNoteBtn.style.border = "none";
newNoteBtn.style.borderRadius = "6px";
newNoteBtn.style.cursor = "pointer";

newNoteBtn.addEventListener("click", createNewNote);
document.body.appendChild(newNoteBtn);

// Load saved notes
loadNotes();