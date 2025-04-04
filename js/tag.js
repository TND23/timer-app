// Tag Module
// Handles all tag-related functionality

// Tag variables
let tags = [];
let currentWorkTag = null;
let currentBreakTag = null;

// DOM elements
let tagPopupContainer;
let tagSearchInput;
let tagsList;
let newTagInput;
let createTagButton;
let closeTagPopupButton;
let workChooseTagButton;
let breakChooseTagButton;
let workTagDisplay;
let breakTagDisplay;

// Initialize tag module
export function initTagModule(elements) {
    // Store DOM elements
    tagPopupContainer = elements.tagPopupContainer;
    tagSearchInput = elements.tagSearchInput;
    tagsList = elements.tagsList;
    newTagInput = elements.newTagInput;
    createTagButton = elements.createTagButton;
    closeTagPopupButton = elements.closeTagPopupButton;
    workChooseTagButton = elements.workChooseTagButton;
    breakChooseTagButton = elements.breakChooseTagButton;
    workTagDisplay = elements.workTagDisplay;
    breakTagDisplay = elements.breakTagDisplay;
    
    // Ensure tag popup is hidden initially
    if (tagPopupContainer) {
        tagPopupContainer.classList.add('hidden');
    }
    
    // Set up event listeners
    tagSearchInput.addEventListener('input', searchTags);
    createTagButton.addEventListener('click', createNewTag);
    closeTagPopupButton.addEventListener('click', closeTagPopup);
    workChooseTagButton.addEventListener('click', () => openTagPopup('work'));
    breakChooseTagButton.addEventListener('click', () => openTagPopup('break'));
    
    // Note: We don't load tags here because serializationModule might not be available yet
    // Instead, loadTags() will be called explicitly after all modules are initialized
}

// Load tags from server
export function loadTags() {
    if (window.serializationModule) {
        window.serializationModule.loadTags()
            .then(loadedTags => {
                tags = loadedTags;
                displayTags(tags);
            })
            .catch(error => {
                console.error('Error loading tags:', error);
            });
    } else {
        console.warn('Serialization module not available yet. Tags will not be loaded.');
    }
}

// Save tag to server
function saveTag(tag) {
    if (window.serializationModule) {
        window.serializationModule.saveTag(tag)
            .then(updatedTags => {
                tags = updatedTags;
                displayTags(tags);
            })
            .catch(error => {
                console.error('Error saving tag:', error);
            });
    }
}

// Open tag popup
function openTagPopup(timerType) {
    // Store the timer type (work or break) to know which timer we're tagging
    tagPopupContainer.dataset.timerType = timerType;
    
    // Clear search and new tag inputs
    tagSearchInput.value = '';
    newTagInput.value = '';
    
    // Show the popup
    tagPopupContainer.classList.remove('hidden');
    
    // Focus on search input
    tagSearchInput.focus();
    
    // Display all tags
    displayTags(tags);
}

// Close tag popup
function closeTagPopup() {
    if (tagPopupContainer) {
        tagPopupContainer.classList.add('hidden');
    }
}

// Search tags
function searchTags() {
    const searchTerm = tagSearchInput.value.toLowerCase();
    
    if (!searchTerm) {
        displayTags(tags);
        return;
    }
    
    const filteredTags = tags.filter(tag => 
        tag.toLowerCase().includes(searchTerm)
    );
    
    displayTags(filteredTags);
}

// Display tags in the list
function displayTags(tagsToDisplay) {
    // Clear the current list
    tagsList.innerHTML = '';
    
    if (tagsToDisplay.length === 0) {
        const noTagsMessage = document.createElement('div');
        noTagsMessage.className = 'no-tags-message';
        noTagsMessage.textContent = 'No tags found. Create a new one below.';
        tagsList.appendChild(noTagsMessage);
        return;
    }
    
    // Add each tag to the list
    tagsToDisplay.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.textContent = tag;
        
        // Add click event to select the tag
        tagElement.addEventListener('click', () => selectTag(tag));
        
        tagsList.appendChild(tagElement);
    });
}

// Create a new tag
function createNewTag() {
    const newTag = newTagInput.value.trim();
    
    if (!newTag) {
        return;
    }
    
    // Check if tag already exists
    if (tags.includes(newTag)) {
        // Tag already exists, just select it
        selectTag(newTag);
        return;
    }
    
    // Add the new tag
    saveTag(newTag);
    
    // Clear input
    newTagInput.value = '';
    
    // Select the new tag
    selectTag(newTag);
    
    // Refresh the tags list
    displayTags(tags);
}

// Select a tag
function selectTag(tag) {
    const timerType = tagPopupContainer.dataset.timerType;
    
    if (timerType === 'work') {
        currentWorkTag = tag;
        workTagDisplay.textContent = tag;
        workTagDisplay.classList.remove('hidden');
    } else if (timerType === 'break') {
        currentBreakTag = tag;
        breakTagDisplay.textContent = tag;
        breakTagDisplay.classList.remove('hidden');
    }
    
    // Close the popup
    closeTagPopup();
}

// Reset tags for new timer session
export function resetTags() {
    currentWorkTag = null;
    currentBreakTag = null;
    
    if (workTagDisplay) {
        workTagDisplay.textContent = '';
        workTagDisplay.classList.add('hidden');
    }
    
    if (breakTagDisplay) {
        breakTagDisplay.textContent = '';
        breakTagDisplay.classList.add('hidden');
    }
}

// Get current work tag
export function getWorkTag() {
    return currentWorkTag;
}

// Get current break tag
export function getBreakTag() {
    return currentBreakTag;
}

// Export module
export default {
    initTagModule,
    resetTags,
    getWorkTag,
    getBreakTag,
    loadTags
};
