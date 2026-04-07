const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

const { document, window } = dom;
window.onload = () => {
    try {
        const dashboardJS = fs.readFileSync('dashboard.js', 'utf8');
        dom.window.eval(dashboardJS);
        dom.window.openScenarioPicker();
        const container = document.getElementById('scenario-list-container');
        console.log("Children count:", container.children.length);
        console.log("Modal display:", document.getElementById('scenario-modal').style.display);
    } catch (e) {
        console.error("ERROR:", e);
    }
};
