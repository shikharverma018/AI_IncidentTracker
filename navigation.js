/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KINETIC COMMAND | Navigation Controller
 * Handles view switching, hash routing, active states
 * ═══════════════════════════════════════════════════════════════════════════
 */

document.addEventListener('DOMContentLoaded', () => {
    // ─── Initial Routing ───
    const handleRouting = () => {
        const hash = window.location.hash.replace('#', '');
        const validViews = [
            'war-room', 'system-map', 'incident-logs', 'resources',
            'network', 'firewall', 'threats', 'settings'
        ];
        if (hash && validViews.includes(hash)) {
            navigateTo(hash, false);
        } else {
            navigateTo('war-room', false);
        }
    };

    window.addEventListener('hashchange', handleRouting);
    // Initial routing call
    handleRouting();
});

/**
 * Central Navigation Controller
 * Syncs URL hash, Top Nav, and Sidebar states
 */
function navigateTo(viewId, updateHash = true) {
    if (!viewId) return;

    // 1. Update URL Hash for routing
    if (updateHash) {
        window.location.hash = viewId;
    }

    // 2. Update Top Navigation (Links)
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const linkView = link.getAttribute('data-view');
        if (linkView === viewId) {
            link.classList.remove('text-[#adaaab]');
            link.classList.add('text-[#8eff71]', 'border-[#8eff71]', 'active');
            // Ensure border-b is applied correctly
            link.style.borderBottom = "2px solid #8eff71";
        } else {
            link.classList.remove('text-[#8eff71]', 'active');
            link.classList.add('text-[#adaaab]');
            link.style.borderBottom = "none";
        }
    });

    // 3. Update Sidebar (Buttons)
    const sideBtns = document.querySelectorAll('.nav-btn');
    sideBtns.forEach(btn => {
        const btnView = btn.getAttribute('data-view');
        if (btnView === viewId) {
            btn.classList.remove('text-[#adaaab]');
            btn.classList.add('text-[#8eff71]', 'bg-[#1a191b]', 'shadow-[inset_4px_0_0_0_#8eff71]', 'active');
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
        } else {
            btn.classList.remove('text-[#8eff71]', 'bg-[#1a191b]', 'shadow-[inset_4px_0_0_0_#8eff71]', 'active');
            btn.classList.add('text-[#adaaab]');
            const icon = btn.querySelector('.material-symbols-outlined');
            if (icon) icon.style.fontVariationSettings = "'FILL' 0";
        }
    });

    // 4. Toggle Content Views
    const views = document.querySelectorAll('.view-module');
    const targetId = `view-${viewId}`;

    views.forEach(view => {
        if (view.id === targetId) {
            view.classList.remove('hidden');
            // Trigger specific module renderers dynamically if they exist
            if (viewId === 'system-map' && typeof renderSystemMap === 'function') renderSystemMap();
            if (viewId === 'incident-logs' && typeof renderIncidentLogs === 'function') renderIncidentLogs();
            if (viewId === 'resources' && typeof renderResources === 'function') renderResources();
            if (viewId === 'firewall' && typeof initFirewallMonitor === 'function') initFirewallMonitor();
            if (viewId === 'threats' && typeof initThreatModule === 'function') initThreatModule();
        } else {
            view.classList.add('hidden');
        }
    });

    console.log(`[Navigation] View switched to ${viewId}`);
}

function switchNav(el) {
    const viewId = el.getAttribute('data-view');
    navigateTo(viewId);
}

function switchSideNav(el, viewId) {
    navigateTo(viewId);
}
