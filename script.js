// ---------- Element references ----------
const form = document.getElementById("note-form");
const noteInput = document.getElementById("note-input");
const categorySelect = document.getElementById("note-category");
const errorMessage = document.getElementById("error-message");
const searchInput = document.getElementById("search-input");
const noteCount = document.getElementById("note-count");
const notesList = document.getElementById("notes-list");
const clearAllBtn = document.getElementById("clear-all-btn");

const STORAGE_KEY = "quicknotes";
const MAX_LENGTH = 200;

// ---------- Task 5: Persistence (load) ----------
// Load saved notes when the page opens. If nothing is saved, or the data is
// corrupted, start with an empty array instead of crashing.
function loadNotes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

// Task 5: Persistence (save). Called whenever the notes array changes.
function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// The notes array holds every note object: { id, text, category, createdAt }
let notes = loadNotes();

// ---------- Task 4: Note count ----------
// Shows "You have no notes yet.", "You have 1 note." or "You have N notes."
// It uses the TOTAL number of notes, not just the ones matching a search.
function updateCount() {
  if (notes.length === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (notes.length === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${notes.length} notes.`;
  }
}

// ---------- Task 3: Rendering ----------
// Builds one note card showing the text, category label, date and a Delete button.
// textContent is used (not innerHTML) so typed text can never inject HTML.
function createNoteCard(note) {
  const li = document.createElement("li");
  // category-personal / category-work / category-study gives the coloured border
  li.className = `note-card category-${note.category}`;

  const text = document.createElement("p");
  text.textContent = note.text;

  const meta = document.createElement("div");
  meta.className = "note-meta";

  const category = document.createElement("span");
  category.className = "note-category";
  category.textContent = note.category;

  const date = document.createElement("span");
  date.textContent = note.createdAt;

  // Task 4: each Delete button stores its own note's id
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.dataset.id = note.id;
  deleteBtn.textContent = "Delete";

  meta.append(category, date, deleteBtn);
  li.append(text, meta);
  return li;
}

// Re-draws the list. Task 5: if the search box has text, only notes whose
// text contains the search words (case-insensitive) are shown.
function renderNotes() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const visibleNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(searchTerm)
  );

  notesList.innerHTML = "";

  // Task 5: a search that finds nothing shows a message inside the list
  if (notes.length > 0 && visibleNotes.length === 0) {
    const li = document.createElement("li");
    li.className = "no-results";
    li.textContent = "No notes match your search.";
    notesList.appendChild(li);
  } else {
    visibleNotes.forEach((note) => notesList.appendChild(createNoteCard(note)));
  }

  updateCount();
}

// ---------- Task 3 + Task 4: Add a note with validation ----------
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page from reloading

  const text = noteInput.value.trim(); // spaces-only counts as empty

  // Task 4: empty (or only spaces) note
  if (text === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  // Task 4: note longer than 200 characters
  if (text.length > MAX_LENGTH) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  // Task 3: create the note object with id, text, category and createdAt
  const note = {
    id: Date.now(), // unique enough for a single user
    text: text,
    category: categorySelect.value,
    createdAt: new Date().toLocaleString() // readable date and time
  };

  notes.push(note);
  saveNotes(); // Task 5: persist after every change

  // Task 4: clear the error once a valid note is added
  errorMessage.textContent = "";

  // Task 3: clear the input after adding
  noteInput.value = "";

  renderNotes();
});

// ---------- Task 4: Delete a single note ----------
// Event delegation: one listener on the list handles every Delete button,
// including ones created later.
notesList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-btn")) {
    const id = Number(event.target.dataset.id);
    notes = notes.filter((note) => note.id !== id); // remove only this note
    saveNotes();
    renderNotes(); // also refreshes the count
  }
});

// ---------- Task 5: Live search ----------
// Re-render on every keystroke so the list filters as the user types.
searchInput.addEventListener("input", renderNotes);

// ---------- Bonus: Clear all with confirmation ----------
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) {
    return; // nothing to delete
  }
  if (confirm("Delete all notes?")) {
    notes = [];
    saveNotes();
    renderNotes();
  }
});

// ---------- Initial render ----------
// Show any saved notes and the correct count as soon as the page loads.
renderNotes();
