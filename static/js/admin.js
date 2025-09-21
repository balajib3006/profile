// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin functionality
    initializeFlashMessages();
    initializeDynamicLists();
    initializeFormValidation();
    initializeDataTables();
    initializeProficiencySlider();
});

// Flash Messages
function initializeFlashMessages() {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(message => {
        const closeBtn = message.querySelector('.flash-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                message.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    message.remove();
                }, 300);
            });
        }
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (message.parentNode) {
                        message.remove();
                    }
                }, 300);
            }
        }, 5000);
    });
}

// Dynamic Lists (for responsibilities, technologies, features, etc.)
function initializeDynamicLists() {
    document.addEventListener('click', function(e) {
        // Add item button
        if (e.target.classList.contains('add-item') || e.target.closest('.add-item')) {
            e.preventDefault();
            const button = e.target.classList.contains('add-item') ? e.target : e.target.closest('.add-item');
            const targetId = button.getAttribute('data-target');
            const container = document.getElementById(targetId);
            
            if (container) {
                const newItem = createListItem(container);
                container.appendChild(newItem);
                
                // Focus on the new input
                const newInput = newItem.querySelector('input, textarea');
                if (newInput) {
                    newInput.focus();
                }
            }
        }
        
        // Remove item button
        if (e.target.classList.contains('remove-item') || e.target.closest('.remove-item')) {
            e.preventDefault();
            const button = e.target.classList.contains('remove-item') ? e.target : e.target.closest('.remove-item');
            const container = button.closest('.dynamic-list');
            const item = button.closest('.list-item');
            
            if (container && item && container.children.length > 1) {
                item.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    item.remove();
                }, 300);
            }
        }
    });
}

function createListItem(container) {
    const existingItem = container.querySelector('.list-item');
    const newItem = document.createElement('div');
    newItem.className = 'list-item';
    
    // Determine the input type and name based on existing items
    let inputHtml = '';
    if (existingItem) {
        const existingInput = existingItem.querySelector('input, textarea');
        if (existingInput) {
            const tagName = existingInput.tagName.toLowerCase();
            const name = existingInput.name;
            const placeholder = existingInput.placeholder;
            
            if (tagName === 'textarea') {
                inputHtml = `<textarea name="${name}" placeholder="${placeholder}"></textarea>`;
            } else {
                inputHtml = `<input type="text" name="${name}" placeholder="${placeholder}">`;
            }
        }
    } else {
        // Default input
        inputHtml = '<input type="text" name="items[]" placeholder="Enter item">';
    }
    
    newItem.innerHTML = `
        ${inputHtml}
        <button type="button" class="btn btn-sm btn-danger remove-item">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    return newItem;
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.admin-form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });
        
        form.addEventListener('submit', (e) => {
            let isValid = true;
            
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fix the errors in the form', 'error');
                
                // Scroll to first error
                const firstError = form.querySelector('.field-error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // URL validation
    if (field.type === 'url' && value) {
        try {
            new URL(value);
        } catch {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
        }
    }
    
    // Number validation
    if (field.type === 'number' && value) {
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        const numValue = parseFloat(value);
        
        if (isNaN(numValue)) {
            isValid = false;
            errorMessage = 'Please enter a valid number';
        } else if (min !== null && numValue < parseFloat(min)) {
            isValid = false;
            errorMessage = `Value must be at least ${min}`;
        } else if (max !== null && numValue > parseFloat(max)) {
            isValid = false;
            errorMessage = `Value must be at most ${max}`;
        }
    }
    
    showFieldValidation(field, isValid, errorMessage);
    return isValid;
}

function showFieldValidation(field, isValid, errorMessage) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    if (!isValid) {
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = errorMessage;
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: fadeInUp 0.3s ease;
        `;
        field.parentNode.appendChild(errorDiv);
    } else if (field.value.trim()) {
        field.style.borderColor = '#10b981';
        field.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
    } else {
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }
}

function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '';
    field.style.boxShadow = '';
}

// Data Tables
function initializeDataTables() {
    const tables = document.querySelectorAll('.data-table table');
    
    tables.forEach(table => {
        // Add sorting functionality
        const headers = table.querySelectorAll('th');
        headers.forEach((header, index) => {
            if (header.textContent.trim() !== 'Actions') {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => sortTable(table, index));
                
                // Add sort indicator
                const sortIcon = document.createElement('i');
                sortIcon.className = 'fas fa-sort sort-icon';
                sortIcon.style.marginLeft = '0.5rem';
                sortIcon.style.opacity = '0.5';
                header.appendChild(sortIcon);
            }
        });
        
        // Add search functionality if there are many rows
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length > 5) {
            addTableSearch(table);
        }
    });
}

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const header = table.querySelectorAll('th')[columnIndex];
    const sortIcon = header.querySelector('.sort-icon');
    
    // Clear other sort indicators
    table.querySelectorAll('.sort-icon').forEach(icon => {
        if (icon !== sortIcon) {
            icon.className = 'fas fa-sort sort-icon';
        }
    });
    
    // Determine sort direction
    let ascending = true;
    if (sortIcon.classList.contains('fa-sort-up')) {
        ascending = false;
        sortIcon.className = 'fas fa-sort-down sort-icon';
    } else {
        sortIcon.className = 'fas fa-sort-up sort-icon';
    }
    
    // Sort rows
    rows.sort((a, b) => {
        const aText = a.cells[columnIndex].textContent.trim();
        const bText = b.cells[columnIndex].textContent.trim();
        
        // Try to parse as numbers
        const aNum = parseFloat(aText);
        const bNum = parseFloat(bText);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return ascending ? aNum - bNum : bNum - aNum;
        }
        
        // String comparison
        return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });
    
    // Reorder rows in DOM
    rows.forEach(row => tbody.appendChild(row));
}

function addTableSearch(table) {
    const tableContainer = table.closest('.data-table');
    const searchContainer = document.createElement('div');
    searchContainer.className = 'table-search';
    searchContainer.style.cssText = `
        padding: 1rem;
        border-bottom: 1px solid var(--admin-border-color);
        background: var(--admin-bg-primary);
    `;
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.style.cssText = `
        width: 100%;
        max-width: 300px;
        padding: 0.5rem;
        border: 1px solid var(--admin-border-color);
        border-radius: 0.375rem;
        font-size: 0.875rem;
    `;
    
    searchContainer.appendChild(searchInput);
    tableContainer.insertBefore(searchContainer, table);
    
    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// Proficiency Slider
function initializeProficiencySlider() {
    const proficiencySlider = document.getElementById('proficiency');
    if (proficiencySlider) {
        const valueDisplay = document.getElementById('proficiency-value');
        const fillBar = document.getElementById('proficiency-fill');
        
        proficiencySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            if (valueDisplay) valueDisplay.textContent = value + '%';
            if (fillBar) fillBar.style.width = value + '%';
        });
    }
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `flash-message flash-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="flash-close">&times;</button>
    `;
    
    let container = document.querySelector('.flash-messages');
    if (!container) {
        container = document.createElement('div');
        container.className = 'flash-messages';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.flash-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
}

function confirmDelete(message = 'Are you sure you want to delete this item?') {
    return confirm(message);
}

// Auto-save functionality for forms
function initializeAutoSave() {
    const forms = document.querySelectorAll('.admin-form[data-autosave]');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea, select');
        const formId = form.id || 'form-' + Math.random().toString(36).substr(2, 9);
        
        // Load saved data
        const savedData = localStorage.getItem(`autosave-${formId}`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(name => {
                    const input = form.querySelector(`[name="${name}"]`);
                    if (input && input.type !== 'file') {
                        input.value = data[name];
                    }
                });
            } catch (e) {
                console.error('Error loading autosave data:', e);
            }
        }
        
        // Save data on input
        inputs.forEach(input => {
            input.addEventListener('input', debounce(() => {
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                localStorage.setItem(`autosave-${formId}`, JSON.stringify(data));
            }, 1000));
        });
        
        // Clear autosave on successful submit
        form.addEventListener('submit', () => {
            localStorage.removeItem(`autosave-${formId}`);
        });
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.9); }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .sort-icon {
        transition: all 0.2s ease;
    }
    
    .field-error {
        animation: fadeInUp 0.3s ease;
    }
    
    .list-item {
        animation: fadeInUp 0.3s ease;
    }
    
    .data-table tr:hover {
        background-color: var(--admin-bg-primary);
        transition: background-color 0.2s ease;
    }
    
    .btn:hover {
        transform: translateY(-1px);
        transition: all 0.2s ease;
    }
    
    .stat-card:hover {
        transform: translateY(-2px);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);