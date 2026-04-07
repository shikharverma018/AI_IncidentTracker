// Helper to show modern toasts
function showSystemToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full flex items-center gap-3 border transition-all duration-300 transform -translate-y-4 opacity-0`;
    
    if (type === 'info') {
        toast.className += ' bg-primary/10 text-primary border-primary/30 shadow-[0_0_20px_rgba(142,255,113,0.2)]';
        toast.innerHTML = `<span class="material-symbols-outlined text-sm">settings_suggest</span><span class="text-xs font-black tracking-widest uppercase">${message}</span>`;
    } else if (type === 'warn') {
        toast.className += ' bg-secondary/10 text-secondary border-secondary/30 shadow-[0_0_20px_rgba(255,113,102,0.2)]';
        toast.innerHTML = `<span class="material-symbols-outlined text-sm">security_update_warning</span><span class="text-xs font-black tracking-widest uppercase">${message}</span>`;
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove('-translate-y-4', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');
        });
    });
    
    // Remove after 2s
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('-translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- System Controls ---
    const darkModeToggle = document.getElementById('toggle-dark-mode');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.classList.add('dark');
                document.body.style.filter = "none";
                showSystemToast('Contrast Mode: High', 'info');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.style.filter = "brightness(0.7) contrast(1.2)";
                showSystemToast('Contrast Mode: Low (Simulation)', 'info');
            }
        });
    }

    const alertsToggle = document.getElementById('toggle-alerts');
    if (alertsToggle) {
        alertsToggle.addEventListener('change', (e) => {
            const status = e.target.checked ? "ENABLED" : "MUTED";
            console.log(`[System] Global Alerts: ${status}`);
            showSystemToast(`Global Alerts ${status}`, e.target.checked ? 'info' : 'warn');
        });
    }

    // --- Simulation Settings ---
    const mainSimSlider = document.getElementById('speed-slider');
    const settingsSimSlider = document.getElementById('settings-speed-slider');
    const settingsSpeedDisplay = document.getElementById('settings-speed-display');

    if (settingsSimSlider && mainSimSlider) {
        // Sync values initially
        settingsSimSlider.value = mainSimSlider.value;
        if(settingsSpeedDisplay) settingsSpeedDisplay.textContent = `${(mainSimSlider.value/1000).toFixed(1)}s`;

        settingsSimSlider.addEventListener('input', (e) => {
            mainSimSlider.value = e.target.value;
            // update bottom bar display
            const mainDisplay = document.getElementById('speed-display');
            if(mainDisplay) mainDisplay.textContent = `${(e.target.value/1000).toFixed(1)}s`;
            if(settingsSpeedDisplay) settingsSpeedDisplay.textContent = `${(e.target.value/1000).toFixed(1)}s`;

            // update SimState if it exists globally
            if (typeof SimState !== 'undefined') {
                SimState.speed = parseInt(e.target.value);
            }
        });

        // Also if main slider changes, sync back to settings
        mainSimSlider.addEventListener('input', (e) => {
            settingsSimSlider.value = e.target.value;
            if(settingsSpeedDisplay) settingsSpeedDisplay.textContent = `${(e.target.value/1000).toFixed(1)}s`;
        });
    }

    const resetSystemBtn = document.getElementById('btn-settings-reset');
    if (resetSystemBtn) {
        resetSystemBtn.addEventListener('click', () => {
            if (typeof resetSimulation === 'function') {
                resetSimulation();
                
                // Add click effect
                resetSystemBtn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> SYSTEM RESETTING...';
                resetSystemBtn.disabled = true;
                
                showSystemToast('System State Cleared', 'warn');
                
                setTimeout(() => {
                    resetSystemBtn.innerHTML = '<span class="material-symbols-outlined text-sm">restart_alt</span> RESET SYSTEM STATE';
                    resetSystemBtn.disabled = false;
                }, 1000);
            }
        });
    }

    // --- Security Settings ---
    const firewallToggle = document.getElementById('toggle-firewall');
    if (firewallToggle) {
        firewallToggle.addEventListener('change', (e) => {
            const mode = e.target.checked ? 'STRICT' : 'PERMISSIVE';
            console.log(`[Firewall] Mode: ${mode}`);
            showSystemToast(`Firewall: ${mode}`, e.target.checked ? 'info' : 'warn');
        });
    }

    const autoScanToggle = document.getElementById('toggle-autoscan');
    if (autoScanToggle) {
        autoScanToggle.addEventListener('change', (e) => {
            const status = e.target.checked ? 'ACTIVE' : 'DISABLED';
            console.log(`[Network] Auto-Scan Routine: ${status}`);
            showSystemToast(`Network Auto-Scan: ${status}`, e.target.checked ? 'info' : 'warn');
        });
    }
});
