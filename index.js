import './login.js';
import './fileUpload.js';
import './contracts.js';
import './wallet.js';
import './ui.js';
import './encryption.js';

// Function to handle tab clicks
document.querySelectorAll('.modal-step-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active class from all tabs
        document.querySelectorAll('.modal-step-tab').forEach(t => t.classList.remove('active'));
        // Add active class to the clicked tab
        this.classList.add('active');
        
        // Hide all steps
        document.querySelectorAll('.modal-step').forEach(step => step.style.display = 'none');
        // Show the corresponding step
        const stepIndex = Array.from(this.parentNode.children).indexOf(this);
        document.querySelectorAll('.modal-step')[stepIndex].style.display = 'block';
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const desktopBalance = document.getElementById('balance');
    const sidebarBalance = document.getElementById('sidebarBalance');
    const desktopLoginButton = document.getElementById('loginButton');
    const sidebarLoginButton = document.getElementById('sidebarLoginButton');

    // Sync balance and login button for sidebar
    if (desktopBalance && sidebarBalance) {
        sidebarBalance.innerHTML = desktopBalance.innerHTML;
        const profileImageUrl = localStorage.getItem('profile_image_url');
        if (profileImageUrl) {
            desktopLoginButton.style.backgroundImage = `url(${profileImageUrl})`;
            sidebarLoginButton.style.backgroundImage = `url(${profileImageUrl})`;
        }

        sidebarLoginButton.onclick = desktopLoginButton.onclick;
    }

    // Sync balance and Broca balance for sidebar
    const balance = document.getElementById('balance');
    const brocaBalance = document.getElementById('brocaBalance');
    if (balance && sidebarBalance) {
        sidebarBalance.innerHTML = balance.innerHTML;
    }
    if (brocaBalance && sidebarBalance) {
        sidebarBalance.innerHTML = brocaBalance.innerHTML;
    }

    if (desktopLoginButton && sidebarLoginButton) {
        sidebarLoginButton.innerHTML = desktopLoginButton.innerHTML;
        sidebarLoginButton.onclick = desktopLoginButton.onclick;
    }
});
