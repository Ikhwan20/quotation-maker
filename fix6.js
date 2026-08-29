const fs = require('fs');
let js = fs.readFileSync('app.js', 'utf8');

if (!js.includes('if (typeof fixJkrCategoriesGrouping === "function") fixJkrCategoriesGrouping();')) {
    js = js.replace('function renderPreview() {', 'function renderPreview() {\n    if (typeof fixJkrCategoriesGrouping === "function") fixJkrCategoriesGrouping();');
    fs.writeFileSync('app.js', js);
    console.log('Injected fixJkrCategoriesGrouping into renderPreview');
} else {
    console.log('Already injected.');
}
