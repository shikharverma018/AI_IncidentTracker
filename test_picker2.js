const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
const { document, window } = dom;

try {
    const dashboardJS = fs.readFileSync('dashboard.js', 'utf8');
    dom.window.eval(dashboardJS);
    dom.window.openScenarioPicker();
    const container = document.getElementById('scenario-list-container');
    console.log("Children count:", container ? container.children.length : 'null');
    console.log("Modal display:", document.getElementById('scenario-modal').style.display);
    console.log("Modal class hidden?", document.getElementById('scenario-modal').classList.contains('hidden'));
} catch (e) {
    console.error("ERROR:", e);
}
