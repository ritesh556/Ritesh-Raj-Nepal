// script.js

document.addEventListener('DOMContentLoaded', function () {
    // --- DOM Elements ---
    const fileExplorerItems = document.querySelectorAll('.file-explorer-item');
    const editorTabsContainer = document.getElementById('editor-tabs');
    const editorPanes = document.querySelectorAll('.editor-pane');
    const titleBarPath = document.getElementById('title-bar-path');
    const terminalBody = document.getElementById('terminal-body');
    const terminalInput = document.getElementById('terminal-input');

    // New: Get the file icon and the main container
    const fileActivityIcon = document.querySelector('.activity-bar-top .icon.active');
    const vscodeContainer = document.querySelector('.vscode-container');

    // --- State ---
    let openFiles = new Set();
    let activeFile = 'welcome';
    let isSidebarVisible = true; // New state variable for sidebar visibility

    // --- File Metadata ---
    const fileMetadata = {
        profile: { icon: 'https://img.icons8.com/color/48/html-5--v1.png', ext: 'html' },
        about: { icon: 'https://img.icons8.com/office/48/markdown.png', ext: 'md' },
        skills: { icon: 'https://img.icons8.com/color/48/css3.png', ext: 'css' },
        projects: { icon: 'https://img.icons8.com/color/48/json.png', ext: 'json' },
        experience: { icon: 'https://img.icons8.com/color/48/javascript--v1.png', ext: 'js' },
        achievements: { icon: 'https://img.icons8.com/color/48/python--v1.png', ext: 'py' },
        contact: { icon: 'https://img.icons8.com/fluency/48/contact-card.png', ext: 'js' }
    };

    // --- Functions ---
    function setActive(fileId) {
        activeFile = fileId;

        // Update tabs
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.tab[data-file="${fileId}"]`);
        if (activeTab) activeTab.classList.add('active');

        // Update sidebar
        fileExplorerItems.forEach(i => i.classList.remove('active-in-sidebar'));
        const activeExplorerItem = document.querySelector(`.file-explorer-item[data-file="${fileId}"]`);
        if (activeExplorerItem) activeExplorerItem.classList.add('active-in-sidebar');

        // Update panes
        editorPanes.forEach(p => p.classList.remove('active'));
        document.getElementById(`${fileId}-pane`).classList.add('active');

        // Update title bar
        if (fileId !== 'welcome') {
            const meta = fileMetadata[fileId];
            titleBarPath.textContent = `Ritesh/${fileId}.${meta.ext} - VS Code Portfolio`;
        } else {
            titleBarPath.textContent = `[Ritesh Raj Nepal - VS Code Portfolio]`;
        }
    }

    function openFile(fileId) {
        if (!openFiles.has(fileId)) {
            openFiles.add(fileId);
            createTab(fileId);
        }
        setActive(fileId);
    }

    function closeFile(fileId, event) {
        event.stopPropagation();

        openFiles.delete(fileId);
        document.querySelector(`.tab[data-file="${fileId}"]`).remove();

        if (activeFile === fileId) {
            const remainingFiles = Array.from(openFiles);
            if (remainingFiles.length > 0) {
                setActive(remainingFiles[remainingFiles.length - 1]);
            } else {
                setActive('welcome');
            }
        }
    }

    function createTab(fileId) {
        const meta = fileMetadata[fileId];
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.file = fileId;
        tab.innerHTML = `
            <img src="${meta.icon}" class="file-icon" alt="${fileId} icon">
            <span>${fileId}.${meta.ext}</span>
            <span class="close-icon" data-file="${fileId}">&times;</span>
        `;

        tab.addEventListener('click', () => setActive(fileId));
        tab.querySelector('.close-icon').addEventListener('click', (e) => closeFile(fileId, e));

        editorTabsContainer.appendChild(tab);
    }

    // New: Function to toggle sidebar visibility
    function toggleSidebar() {
        isSidebarVisible = !isSidebarVisible;
        if (isSidebarVisible) {
            vscodeContainer.classList.remove('sidebar-hidden');
            fileActivityIcon.classList.add('active'); // Set file icon as active
        } else {
            vscodeContainer.classList.add('sidebar-hidden');
            fileActivityIcon.classList.remove('active'); // Deactivate file icon
        }
    }

    // --- Terminal Logic ---
    function processTerminalCommand(command) {
        const commandOutput = document.createElement('div');
        commandOutput.className = 'terminal-line';
        let response = '';

        switch (command.toLowerCase()) {
            case 'help':
                response = `Available commands: 'whoami', 'skills', 'projects', 'contact', 'date', 'sudo', 'clear'`;
                break;
            case 'whoami':
                response = `You're checking out the portfolio of Ritesh Raj Nepal, a Full-Stack Developer and avid Chess player from Biratnagar, Nepal.`;
                break;
            case 'date':
                response = `Today is ${new Date().toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}. A great day to hire a developer!`;
                break;
            case 'sudo':
                response = `<span style="color: red;">ERROR:</span> User is not in the sudoers file. This incident will be reported.`;
                break;
            case 'skills':
            case 'projects':
            case 'contact':
                response = `Pro-tip: For a better view, just click on the '${command}.js' file in the sidebar!`;
                openFile(command);
                break;
            case 'clear':
                terminalBody.innerHTML = `
                    <div class="terminal-line"><span class="code-text">Terminal cleared.</span></div>
                    <div class="terminal-input-line">
                        <span class="terminal-prompt">user@portfolio:~$</span>
                        <input type="text" class="terminal-input" id="terminal-input" autofocus />
                    </div>`;
                // Re-assign the input element after clearing
                document.getElementById('terminal-input').addEventListener('keydown', handleTerminalInput);
                return;
            default:
                response = `<span style="color: orange;">COMMAND NOT FOUND:</span> ${command}. Try 'help'.`;
                break;
        }
        commandOutput.innerHTML = response;
        terminalBody.insertBefore(commandOutput, terminalBody.lastElementChild);
    }

    function handleTerminalInput(e) {
        if (e.key === 'Enter') {
            const command = e.target.value.trim();
            if (command) {
                const enteredLine = document.createElement('div');
                enteredLine.className = 'terminal-line';
                enteredLine.innerHTML = `<span class="terminal-prompt">user@portfolio:~$</span>${command}`;
                terminalBody.insertBefore(enteredLine, terminalBody.lastElementChild);

                processTerminalCommand(command);
                e.target.value = '';
            }
            // Scroll to bottom
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }

    // --- Initial Setup ---
    fileExplorerItems.forEach(item => {
        item.addEventListener('click', () => openFile(item.dataset.file));
    });

    terminalInput.addEventListener('keydown', handleTerminalInput);

    // New: Add event listener to the file activity bar icon
    fileActivityIcon.addEventListener('click', toggleSidebar);

    // Set initial state
    setActive('welcome');
});
// script.js

document.addEventListener('DOMContentLoaded', () => {
    const settingsToggleBtn = document.getElementById('settings-toggle');
    const settingsMenu = document.getElementById('settings-menu');
    const closeSettingsBtn = document.getElementById('close-settings');
    const body = document.body;

    // Function to open the settings menu
    function openSettingsMenu() {
        settingsMenu.classList.add('active');
        // Optional: Add a class to body to prevent scrolling if the menu is full screen
        body.classList.add('no-scroll'); 
    }

    // Function to close the settings menu
    function closeSettingsMenu() {
        settingsMenu.classList.remove('active');
        body.classList.remove('no-scroll');
    }

    // Toggle settings menu on button click
    settingsToggleBtn.addEventListener('click', () => {
        if (settingsMenu.classList.contains('active')) {
            closeSettingsMenu();
        } else {
            openSettingsMenu();
        }
    });

    // Close settings menu when the close button is clicked
    closeSettingsBtn.addEventListener('click', closeSettingsMenu);

    // Close settings menu when clicking outside the menu content
    settingsMenu.addEventListener('click', (event) => {
        if (event.target === settingsMenu) { // Only if clicked directly on the overlay, not content
            closeSettingsMenu();
        }
    });

    // Close settings menu when Escape key is pressed
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && settingsMenu.classList.contains('active')) {
            closeSettingsMenu();
        }
    });

    // Optional: Prevent scrolling when menu is open (add this to your CSS as well if using)
    // body.no-scroll { overflow: hidden; } 
});