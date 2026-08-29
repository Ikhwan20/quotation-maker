import io
with io.open('app.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We need to find where toggleRefCol event is defined and fix from there
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'const refColChk = document.getElementById("toggleRefCol");' in line:
        start_idx = i
    if 'document.addEventListener("input", (e) => {' in line:
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    fixed_code = '''    const refColChk = document.getElementById("toggleRefCol");
    if (refColChk) {
        refColChk.addEventListener("change", (e) => {
            state.showRefColumn = e.target.checked;
            const fTable = document.getElementById("formBqTable");
            const pTable = document.getElementById("prevBqTable");
            if (state.showRefColumn) {
                if (fTable) fTable.classList.remove("hide-ref-col");
                if (pTable) pTable.classList.remove("hide-ref-col");
            } else {
                if (fTable) fTable.classList.add("hide-ref-col");
                if (pTable) pTable.classList.add("hide-ref-col");
            }
            renderBqTable();
            renderPreview();
            autoSaveState();
        });
    }

    // Multiplier dropdowns
    const terrainSelect = document.getElementById("terrainMultiplier");
    if (terrainSelect) {
        terrainSelect.addEventListener("change", (e) => {
            state.terrainMultiplier = parseFloat(e.target.value) || 1.0;
            updateMultiplierDisplay();
            renderBqTable();
            renderPreview();
            autoSaveState();
        });
    }

    const vegSelect = document.getElementById("vegetationMultiplier");
    if (vegSelect) {
        vegSelect.addEventListener("change", (e) => {
            state.vegetationMultiplier = parseFloat(e.target.value) || 1.0;
            updateMultiplierDisplay();
            renderBqTable();
            renderPreview();
            autoSaveState();
        });
    }

    const jkrTerrainSelect = document.getElementById("jkrTerrainFilter");
    if (jkrTerrainSelect) {
        jkrTerrainSelect.addEventListener("change", (e) => {
            state.jkrTerrainFilter = e.target.value;
            renderBqTable();
            renderPreview();
            autoSaveState();
        });
    }

    // Dynamic BQ inputs
'''
    lines = lines[:start_idx] + [fixed_code] + lines[end_idx+1:]

    with io.open('app.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Fixed events successfully.")
else:
    print("Could not find boundaries")
