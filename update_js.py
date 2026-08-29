import json
with open('scratch_extracted_items.json', 'r') as f:
    items = json.load(f)

js_lines = ['const ALL_BQ_ITEMS = [']
item_counter = 1

for item in items:
    stage_text = item['stage']
    if stage_text == 'STAGE 1':
        jkrStage = 'stage1'
        section = 'A'
    elif stage_text == 'STAGE 2':
        jkrStage = 'stage2'
        section = 'A'
    else:
        jkrStage = 'reimbursable'
        section = 'C'

    cat = item['category']
    if cat == '': cat = stage_text
    cat_full = f'{stage_text}: {cat}'.replace('\"', '\\\"')
    
    name = item['description'].replace('\"', '\\\"')
    unit = item['unit']
    rate = item['rate']
    
    code = f'SR{item_counter}'
    isPartyDayLinked = 'true' if unit == 'PD' else 'false'
    applyMultiplier = 'true' if unit in ['ha', 'km'] else 'false'
    ref_code = str(item['code']).replace('\"', '\\\"')
    
    js_obj = f'''    {{
        code: "{code}",
        section: "{section}",
        jkrStage: "{jkrStage}",
        category: "{cat_full}",
        categoryEn: "{cat_full}",
        name: "{name}",
        nameEn: "{name}",
        unit: "{unit}",
        defaultRate: {rate},
        isStatutory: false,
        applyMultiplier: {applyMultiplier},
        isPartyDayLinked: {isPartyDayLinked},
        description: "Ref: {ref_code}",
        descriptionEn: "Ref: {ref_code}"
    }},'''
    js_lines.append(js_obj)
    item_counter += 1

js_lines.append('];')
with open('new_items_code.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(js_lines))
