// DOM Elements
const addNoteBtn = document.getElementById('addNoteBtn');
const notesContainer = document.getElementById('notesContainer');
const noteModal = document.getElementById('noteModal');
const closeBtn = document.querySelector('.close-btn');
const saveNoteBtn = document.getElementById('saveNote');
const cancelNoteBtn = document.getElementById('cancelNote');
const noteTitleInput = document.getElementById('noteTitle');
const noteContentInput = document.getElementById('noteContent');
const modalTitle = document.getElementById('modalTitle');

// State
let notes = JSON.parse(localStorage.getItem('notes')) || [];
let isEditing = false;
let currentNoteId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
    setupEventListeners();
});

function setupEventListeners() {
    // Add new note button
    addNoteBtn.addEventListener('click', openNoteModal);
    
    // Modal buttons
    closeBtn.addEventListener('click', closeNoteModal);
    saveNoteBtn.addEventListener('click', saveNote);
    cancelNoteBtn.addEventListener('click', closeNoteModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === noteModal) {
            closeNoteModal();
        }
    });
}

// Load all notes from localStorage
function loadNotes() {
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        showEmptyState();
        return;
    }
    
    notes.forEach(note => {
        createNoteElement(note);
    });
}

// Create a note element and add it to the DOM
function createNoteElement(note) {
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.innerHTML = `
        <h3 class="note-title">${escapeHtml(note.title)}</h3>
        <p class="note-content">${formatNoteContent(note.content)}</p>
        <div class="note-date">${formatDate(note.updatedAt)}</div>
        <div class="note-actions">
            <button class="edit-btn" data-id="${note.id}">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="delete-btn" data-id="${note.id}">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    // Add event listeners to the buttons
    const editBtn = noteElement.querySelector('.edit-btn');
    const deleteBtn = noteElement.querySelector('.delete-btn');
    
    editBtn.addEventListener('click', () => editNote(note.id));
    deleteBtn.addEventListener('click', () => deleteNote(note.id));
    
    // Add click event to the note for viewing
    noteElement.addEventListener('click', (e) => {
        // Prevent triggering when clicking on buttons
        if (!e.target.closest('button')) {
            viewNote(note.id);
        }
    });
    
    notesContainer.appendChild(noteElement);
}

// Open modal for adding a new note
function openNoteModal() {
    isEditing = false;
    currentNoteId = null;
    modalTitle.textContent = 'New Note';
    noteTitleInput.value = '';
    noteContentInput.value = '';
    noteModal.style.display = 'flex';
    noteTitleInput.focus();
}

// Open modal for viewing/editing an existing note
function viewNote(id) {
    const note = notes.find(note => note.id === id);
    if (!note) return;
    
    isEditing = true;
    currentNoteId = id;
    modalTitle.textContent = 'View/Edit Note';
    noteTitleInput.value = note.title;
    noteContentInput.value = note.content;
    noteModal.style.display = 'flex';
}

// Edit an existing note
function editNote(id) {
    viewNote(id);
    noteTitleInput.focus();
}

// Save a new or updated note
function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    if (!title) {
        alert('Please enter a title for your note');
        return;
    }
    
    const now = new Date().toISOString();
    
    if (isEditing && currentNoteId) {
        // Update existing note
        const noteIndex = notes.findIndex(note => note.id === currentNoteId);
        if (noteIndex > -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title,
                content,
                updatedAt: now
            };
        }
    } else {
        // Add new note
        const newNote = {
            id: Date.now().toString(),
            title,
            content,
            createdAt: now,
            updatedAt: now
        };
        notes.unshift(newNote); // Add to the beginning of the array
    }
    
    saveToLocalStorage();
    closeNoteModal();
    loadNotes();
}

// Delete a note
function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    notes = notes.filter(note => note.id !== id);
    saveToLocalStorage();
    loadNotes();
}

// Close the note modal
function closeNoteModal() {
    noteModal.style.display = 'none';
}

// Save notes to localStorage
function saveToLocalStorage() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Show empty state when there are no notes
function showEmptyState() {
    notesContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-sticky-note"></i>
            <h3>No Notes Yet</h3>
            <p>Click the "Add Note" button to create your first note!</p>
        </div>
    `;
}

// Helper function to format date
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format note content (show first 150 characters with ellipsis)
function formatNoteContent(content) {
    const maxLength = 150;
    if (content.length <= maxLength) return escapeHtml(content);
    return escapeHtml(content.substring(0, maxLength)) + '...';
}

// Helper function to escape HTML (prevent XSS)
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
