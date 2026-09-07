
const SUPABASE_URL = 'https://sndnbwqozzliiaqaewlf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3r5nwuKhvBOHxj1wbSzjFg_lob0_L9E';

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase client initialized successfully.');

// --- HELPER FUNCTIONS UNTUK BQ ITEMS ---

// 1. Ambil semua data
async function fetchBqItemsFromDb() {
    const { data, error } = await supabaseClient.from('bq_items').select('item_data');
    if (error) {
        console.error("Ralat mengambil data Supabase:", error);
        return null; 
    }
    return data.map(row => row.item_data);
}

// 2. Simpan atau kemaskini satu item
async function upsertBqItemToDb(itemObj) {
    const { error } = await supabaseClient.from('bq_items').upsert({
        code: itemObj.code,
        item_data: itemObj
    });
    if (error) {
        console.error("Ralat menyimpan ke Supabase:", error);
    }
}

// 3. Padam satu item
async function deleteBqItemFromDb(codeStr) {
    const { error } = await supabaseClient.from('bq_items').delete().eq('code', codeStr);
    if (error) {
        console.error("Ralat memadam dari Supabase:", error);
    }
}

// 4. Reset & Simpan secara pukal (Bulk Insert)
async function bulkUpsertBqItems(itemsArray) {
    await supabaseClient.from('bq_items').delete().neq('code', 'dummy_code_to_delete_all');
    
    const rows = itemsArray.map(item => ({
        code: item.code,
        item_data: item
    }));
    
    const { error } = await supabaseClient.from('bq_items').insert(rows);
    if (error) console.error("Ralat bulk insert:", error);
}

// --- HELPER FUNCTIONS UNTUK FIRMA ---

async function fetchFirmsFromDb() {
    const { data, error } = await supabaseClient.from('firms').select('firm_data');
    if (error) {
        console.error("Ralat mengambil data Firma Supabase:", error);
        return null; 
    }
    return data.map(row => row.firm_data);
}

async function upsertFirmToDb(firmObj) {
    const { error } = await supabaseClient.from('firms').upsert({
        id: firmObj.id,
        firm_data: firmObj
    });
    if (error) console.error("Ralat menyimpan Firma ke Supabase:", error);
}

async function deleteFirmFromDb(firmId) {
    const { error } = await supabaseClient.from('firms').delete().eq('id', firmId);
    if (error) console.error("Ralat memadam Firma dari Supabase:", error);
}

// --- HELPER FUNCTIONS UNTUK KLIEN ---

async function fetchClientsFromDb() {
    const { data, error } = await supabaseClient.from('clients').select('client_data');
    if (error) {
        console.error("Ralat mengambil data Klien Supabase:", error);
        return null; 
    }
    return data.map(row => row.client_data);
}

async function upsertClientToDb(clientObj) {
    const { error } = await supabaseClient.from('clients').upsert({
        id: clientObj.id,
        client_data: clientObj
    });
    if (error) console.error("Ralat menyimpan Klien ke Supabase:", error);
}

async function deleteClientFromDb(clientId) {
    const { error } = await supabaseClient.from('clients').delete().eq('id', clientId);
    if (error) console.error("Ralat memadam Klien dari Supabase:", error);
}

