/**
 * Malaysian Licensed Land Surveyor Quotation System (LJT / PEJUTA / JKR)
 * Core Application Logic, Dual-Format BQ Engine (JKR & Commercial/LJT), 
 * Client & Firm Profile Directory Modules, Dynamic Distance Zones (Mob/Demob),
 * Accounting Money Formatting (en-MY), Dynamic SVG Seal Sizing,
 * New Quotation Reset & Duplication Tools, 1-Click Templates, LocalStorage & Bilingual Localization
 */

// ==========================================
// 1. DEFAULT DIRECTORIES & STORAGE KEYS
// ==========================================

const FIRMS_STORAGE_KEY = "LLS_FIRMS_DIRECTORY";
const CLIENTS_STORAGE_KEY = "LLS_CLIENTS_DIRECTORY";
const STORAGE_KEY = "MALAYSIA_LLS_QUOTATION_DRAFT_2026";

const DEFAULT_FIRMS_DIRECTORY = [
    {
        id: "firm_sjk_geomap",
        firmName: "Syarikat Jurukur Konsult Geomap (SJK Geomap)",
        letterhead: "sjk_geomap",
        firmLjtNo: "LJT/F/5678",
        surveyorName: "Sr. Tan Min Way",
        surveyorLjtNo: "6721",
        practiceYear: "2026",
        piiCoverage: "RM 2,000,000 (Aktif)",
        phone: "+603-7984 8899",
        email: "contact@sjkgeomap.com.my",
        address: "Suite 9.02, Level 9, Plaza Pantai, Jalan Pantai Baru, 59200 Kuala Lumpur",
        logoDataUrl: null,
        signatureDataUrl: null
    },
    {
        id: "firm_sjk_kl",
        firmName: "Syarikat Jurukur Konsultant (SJK)",
        letterhead: "sjk",
        firmLjtNo: "LJT/F/1234",
        surveyorName: "Ir. Sr. Ahmad Zaki bin Haron",
        surveyorLjtNo: "8872",
        practiceYear: "2026",
        piiCoverage: "RM 1,000,000 (Aktif)",
        phone: "+603-2274 5566",
        email: "admin@sjk.com.my",
        address: "No. 45A, Jalan Tun Sambanthan, Brickfields, 50470 Kuala Lumpur",
        logoDataUrl: null,
        signatureDataUrl: null
    }
];

const DEFAULT_CLIENTS_DIRECTORY = [
    {
        id: "cli_jkr_hq",
        company: "Cawangan Jalan, Ibu Pejabat JKR Malaysia",
        clientRefPrefix: "JKR/IP/CJ/JMB/2026/04",
        attnName: "Ir. Ts. Mohd Ridzuan bin Ahmad (Jurutera Awam Penguasa)",
        phone: "+603-2610 8888",
        email: "ridzuan@jkr.gov.my",
        address: "Tingkat 14, Blok F, Ibu Pejabat JKR Malaysia, Jalan Sultan Salahuddin, 50480 Kuala Lumpur",
        category: "Agensi Kerajaan"
    },
    {
        id: "cli_sime_darby",
        company: "Sime Darby Property Berhad",
        clientRefPrefix: "SDP/ENG/TOPO/2026/89",
        attnName: "Ir. David Lim Chee Keong",
        phone: "+6012-888 1234",
        email: "david.lim@simedarby.com",
        address: "Level 10, Block G, No. 2 Jalan PJU 1A/7A, Ara Damansara, 47301 Petaling Jaya, Selangor",
        category: "Pemaju Swasta"
    },
    {
        id: "cli_tanah_hijau",
        company: "Tanah Hijau Development Sdn Bhd",
        clientRefPrefix: "THD/SUB/2026/01",
        attnName: "Dato' Hj. Kamaruddin bin Mansor",
        phone: "+6019-333 7788",
        email: "kamaruddin@tanahhijau.com.my",
        address: "No. 12, Jalan Diplomatik 2/1, Presint 15, 62050 Putrajaya",
        category: "Pemaju Swasta"
    }
];

// --- LIVE PREVIEW WINDOW LOGIC ---
let livePreviewWindow = null;

function openLivePreview() {
    if (livePreviewWindow && !livePreviewWindow.closed) {
        livePreviewWindow.focus();
        return;
    }

    livePreviewWindow = window.open("", "LivePreviewWindow", "width=950,height=1000");

    // Write initial structure, including styles
    livePreviewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Live Preview - Quotation Generator</title>
            <style>
                body {
                    background-color: #525659;
                    display: flex;
                    justify-content: center;
                    padding: 2rem 0;
                    margin: 0;
                    min-height: 100vh;
                }
                .a4-document {
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    margin: 0; 
                    background: white;
                }
                @media print {
                    body { background: transparent; padding: 0; display: block; }
                    .a4-document { box-shadow: none; margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="a4-document" id="livePreviewContainer">
                <div style="padding: 5rem; text-align: center; color: #718096; font-family: sans-serif;">
                    <h2>Menunggu Data...</h2>
                    <p>Sila pastikan tab utama sedang dibuka dan data telah dimasukkan.</p>
                </div>
            </div>
        </body>
        </html>
    `);

    // Copy all current stylesheets from main document so it matches exactly
    Array.from(document.styleSheets).forEach(sheet => {
        if (sheet.href) {
            const link = livePreviewWindow.document.createElement('link');
            link.rel = 'stylesheet';
            link.href = sheet.href;
            livePreviewWindow.document.head.appendChild(link);
        }
    });

    livePreviewWindow.document.close();

    // Immediately push current content
    setTimeout(syncLivePreview, 200);
}

function syncLivePreview() {
    if (livePreviewWindow && !livePreviewWindow.closed) {
        const a4Page = document.getElementById('a4Page');
        if (a4Page) {
            const container = livePreviewWindow.document.getElementById('livePreviewContainer');
            if (container) {
                container.innerHTML = a4Page.innerHTML;
            }
        }
    }
}
// --------------------------------

// ==========================================
// 2. DYNAMIC DISTANCE ZONES (MOB/DEMOB)
// ==========================================

const DISTANCE_ZONES = {
    zone_lt50: {
        id: "zone_lt50",
        labelBm: "< 50 km (Zon Tempatan)",
        labelEn: "< 50 km (Local Zone)",
        displayBm: "< 50 km (Tempatan)",
        displayEn: "< 50 km (Local)",
        jkrNameBm: "Mobilisation and Demobilisation (Distance < 50km - Local)",
        jkrNameEn: "Mobilisation and Demobilisation (Distance < 50km - Local)",
        commNameBm: "Mobilisasi Pasukan Ukur & Peralatan (Jarak < 50km - Tempatan)",
        commNameEn: "Survey Team & Equipment Mobilisation (Distance < 50km - Local)",
        partyDayScale: 0.5,
        commDefaultRate: 400.00
    },
    zone_50_150: {
        id: "zone_50_150",
        labelBm: "> 50 km & < 150 km (Zon Sederhana)",
        labelEn: "> 50 km & < 150 km (Standard Zone)",
        displayBm: "> 50 km & < 150 km",
        displayEn: "> 50 km & < 150 km",
        jkrNameBm: "Mobilisation and Demobilisation (Distance > 50km & < 150km)",
        jkrNameEn: "Mobilisation and Demobilisation (Distance > 50km & < 150km)",
        commNameBm: "Mobilisasi Pasukan Ukur & Peralatan (Jarak > 50km & < 150km)",
        commNameEn: "Survey Team & Equipment Mobilisation (Distance > 50km & < 150km)",
        partyDayScale: 1.0,
        commDefaultRate: 800.00
    },
    zone_150_300: {
        id: "zone_150_300",
        labelBm: "> 150 km & < 300 km (Luar Stesen)",
        labelEn: "> 150 km & < 300 km (Outstation Zone)",
        displayBm: "> 150 km & < 300 km",
        displayEn: "> 150 km & < 300 km",
        jkrNameBm: "Mobilisation and Demobilisation (Distance > 150km & < 300km - Outstation)",
        jkrNameEn: "Mobilisation and Demobilisation (Distance > 150km & < 300km - Outstation)",
        commNameBm: "Mobilisasi Pasukan Ukur & Peralatan (Jarak > 150km & < 300km - Luar Stesen)",
        commNameEn: "Survey Team & Equipment Mobilisation (Distance > 150km & < 300km - Outstation)",
        partyDayScale: 1.5,
        commDefaultRate: 1200.00
    },
    zone_gt300: {
        id: "zone_gt300",
        labelBm: "> 300 km (Luar Stesen Jarak Jauh)",
        labelEn: "> 300 km (Long Distance Outstation)",
        displayBm: "> 300 km (Jarak Jauh)",
        displayEn: "> 300 km (Long Distance)",
        jkrNameBm: "Mobilisation and Demobilisation (Distance > 300km - Long Distance)",
        jkrNameEn: "Mobilisation and Demobilisation (Distance > 300km - Long Distance)",
        commNameBm: "Mobilisasi Pasukan Ukur & Peralatan (Jarak > 300km - Jarak Jauh)",
        commNameEn: "Survey Team & Equipment Mobilisation (Distance > 300km - Long Distance)",
        partyDayScale: 2.0,
        commDefaultRate: 1600.00
    }
};

// ==========================================
// 5. 1-CLICK PROJECT PRESET TEMPLATES
// ==========================================

const PROJECT_TEMPLATES = {
    tpl_jkr_bridge: {
        bqType: "jkr",
        firmId: "firm_sjk_geomap",
        clientId: "cli_jkr_hq",
        title: "CADANGAN KERJA-KERJA UKUR KEJURUTERAAN DAN PENGAMBILAN TANAH BAGI PROJEK JALAN/JAMBATAN (TENDER JKR)",
        titleEn: "PROPOSED DETAILED ENGINEERING SURVEY AND LAND ACQUISITION FOR ROAD/BRIDGE PROJECT (JKR TENDER)",
        subtitle: "DAERAH [Sila Masukkan Daerah], NEGERI [Sila Masukkan Negeri]",
        subtitleEn: "DISTRICT OF [Insert District], STATE OF [Insert State]",
        clientCompany: "Cawangan Jalan, Ibu Pejabat JKR Malaysia",
        clientRef: "JKR/IP/CJ/JMB/2026/04",
        ourRef: "GEOMAP/2026/Q-4102-Rev01",
        clientName: "Ir. Ts. Mohd Ridzuan bin Ahmad (Jurutera Awam Penguasa)",
        clientPhone: "+603-2610 8888",
        clientEmail: "ridzuan@jkr.gov.my",
        clientAddress: "Tingkat 14, Blok F, Ibu Pejabat JKR Malaysia, Jalan Sultan Salahuddin, 50480 Kuala Lumpur",
        clientCategory: "Agensi Kerajaan",
        landState: "Selangor",
        landDistrict: "[Daerah]",
        landMukim: "[Mukim]",
        lotNo: "[Sila Masukkan Nama Jalan / Jambatan]",
        titleNo: "Warta Rizab Jalan Persekutuan",
        landCategory: "Rizab / Khas",
        landArea: 3.5,
        landAreaUnit: "Hektar",
        coordSystem: "Cassini-Soldner (Negeri)",
        verticalDatum: "LSD JUPEM (Land Survey Datum)",
        distanceZone: "zone_50_150",
        terrainMultiplier: 1,
        vegetationMultiplier: 1,
        duration: "6 hingga 8 Minggu Bekerja",
        deposit: "Mengikut Jadual Arahan Perbendaharaan / Milestone Penyerahan Pelan JKR",
        discount: 0,
        enableSst: true,
        notes: "Kerja ukur dijalankan mengikut Garis Panduan Perbendaharaan Malaysia & Spesifikasi Ukur JKR Cawangan Jalan.\nKadar Party-Day adalah berasaskan kadar piawaian Semenanjung Malaysia (RM 743.00 / Party-Day).\nBayaran balik bagi carian hakmilik PTD, pelan pewartaan PBT Seksyen 4 & Seksyen 8 KTN 1965 adalah tuntutan pass-through bebas SST.\nLaporan pengesanan utiliti bawah tanah disediakan mengikut kualiti QL-B / CKIP JKR.\nPenyerahan pelan dalam format AutoCAD DWG, PDF A1 dan pangkalan data geospatial MS 1759.",
        items: {
            "SR1": 1,
            "SR2": 1,
            "SR5": 1.5,
            "SR7": 2,
            "SR23": 3.5,
            "SR51": 1,
            "SR52": 0.5,
            "SR26": 5000,
            "SR21": 1.5,
            "SR20": 1,
            "SR93": 1.5,
            "SR95": 1.5,
            "SR99": 8,
            "SR100": 1,
            "SR101": 1,
            "SR102": 1,
            "SR103": 400,
            "SR104": 12,
            "SR105": 8,
            "SR106": 1,
            "SR_DRAWING": 1
        },
        deliverables: {
            "del_dwg": true,
            "del_pdf": true,
            "del_ms1759": true,
            "del_csv": true,
            "del_hardcopy": true,
            "del_report": true,
            "del_pointcloud": false,
            "del_jupem_cp": true
        }
    },

    tpl_drone_50ha: {
        bqType: "jkr",
        firmId: "firm_sjk_geomap",
        title: "CADANGAN PEMETAAN UDARA DRON UAV FOTOGRAMETRI & IMBASAN LIDAR TAPAK (50 HEKTAR)",
        titleEn: "PROPOSED 50-HECTARE UAV DRONE PHOTOGRAMMETRY & AIRBORNE LIDAR SURVEY",
        subtitle: "BAGI KAJIAN KESTABILAN CERUN & REKA BENTUK INFRASTRUKTUR DI MUKIM BENTONG, PAHANG",
        subtitleEn: "FOR SLOPE STABILITY & INFRASTRUCTURE DESIGN AT MUKIM BENTONG, PAHANG",
        clientCompany: "Gamuda Engineering Sdn Bhd",
        clientRef: "GESB/UAV/2026/15",
        ourRef: "SJK/2026/Q-6105-Rev01",
        clientName: "Ir. Kelvin Wong (Head of Geotechnical)",
        clientPhone: "+6012-777 5544",
        clientEmail: "kelvin.wong@gamuda.com.my",
        clientAddress: "Menara Gamuda, PJ Trade Centre, No. 8, Jalan PJU 8/8A, Bandar Damansara Perdana, 47820 Petaling Jaya",
        clientCategory: "Kontraktor",
        landState: "Pahang",
        landDistrict: "Bentong",
        landMukim: "Mukim Bentong",
        lotNo: "Lot 3401 hingga 3410",
        titleNo: "H.S.(D) 5541",
        landCategory: "Pertanian",
        landArea: 50,
        landAreaUnit: "Hektar",
        coordSystem: "RSO Malayan (m)",
        verticalDatum: "LSD JUPEM (Land Survey Datum)",
        distanceZone: "zone_50_150",
        terrainMultiplier: 1,
        vegetationMultiplier: 1,
        duration: "4 hingga 6 Minggu Bekerja",
        deposit: "40% LOA / Deposit, 30% Kerja Lapangan/Penerbangan, 30% Penyerahan Model 3D",
        discount: 0,
        enableSst: true,
        notes: "Operasi dron & LiDAR dijalankan mengikut Pekeliling LJT/PEJUTA 2023.\nKadar data pemrosesan peratusan (%) dikira automatik daripada subtotal Data Acquisition Stage 2 LiDAR.\nLaporan teknikal mengandungi model permukaan digital DSM/DTM dan Point Cloud.",
        items: {
            "SR110": 1,
            "SR112": 1,
            "SR113": 8,
            "SR114": 50,
            "SR116": 1,
            "SR117": 1,
            "SR118": 1,
            "SR119": 1
        },
        deliverables: {
            "del_dwg": true,
            "del_pdf": true,
            "del_ms1759": true,
            "del_csv": true,
            "del_hardcopy": true,
            "del_report": true,
            "del_pointcloud": true,
            "del_jupem_cp": false
        }
    }
};


// ==========================================
// 6. BILINGUAL DICTIONARY (BM / EN)
// ==========================================

const TRANSLATIONS = {
    bm: {
        headerTitle: "Sistem Penjana Sebut Harga Ukur Tanah",
        headerSubtitle: "Malaysian Licensed Land Surveyor Quotation & Dual-Format BQ System (JKR & LJT / PEJUTA)",
        lblTemplateSelect: "Templat Projek:",
        btnApplyTemplate: "Muat Templat",
        btnNewQuote: "+ Sebut Harga Baru",
        btnDuplicate: "Duplikasi",
        btnSaveDraft: "Simpan Draf",
        tab1: "Langkah 1: Maklumat Am & Tanah",
        tab2: "Langkah 2: Senarai BQ & Pengali",
        secConfig: "Konfigurasi Dokumen & Kredensial Firma LJT",
        secLandAdmin: "Maklumat Pentadbiran Tanah & Tapak Ukur",
        secClient: "Maklumat Pelanggan & Penomboran Rujukan",
        secTerms: "Perkara, Tempoh & Terma Pembayaran",
        secMultiplier: "Faktor Pengali Tapak PEJUTA (Site Terrain & Vegetation Multipliers)",
        secDaywork: "Jadual Kadar Daywork (Schedule of Daywork Rates)",
        secDeliverables: "Matriks Format Serahan Projek (Deliverables Checklist)",
        lblFirmProfileSelect: "Pilih Profil Firma Ukur LJT:",
        btnNewFirmProfile: "+ Profil Baru",
        btnSaveFirmProfile: "Simpan Profil",
        btnDeleteFirmProfile: "Padam",
        lblClientDirectorySelect: "Pilih Pelanggan dari Direktori:",
        btnNewClient: "+ Pelanggan Baru",
        btnSaveClient: "Simpan Pelanggan",
        btnDeleteClient: "Padam",
        lblFirmName: "Nama Firma Ukur LJT",
        lblBqType: "Jenis Format Sebut Harga",
        lblFirmLjtNo: "No. Pendaftaran Firma LJT",
        lblSurveyorLjtNo: "No. Perakuan Juruukur LJT",
        lblPracticeYear: "Tahun Sijil Amalan",
        lblPiiCoverage: "Perlindungan Insurans PII (RM)",
        lblFirmPhone: "No. Telefon Firma",
        lblFirmEmail: "E-mel Rasmi Firma",
        lblFirmAddress: "Alamat Pejabat Firma",
        lblCustomLogo: "Muat Naik Logo Firma (PNG/JPG)",
        lblCustomSignature: "Muat Naik T/Tangan Juruukur (PNG/JPG)",
        lblLandState: "Negeri (14 Negeri)",
        lblLandDistrict: "Daerah",
        lblLandMukim: "Mukim / Bandar / Pekan",
        lblLotNo: "No. Lot / No. PT",
        lblTitleNo: "No. & Jenis Hakmilik",
        lblLandCategory: "Kategori Kegunaan Tanah",
        lblLandArea: "Keluasan Tanah",
        lblCoordSystem: "Sistem Unjuran Koordinat",
        lblVerticalDatum: "Datum Aras Ketinggian",
        lblDistanceZone: "Zon Jarak Mobilisasi (Mob/Demob)",
        lblClientCompany: "Nama Syarikat / Agensi Pelanggan",
        lblClientCategory: "Kategori Pelanggan",
        lblClientRef: "Rujukan Pelanggan (Client Ref)",
        lblOurRef: "Rujukan Kami (Our Ref)",
        lblQuoteDate: "Tarikh Dokumen (Date)",
        lblClientName: "Untuk Perhatian (Attention To)",
        lblClientPhone: "No. Telefon Pelanggan",
        lblClientEmail: "E-mel Pelanggan",
        lblClientAddress: "Alamat Pelanggan",
        lblQuoteTitle: "Tajuk Sebut Harga (Project Title)",
        lblQuoteSubtitle: "Sub-Tajuk / Keterangan Lokasi",
        lblProjectManager: "Juruukur Tanah Berlesen (Signatory)",
        lblDuration: "Tempoh Siap Kerja (Duration)",
        lblDeposit: "Jadual Bayaran Bertahap (Milestones)",
        lblDiscount: "Jumlah Diskaun Yuran Profesional (RM)",
        lblEnableSst: "Kenakan Cukai Perkhidmatan 8% ke atas Yuran Profesional / Yuran Perunding",
        lblNotes: "Nota & Syarat-Syarat Perkhidmatan (Satu baris setiap klausa)",
        combinedMultiplierLabel: "Faktor Gabungan:",
        lblTerrainMultiplier: "Rupa Bumi (Terrain Factor)",
        lblVegetationMultiplier: "Litupan Tumbuhan (Vegetation Factor)",
        lblMultiplierNote: "* Pengali diaplikasikan secara automatik ke atas item ukur topografi, kejuruteraan & kerja lapangan berkaitan.",
        statutoryWarningText: "Diskaun dilarang dikenakan ke atas item Ukur Kadaster Hakmilik statutori LJT (Skala Fi Mandatori Akta 458). Diskaun hanya dikenakan ke atas yuran profesional bukan statutori.",
        btnAll: "Semua Item (All)",
        btnPartA: "Stage 1 / Bahagian A",
        btnPartB: "Stage 2 / Bahagian B",
        btnPartC: "Reimbursables / Bahagian C",
        btnDaywork: "Kadar Daywork",
        btnDeliverables: "Matriks Serahan",
        thCode: "Kod",
        thDesc: "Skop Kerja & Spesifikasi",
        thUnit: "Unit",
        thQty: "Kuantiti",
        thRate: "Kadar (RM)",
        btnBack: "Kembali (Back)",
        btnNext: "Seterusnya: Senarai BQ",
        btnPrint: "Cetak (Print)",
        btnCsv: "Eksport CSV",
        btnPdf: "Muat Turun PDF",
        previewBtnShow: "Papar Dokumen",
        previewBtnHide: "Tutup Paparan",
        prevTo: "Kepada (To):",
        prevOurRef: "Rujukan Kami:",
        prevClientRef: "Rujukan Tuan:",
        prevDate: "Tarikh:",
        prevLjtFirm: "Firma LJT:",
        prevLandInfo: "Butiran Pentadbiran Tanah & Tapak (Land & Site Metadata)",
        prevLot: "No. Lot / PT:",
        prevTitle: "No. Hakmilik:",
        prevMukim: "Mukim / Daerah:",
        prevArea: "Keluasan:",
        prevCategory: "Kategori Tanah:",
        prevCoord: "Sistem Unjuran:",
        prevDatum: "Datum Aras:",
        prevSiteFactor: "Faktor Tapak:",
        prevDistanceZone: "Zon Jarak:",
        prevThNo: "Butiran",
        prevThScope: "Keterangan Skop Kerja",
        prevThUnit: "Unit",
        prevThQty: "Kuantiti",
        prevThRate: "Kadar (RM)",
        prevThTotal: "Jumlah (RM)",
        prevDeliverablesTitle: "Format & Dokumen Serahan Projek (Deliverables):",
        prevDuration: "Tempoh Siap Kerja:",
        prevDeposit: "Jadual Bayaran:",
        prevTermsHeader: "Syarat-Syarat Perkhidmatan Juruukur Tanah Berlesen (LJT / PEJUTA / JKR):",
        prevPreparedBy: "Disediakan oleh (Prepared by):",
        prevSurveyorTitle: "Juruukur Tanah Berlesen Malaysia",
        sectionABand: "BAHAGIAN A: YURAN PROFESIONAL (TERTAKLUK KEPADA SST 8%)",
        sectionBBand: "BAHAGIAN B: BAYARAN BALIK AGENSI KERAJAAN (DISBURSEMENTS - 0% SST)",
        sectionCBand: "BAHAGIAN C: LOGISTIK, OPERASI & RISIKO TAPAK",
        jkrStage1Band: "STAGE 1: PRELIMINARY SURVEY (UKUR AWALAN & KEJURUTERAAN)",
        jkrStage2Band: "STAGE 2: SETTING OUT RESERVE BOUNDARIES (PANCANGAN RIZAB)",
        jkrReimbursableBand: "KOS IMBUHAN BALIK (REIMBURSABLES - PENDAHULUAN & PBT SEK 4 & 8)",
        subtotalA: "Subtotal Bahagian A (Yuran Profesional):",
        discountA: "Tolak: Diskaun Yuran Profesional:",
        sstA: "Cukai Perkhidmatan (SST 8% ke atas Yuran Perunding):",
        netA: "Jumlah Bersih Bahagian A:",
        subtotalB: "Subtotal Bahagian B (Bayaran Balik Agensi Kerajaan - 0% SST):",
        subtotalC: "Subtotal Bahagian C (Logistik & Operasi Tapak):",
        subtotalStage1: "Jumlah Stage 1 (Ukur Awalan & Kejuruteraan):",
        subtotalStage2: "Jumlah Stage 2 (Pancangan Sempadan Rizab):",
        subtotalJkrConsultantFee: "Jumlah Yuran Perunding (Stage 1 + Stage 2):",
        discountJkr: "Tolak: Diskaun Yuran Perunding:",
        netJkrConsultantFee: "Jumlah Bersih Yuran Perunding:",
        subtotalJkrReimbursables: "Jumlah Kos Imbuhan Balik (Reimbursables - 0% SST):",
        grandTotal: "JUMLAH KESELURUHAN SEBUT HARGA (GRAND TOTAL):"
    },
    en: {
        headerTitle: "Land Surveyor Quotation System",
        headerSubtitle: "Malaysian Licensed Land Surveyor Quotation & Dual-Format BQ System (JKR & LJT / PEJUTA)",
        lblTemplateSelect: "Project Template:",
        btnApplyTemplate: "Load Preset",
        btnNewQuote: "+ New Quotation",
        btnDuplicate: "Duplicate",
        btnSaveDraft: "Save Draft",
        tab1: "Step 1: General & Land Metadata",
        tab2: "Step 2: BQ Items & Multipliers",
        secConfig: "Document Config & LJT Firm Credentials",
        secLandAdmin: "Land Administration & Site Parameters",
        secClient: "Client Information & Reference Tracking",
        secTerms: "Subject, Duration & Payment Terms",
        secMultiplier: "PEJUTA Site Terrain & Vegetation Multipliers",
        secDaywork: "Schedule of Daywork Rates",
        secDeliverables: "Project Deliverables Matrix Checklist",
        lblFirmProfileSelect: "Select LJT Firm Profile:",
        btnNewFirmProfile: "+ New Profile",
        btnSaveFirmProfile: "Save Profile",
        btnDeleteFirmProfile: "Delete",
        lblClientDirectorySelect: "Select Client from Directory:",
        btnNewClient: "+ New Client",
        btnSaveClient: "Save Client",
        btnDeleteClient: "Delete",
        lblFirmName: "LJT Survey Firm Name",
        lblBqType: "Quotation Document Standard",
        lblFirmLjtNo: "LJT Firm Reg. No.",
        lblSurveyorLjtNo: "Surveyor LJT Practice No.",
        lblPracticeYear: "Practicing Cert Year",
        lblPiiCoverage: "PII Insurance Coverage (RM)",
        lblFirmPhone: "Firm Phone Number",
        lblFirmEmail: "Firm Official Email",
        lblFirmAddress: "Firm Office Address",
        lblCustomLogo: "Upload Firm Logo (PNG/JPG)",
        lblCustomSignature: "Upload Surveyor Signature (PNG/JPG)",
        lblLandState: "State (14 States)",
        lblLandDistrict: "District",
        lblLandMukim: "Mukim / Town / City",
        lblLotNo: "Lot No. / PT No.",
        lblTitleNo: "Title Type & No.",
        lblLandCategory: "Land Use Category",
        lblLandArea: "Land Area",
        lblCoordSystem: "Coordinate Projection System",
        lblVerticalDatum: "Vertical Height Datum",
        lblDistanceZone: "Mobilisation Distance Zone (Mob/Demob)",
        lblClientCompany: "Client Company / Agency Name",
        lblClientCategory: "Client Category",
        lblClientRef: "Client Reference (Client Ref)",
        lblOurRef: "Our Reference (Our Ref)",
        lblQuoteDate: "Document Date",
        lblClientName: "Attention Person (Attn)",
        lblClientPhone: "Client Phone Number",
        lblClientEmail: "Client Email Address",
        lblClientAddress: "Client Postal Address",
        lblQuoteTitle: "Quotation Project Title",
        lblQuoteSubtitle: "Sub-Title / Site Description",
        lblProjectManager: "Licensed Land Surveyor (Signatory)",
        lblDuration: "Estimated Duration",
        lblDeposit: "Payment Milestone Schedule",
        lblDiscount: "Consultant Fee Discount (RM)",
        lblEnableSst: "Apply 8% Service Tax on Professional Fees (Stage 1 & 2 / Part A)",
        lblNotes: "Terms & Conditions of Service (One line per clause)",
        combinedMultiplierLabel: "Combined Factor:",
        lblTerrainMultiplier: "Terrain Relief Factor",
        lblVegetationMultiplier: "Vegetation Cover Factor",
        lblMultiplierNote: "* Multiplier factor is automatically applied to topographical, engineering, and relevant field items.",
        statutoryWarningText: "Discounts on statutory Cadastral Title survey items under Act 458 mandatory scale are strictly prohibited. Discount applies only to non-statutory professional fees.",
        btnAll: "All Items",
        btnPartA: "Stage 1 / Part A",
        btnPartB: "Stage 2 / Part B",
        btnPartC: "Reimbursables / Part C",
        btnDaywork: "Daywork Rates",
        btnDeliverables: "Deliverables Matrix",
        thCode: "Code",
        thDesc: "Scope of Works & Specifications",
        thUnit: "Unit",
        thQty: "Quantity",
        thRate: "Rate (RM)",
        btnBack: "Back",
        btnNext: "Next: BQ Items",
        btnPrint: "Print Document",
        btnCsv: "Export CSV",
        btnPdf: "Download PDF",
        previewBtnShow: "Show Preview",
        previewBtnHide: "Hide Preview",
        prevTo: "To:",
        prevOurRef: "Our Ref:",
        prevClientRef: "Client Ref:",
        prevDate: "Date:",
        prevLjtFirm: "LJT Firm:",
        prevLandInfo: "Land Administration & Site Metadata",
        prevLot: "Lot / PT No:",
        prevTitle: "Title No:",
        prevMukim: "Mukim / District:",
        prevArea: "Land Area:",
        prevCategory: "Land Category:",
        prevCoord: "Projection Datum:",
        prevDatum: "Vertical Datum:",
        prevSiteFactor: "Site Factor:",
        prevDistanceZone: "Distance Zone:",
        prevThNo: "Item",
        prevThScope: "Description of Survey Works",
        prevThUnit: "Unit",
        prevThQty: "Qty",
        prevThRate: "Rate (RM)",
        prevThTotal: "Amount (RM)",
        prevDeliverablesTitle: "Project Deliverables & Digital Drawing Formats:",
        prevDuration: "Completion Period:",
        prevDeposit: "Payment Terms:",
        prevTermsHeader: "Terms & Conditions of Licensed Land Surveying Practice (LJT / PEJUTA / JKR):",
        prevPreparedBy: "Prepared by:",
        prevSurveyorTitle: "Licensed Land Surveyor Malaysia",
        sectionABand: "PART A: PROFESSIONAL FEES (SUBJECT TO 8% SERVICE TAX)",
        sectionBBand: "PART B: GOVERNMENT STATUTORY DISBURSEMENTS (0% SST / PASS-THROUGH)",
        sectionCBand: "PART C: SITE LOGISTICS, FIELD OPERATIONS & SPECIAL RISKS",
        jkrStage1Band: "STAGE 1: PRELIMINARY SURVEY (FIELD & ENGINEERING)",
        jkrStage2Band: "STAGE 2: SETTING OUT RESERVE BOUNDARIES",
        jkrReimbursableBand: "REIMBURSABLE DISBURSEMENTS (LAND ACQUISITION SEC 4 & 8)",
        subtotalA: "Subtotal Part A (Professional Fees):",
        discountA: "Less: Professional Fee Discount:",
        sstA: "Service Tax (SST 8% on Consultant Fees):",
        netA: "Net Part A Total:",
        subtotalB: "Subtotal Part B (Government Disbursements - 0% SST):",
        subtotalC: "Subtotal Part C (Logistics & Site Operations):",
        subtotalStage1: "Stage 1 Total (Preliminary Survey):",
        subtotalStage2: "Stage 2 Total (Setting Out Reserve Boundaries):",
        subtotalJkrConsultantFee: "Total Consultant Fees (Stage 1 + Stage 2):",
        discountJkr: "Less: Consultant Fee Discount:",
        netJkrConsultantFee: "Net Consultant Fees Total:",
        subtotalJkrReimbursables: "Total Reimbursable Expenses (0% SST):",
        grandTotal: "TOTAL QUOTATION AMOUNT (GRAND TOTAL):"
    }
};

// ==========================================
// 7. APPLICATION STATE MANAGEMENT
// ==========================================

const state = {
    currentLang: "bm",
    bqType: "jkr",

    // Active Firm Profile State
    selectedFirmId: "firm_sjk_geomap",
    firmName: "Syarikat Jurukur Konsult Geomap (SJK Geomap)",
    letterhead: "sjk_geomap",
    firmLjtNo: "LJT/F/5678",
    surveyorLjtNo: "6721",
    practiceYear: "2026",
    piiCoverage: "RM 2,000,000 (Aktif)",
    firmPhone: "+603-7984 8899",
    firmEmail: "contact@sjkgeomap.com.my",
    firmAddress: "Suite 9.02, Level 9, Plaza Pantai, Jalan Pantai Baru, 59200 Kuala Lumpur",
    customLogoDataUrl: null,
    customSignatureDataUrl: null,

    // Land Administration & Distance Zone
    landState: "Selangor",
    landDistrict: "[Daerah]",
    landMukim: "[Mukim]",
    lotNo: "[Sila Masukkan Nama Jalan / Jambatan]",
    titleNo: "Warta Rizab Jalan Persekutuan",
    landCategory: "Rizab / Khas",
    landArea: 3.5,
    landAreaUnit: "Hektar",
    coordSystem: "Cassini-Soldner (Negeri)",
    verticalDatum: "LSD JUPEM (Land Survey Datum)",
    distanceZone: "zone_50_150",

    // Active Client State
    selectedClientId: "cli_jkr_hq",
    clientCompany: "Cawangan Jalan, Ibu Pejabat JKR Malaysia",
    clientCategory: "Agensi Kerajaan",
    clientRef: "JKR/IP/CJ/JMB/2026/04",
    ourRef: "SJK/2026/Q-4102-Rev01",
    quoteDate: new Date().toISOString().split("T")[0],
    clientName: "Ir. Ts. Mohd Ridzuan bin Ahmad (Jurutera Awam Penguasa)",
    clientPhone: "+603-2610 8888",
    clientEmail: "ridzuan@jkr.gov.my",
    clientAddress: "Tingkat 14, Blok F, Ibu Pejabat JKR Malaysia, Jalan Sultan Salahuddin, 50480 Kuala Lumpur",

    // Project Details
    quoteTitle: "CADANGAN PENGGANTIAN JAMBATAN SUNGAI RINCHING DAN KERJA-KERJA UKUR KEJURUTERAAN SERTA PENGAMBILAN BALIK TANAH (PBT)",
    quoteSubtitle: "DAERAH [Sila Masukkan Daerah], NEGERI [Sila Masukkan Negeri]",
    projectManager: "Ir. Sr. Ahmad Zaki bin Haron",
    duration: "6 hingga 8 Minggu Bekerja",
    deposit: "30% Mobilization, 40% Field Survey, 30% Final Submission",
    discount: 0.0,
    enableSst: true,
    showRefColumn: false,
    notes: "Kerja ukur dijalankan mengikut spesifikasi LJT / PEJUTA / JKR yang berkaitan.\nBayaran balik caj berkanun agensi kerajaan adalah tuntutan pass-through bebas SST.\nLaporan pengesanan utiliti / laporan teknikal disediakan mengikut keperluan piawaian industri.\nAll fees for survey works will be remunerated in accordance with the subsequent schedule:\n1. 30% of total survey fees to be paid upon mobilization.\n2. 40% of total survey fees to be paid upon completion of field survey.\n3. 30% of total balance survey fees to be paid upon submission of final survey plans and calculations.",

    // Multipliers & Quantities
    terrainMultiplier: 1.00,
    vegetationMultiplier: 1.00,
    itemQuantities: Object.assign({}, PROJECT_TEMPLATES.tpl_jkr_bridge.items),
    itemRates: {},
    deliverables: Object.assign({}, PROJECT_TEMPLATES.tpl_jkr_bridge.deliverables),
    dayworkQuantities: {},
    dayworkRates: {}
};

// Initialize default rates from master array
ALL_BQ_ITEMS.forEach(item => {
    state.itemRates[item.code] = item.defaultRate;
});

DAYWORK_ITEMS.forEach(dw => {
    state.dayworkRates[dw.code] = dw.rate;
});

// ==========================================
// 8. MONEY FORMATTING & SAFE DOM HELPERS
// ==========================================

function formatMoney(amount) {
    const num = parseFloat(amount) || 0.0;
    return num.toLocaleString('en-MY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = (val !== undefined && val !== null) ? val : "";
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
}

function setChecked(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
}

// Distance Zone Helper
function getDistanceZoneObj() {
    return DISTANCE_ZONES[state.distanceZone] || DISTANCE_ZONES.zone_50_150;
}

// Dynamic item name resolution (handles Distance Zone titles for Mob/Demob)
function getItemDisplayName(item, lang) {
    if (item.isMobDemobItem) {
        const zone = getDistanceZoneObj();
        if (state.bqType === "jkr") {
            return lang === "en" ? zone.jkrNameEn : zone.jkrNameBm;
        } else {
            return lang === "en" ? zone.commNameEn : zone.commNameBm;
        }
    }
    if (item.code === "SR_DRAWING") {
        const activeStage2Items = ALL_BQ_ITEMS.filter(it => it.jkrStage === "stage2" && it.code !== "SR_DRAWING" && (state.itemQuantities[it.code] || 0) > 0 && !isItemFiltered(it));
        const refs = [];
        activeStage2Items.forEach(it => {
            const refAndDesc = getItemReferenceAndDescription(it, lang);
            if (refAndDesc.ref && !refs.includes(refAndDesc.ref)) {
                refs.push(refAndDesc.ref);
            }
        });
        const activeRefText = refs.length > 0 ? refs.join(", ") : (lang === "en" ? "no active items" : "tiada item aktif");
        return `Processing & Preparation of Drawings (20% sum of item ${activeRefText})`;
    }
    return (lang === "en" && item.nameEn) ? item.nameEn : item.name;
}

function getItemReferenceAndDescription(item, lang) {
    if (item.code === "SR_DRAWING") {
        return { ref: "", cleanDesc: "" };
    }
    const desc = (lang === "en" && item.descriptionEn) ? item.descriptionEn : item.description;
    if (!desc) return { ref: "", cleanDesc: "" };
    const match = desc.match(/Ref:\s*([^\n\r]+)/i);
    if (match) {
        const refText = match[0].trim();
        const cleanRefVal = refText.replace(/Ref:\s*/i, '').trim();
        const mainDesc = desc.replace(refText, '').trim();
        return { ref: cleanRefVal, cleanDesc: mainDesc };
    }
    return { ref: "", cleanDesc: desc };
}

function isItemFiltered(item) {
    if (state.bqType !== "jkr") return false;
    const filter = state.jkrTerrainFilter || "mixed";
    if (filter === "flat" && item.terrainTag === "hilly") return true;
    if (filter === "hilly" && item.terrainTag === "flat") return true;
    return false;
}

function cleanCategoryName(catName) {
    if (!catName) return "";
    return catName.replace(/^(STAGE\s+\d+\s*:\s*|REIMBURSABLES\s*:\s*|REIMBURSABLE\s*:\s*)/i, '').trim();
}

function getFirmsDirectory() {
    try {
        const stored = localStorage.getItem(FIRMS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("Failed to load firms directory", e);
    }
    saveFirmsDirectory(DEFAULT_FIRMS_DIRECTORY);
    return DEFAULT_FIRMS_DIRECTORY;
}

function saveFirmsDirectory(firms, firmToUpsert = null, firmIdToDelete = null) {
    try {
        localStorage.setItem(FIRMS_STORAGE_KEY, JSON.stringify(firms));

        if (typeof supabaseClient !== 'undefined') {
            if (firmIdToDelete) {
                deleteFirmFromDb(firmIdToDelete);
            } else if (firmToUpsert) {
                upsertFirmToDb(firmToUpsert);
            }
        }
    } catch (e) {
        console.warn("Failed to save firms directory", e);
    }
}

function getClientsDirectory() {
    try {
        const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn("Failed to load clients directory", e);
    }
    saveClientsDirectory(DEFAULT_CLIENTS_DIRECTORY);
    return DEFAULT_CLIENTS_DIRECTORY;
}

function saveClientsDirectory(clients, clientToUpsert = null, clientIdToDelete = null) {
    try {
        localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));

        if (typeof supabaseClient !== 'undefined') {
            if (clientIdToDelete) {
                deleteClientFromDb(clientIdToDelete);
            } else if (clientToUpsert) {
                upsertClientToDb(clientToUpsert);
            }
        }
    } catch (e) {
        console.warn("Failed to save clients directory", e);
    }
}

function populateFirmProfilesDropdown() {
    const dropdown = document.getElementById("firmProfileSelect");
    if (!dropdown) return;
    dropdown.innerHTML = "";

    const firms = getFirmsDirectory();

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = state.currentLang === "en" ? "-- Select Firm Profile --" : "-- Pilih Profil Firma --";
    dropdown.appendChild(defaultOpt);

    firms.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f.id;
        opt.textContent = `${f.firmName} (${f.firmLjtNo || 'LJT'})`;
        if (f.id === state.selectedFirmId) opt.selected = true;
        dropdown.appendChild(opt);
    });
}

function populateClientsDropdown() {
    const dropdown = document.getElementById("clientDirectorySelect");
    if (!dropdown) return;
    dropdown.innerHTML = "";

    const clients = getClientsDirectory();

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = state.currentLang === "en" ? "-- Select Client from Directory --" : "-- Pilih Pelanggan dari Direktori --";
    dropdown.appendChild(defaultOpt);

    clients.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.company} [${c.category || 'Pelanggan'}]`;
        if (c.id === state.selectedClientId) opt.selected = true;
        dropdown.appendChild(opt);
    });
}

function applyFirmProfile(firmId) {
    if (!firmId) return;
    const firms = getFirmsDirectory();
    const firm = firms.find(f => f.id === firmId);
    if (!firm) return;

    state.selectedFirmId = firm.id;
    state.firmName = firm.firmName || "";
    state.letterhead = firm.letterhead || "sjk";
    state.firmLjtNo = firm.firmLjtNo || "";
    state.surveyorLjtNo = firm.surveyorLjtNo || "";
    state.practiceYear = firm.practiceYear || "2026";
    state.piiCoverage = firm.piiCoverage || "RM 1,000,000 (Aktif)";
    state.projectManager = firm.surveyorName || state.projectManager;
    state.firmPhone = firm.phone || "";
    state.firmEmail = firm.email || "";
    state.firmAddress = firm.address || "";
    state.customLogoDataUrl = firm.logoDataUrl || null;
    state.customSignatureDataUrl = firm.signatureDataUrl || null;

    initFormValues();
    renderPreview();
    autoSaveState();
}

function saveCurrentFirmProfile() {
    const firms = getFirmsDirectory();
    const nameInput = (document.getElementById("firmName")?.value || "").trim();
    if (!nameInput) {
        alert(state.currentLang === "en" ? "Please enter a Firm Name." : "Sila masukkan Nama Firma.");
        return;
    }

    let firmId = state.selectedFirmId;
    let firmIndex = firms.findIndex(f => f.id === firmId);

    const firmObj = {
        id: firmId || ("firm_" + Date.now()),
        firmName: nameInput,
        letterhead: state.letterhead || "sjk",
        firmLjtNo: (document.getElementById("firmLjtNo")?.value || "").trim(),
        surveyorName: state.projectManager,
        surveyorLjtNo: (document.getElementById("surveyorLjtNo")?.value || "").trim(),
        practiceYear: (document.getElementById("practiceYear")?.value || "").trim(),
        piiCoverage: (document.getElementById("piiCoverage")?.value || "").trim(),
        phone: (document.getElementById("firmPhone")?.value || "").trim(),
        email: (document.getElementById("firmEmail")?.value || "").trim(),
        address: (document.getElementById("firmAddress")?.value || "").trim(),
        logoDataUrl: state.customLogoDataUrl,
        signatureDataUrl: state.customSignatureDataUrl
    };

    if (firmIndex >= 0) {
        firms[firmIndex] = firmObj;
    } else {
        firmObj.id = "firm_" + Date.now();
        state.selectedFirmId = firmObj.id;
        firms.push(firmObj);
    }

    saveFirmsDirectory(firms, firmObj, null);
    populateFirmProfilesDropdown();
    const selectElem = document.getElementById("firmProfileSelect");
    if (selectElem) selectElem.value = state.selectedFirmId;
    renderPreview();
    autoSaveState();
    alert(state.currentLang === "en" ? "Firm profile saved successfully!" : "Profil firma berjaya disimpan!");
}

function deleteSelectedFirmProfile() {
    const firmId = document.getElementById("firmProfileSelect")?.value;
    if (!firmId) {
        alert(state.currentLang === "en" ? "Please select a profile to delete." : "Sila pilih profil untuk dipadam.");
        return;
    }

    const confirmMsg = state.currentLang === "en" ? "Are you sure you want to delete this firm profile?" : "Adakah anda pasti ingin memadam profil firma ini?";
    if (!confirm(confirmMsg)) return;

    let firms = getFirmsDirectory();
    firms = firms.filter(f => f.id !== firmId);
    saveFirmsDirectory(firms, null, firmId);

    state.selectedFirmId = firms.length > 0 ? firms[0].id : null;
    populateFirmProfilesDropdown();
    if (state.selectedFirmId) {
        applyFirmProfile(state.selectedFirmId);
    } else {
        resetFirmForm();
    }
}

function resetFirmForm() {
    state.selectedFirmId = null;
    state.firmName = "";
    state.firmLjtNo = "";
    state.surveyorLjtNo = "";
    state.practiceYear = "2026";
    state.piiCoverage = "RM 1,000,000 (Aktif)";
    state.firmPhone = "";
    state.firmEmail = "";
    state.firmAddress = "";
    state.customLogoDataUrl = null;
    state.customSignatureDataUrl = null;

    const selectElem = document.getElementById("firmProfileSelect");
    if (selectElem) selectElem.value = "";
    initFormValues();
    renderPreview();
}

function applyClientRecord(clientId) {
    if (!clientId) return;
    const clients = getClientsDirectory();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    state.selectedClientId = client.id;
    state.clientCompany = client.company || "";
    state.clientCategory = client.category || "Agensi Kerajaan";
    if (client.clientRefPrefix) state.clientRef = client.clientRefPrefix;
    state.clientName = client.attnName || "";
    state.clientPhone = client.phone || "";
    state.clientEmail = client.email || "";
    state.clientAddress = client.address || "";

    initFormValues();
    renderPreview();
    autoSaveState();
}

function saveCurrentClientRecord() {
    const clients = getClientsDirectory();
    const companyInput = (document.getElementById("clientCompany")?.value || "").trim();
    if (!companyInput) {
        alert(state.currentLang === "en" ? "Please enter Client Company / Name." : "Sila masukkan Nama Syarikat / Agensi Pelanggan.");
        return;
    }

    let clientId = state.selectedClientId;
    let clientIndex = clients.findIndex(c => c.id === clientId);

    const clientObj = {
        id: clientId || ("cli_" + Date.now()),
        company: companyInput,
        category: document.getElementById("clientCategory")?.value || "Agensi Kerajaan",
        clientRefPrefix: (document.getElementById("clientRef")?.value || "").trim(),
        attnName: (document.getElementById("clientName")?.value || "").trim(),
        phone: (document.getElementById("clientPhone")?.value || "").trim(),
        email: (document.getElementById("clientEmail")?.value || "").trim(),
        address: (document.getElementById("clientAddress")?.value || "").trim()
    };

    if (clientIndex >= 0) {
        clients[clientIndex] = clientObj;
    } else {
        clientObj.id = "cli_" + Date.now();
        state.selectedClientId = clientObj.id;
        clients.push(clientObj);
    }

    saveClientsDirectory(clients, clientObj, null);
    populateClientsDropdown();
    const selectElem = document.getElementById("clientDirectorySelect");
    if (selectElem) selectElem.value = state.selectedClientId;
    renderPreview();
    autoSaveState();
    alert(state.currentLang === "en" ? "Client record saved successfully!" : "Rekod pelanggan berjaya disimpan!");
}

function deleteSelectedClientRecord() {
    const clientId = document.getElementById("clientDirectorySelect")?.value;
    if (!clientId) {
        alert(state.currentLang === "en" ? "Please select a client record to delete." : "Sila pilih rekod pelanggan untuk dipadam.");
        return;
    }

    const confirmMsg = state.currentLang === "en" ? "Are you sure you want to delete this client record?" : "Adakah anda pasti ingin memadam rekod pelanggan ini?";
    if (!confirm(confirmMsg)) return;

    let clients = getClientsDirectory();
    clients = clients.filter(c => c.id !== clientId);
    saveClientsDirectory(clients, null, clientId);

    state.selectedClientId = clients.length > 0 ? clients[0].id : null;
    populateClientsDropdown();
    if (state.selectedClientId) {
        applyClientRecord(state.selectedClientId);
    } else {
        resetClientForm();
    }
}

function resetClientForm() {
    state.selectedClientId = null;
    state.clientCompany = "";
    state.clientCategory = "Agensi Kerajaan";
    state.clientRef = "";
    state.clientName = "";
    state.clientPhone = "";
    state.clientEmail = "";
    state.clientAddress = "";

    const selectElem = document.getElementById("clientDirectorySelect");
    if (selectElem) selectElem.value = "";
    initFormValues();
    renderPreview();
}

function resetNewQuotation() {
    const confirmMsg = state.currentLang === "en"
        ? "Create a new blank quotation? This will reset all current item quantities and discounts."
        : "Cipta sebut harga baharu? Ini akan mengosongkan semua kuantiti BQ dan diskaun semasa.";
    if (!confirm(confirmMsg)) return;

    state.itemQuantities = {};
    state.itemRates = {};
    state.discount = 0;
    initFormValues();
    renderBqTable();
    renderDeliverablesChecklist();
    renderDayworkTable();
    renderPreview();
    autoSaveState();
}

function duplicateQuotation() {
    const confirmMsg = state.currentLang === "en"
        ? "Duplicate the current quotation? This will copy all values and increment the reference."
        : "Duplikasi sebut harga semasa? Ini akan menyalin semua nilai dan menambah rujukan.";
    if (!confirm(confirmMsg)) return;

    const currentRef = state.ourRef || "Quote";
    const copyMatch = currentRef.match(/_Copy(\d+)/i);
    if (copyMatch) {
        const nextCopyNum = parseInt(copyMatch[1], 10) + 1;
        state.ourRef = currentRef.replace(/_Copy\d+/i, `_Copy${nextCopyNum}`);
    } else {
        state.ourRef = `${currentRef}_Copy1`;
    }

    setVal("ourRef", state.ourRef);
    renderPreview();
    autoSaveState();

    alert(state.currentLang === "en"
        ? `Quotation duplicated! New Ref: ${state.ourRef}`
        : `Sebut harga berjaya diduplikasi! Rujukan Baharu: ${state.ourRef}`);
}

function formatDescriptionWithRefBadge(desc) {
    if (!desc) return "";
    const match = desc.match(/Ref:\s*([^\n\r]+)/i);
    if (match) {
        const refText = match[0].trim();
        const mainDesc = desc.replace(refText, '').trim();
        const cleanRefVal = refText.replace(/Ref:\s*/i, '').trim();
        const badgeHtml = `<span class="ref-badge" style="background-color: #ebf8ff; color: #2b6cb0; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.65rem; border: 1px solid #bee3f8; display: inline-block; margin-bottom: 2px;">Ref: ${cleanRefVal}</span>`;
        if (mainDesc) {
            return `${badgeHtml}<br><span style="font-size: 0.7rem; color: #718096;">${mainDesc}</span>`;
        }
        return badgeHtml;
    }
    return `<span style="font-size: 0.7rem; color: #718096;">${desc}</span>`;
}

function getPartyDayRate() {
    const isEastMalaysia = state.landState === "Sabah" || state.landState === "Sarawak" || state.landState === "W.P. Labuan";
    return isEastMalaysia ? 966.00 : 743.00;
}

function getCombinedMultiplier() {
    return parseFloat(state.terrainMultiplier) * parseFloat(state.vegetationMultiplier);
}

function getItemEffectiveRate(item) {
    let baseRate = state.itemRates[item.code] !== undefined ? state.itemRates[item.code] : item.defaultRate;
    if (baseRate === "" || baseRate === null || isNaN(baseRate)) {
        baseRate = item.defaultRate || 0;
    }

    // Dynamic Mob/Demob Rate scaling based on Distance Zone
    if (item.isMobDemobItem) {
        const zone = getDistanceZoneObj();
        if (state.bqType === "jkr") {
            const pdRate = getPartyDayRate();
            baseRate = pdRate * (zone.partyDayScale || 1.0);
        } else {
            baseRate = zone.commDefaultRate || 800.00;
        }
    } else if (item.isPartyDayLinked && state.bqType === "jkr") {
        const factor = item.defaultRate / 743.0;
        baseRate = getPartyDayRate() * factor;
    }

    if (item.applyMultiplier && state.bqType !== "jkr") {
        const combinedFactor = getCombinedMultiplier();
        return baseRate * combinedFactor;
    }
    return baseRate;
}

function updateMultiplierDisplay() {
    const combined = getCombinedMultiplier();
    const formatted = combined.toFixed(2) + "x";
    setText("combinedMultiplierVal", formatted);

    const prevElem = document.getElementById("prevCombinedFactor");
    if (prevElem) {
        const factorDesc = combined === 1.0 ? "1.00x (Normal)" : `${combined.toFixed(2)}x (Pengali Tapak)`;
        prevElem.innerText = factorDesc;
    }
}

// ==========================================
// 12. PERSISTENCE & LOCALSTORAGE (PHASE 6)
// ==========================================

function autoSaveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        const indicator = document.getElementById("autosaveIndicator");
        if (indicator) {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
            indicator.innerHTML = `<span style="color: #276749;">✓ Auto-Saved: ${timeStr}</span>`;
        }
    } catch (e) {
        console.warn("Auto-save to localStorage failed", e);
    }
}

function restoreFromLocalStorage() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(state, parsed);
            return true;
        }
    } catch (e) {
        console.warn("Restore from localStorage failed", e);
    }
    return false;
}

function exportToJson() {
    const exportData = {
        state: state,
        firmsDirectory: getFirmsDirectory(),
        clientsDirectory: getClientsDirectory()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const link = document.createElement("a");
    const safeRef = (state.ourRef || "Quotation").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `SebutHarga_${safeRef}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importFromJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (imported.state) {
                Object.assign(state, imported.state);
                if (imported.firmsDirectory) saveFirmsDirectory(imported.firmsDirectory);
                if (imported.clientsDirectory) saveClientsDirectory(imported.clientsDirectory);
            } else {
                Object.assign(state, imported);
            }
            populateFirmProfilesDropdown();
            populateClientsDropdown();
            initFormValues();
            renderBqTable();
            renderDeliverablesChecklist();
            renderDayworkTable();
            renderPreview();
            autoSaveState();
            alert(state.currentLang === "en" ? "Quotation and directory data successfully loaded!" : "Data sebut harga & direktori berjaya dimuat naik!");
        } catch (err) {
            alert(state.currentLang === "en" ? "Invalid JSON quotation file format." : "Format fail JSON tidak sah.");
        }
    };
    reader.readAsText(file);
}

// ==========================================
// 13. 1-CLICK PROJECT PRESET APPLIER
// ==========================================

function applyProjectTemplate(templateKey) {
    if (!templateKey || !PROJECT_TEMPLATES[templateKey]) return;
    const tpl = PROJECT_TEMPLATES[templateKey];

    state.itemQuantities = {};
    Object.assign(state.itemQuantities, tpl.items);

    state.bqType = tpl.bqType || "ljt";
    state.quoteTitle = state.currentLang === "en" ? (tpl.titleEn || tpl.title) : tpl.title;
    state.quoteSubtitle = state.currentLang === "en" ? (tpl.subtitleEn || tpl.subtitle) : tpl.subtitle;

    if (tpl.firmId) {
        applyFirmProfile(tpl.firmId);
    }

    if (tpl.clientId) {
        applyClientRecord(tpl.clientId);
    } else {
        if (tpl.clientCompany) state.clientCompany = tpl.clientCompany;
        if (tpl.clientCategory) state.clientCategory = tpl.clientCategory;
        if (tpl.clientRef) state.clientRef = tpl.clientRef;
        if (tpl.clientName) state.clientName = tpl.clientName;
        if (tpl.clientPhone) state.clientPhone = tpl.clientPhone;
        if (tpl.clientEmail) state.clientEmail = tpl.clientEmail;
        if (tpl.clientAddress) state.clientAddress = tpl.clientAddress;
    }

    if (tpl.ourRef) state.ourRef = tpl.ourRef;

    state.landState = tpl.landState;
    state.landDistrict = tpl.landDistrict;
    state.landMukim = tpl.landMukim;
    state.lotNo = tpl.lotNo;
    state.titleNo = tpl.titleNo;
    state.landCategory = tpl.landCategory;
    state.landArea = tpl.landArea;
    state.landAreaUnit = tpl.landAreaUnit;
    state.coordSystem = tpl.coordSystem;
    state.verticalDatum = tpl.verticalDatum;
    state.distanceZone = tpl.distanceZone || "zone_50_150";

    state.terrainMultiplier = tpl.terrainMultiplier || 1.0;
    state.vegetationMultiplier = tpl.vegetationMultiplier || 1.0;

    state.duration = tpl.duration;
    state.deposit = tpl.deposit;
    if (tpl.notes) state.notes = tpl.notes;

    if (tpl.deliverables) {
        state.deliverables = Object.assign({}, tpl.deliverables);
    }

    initFormValues();
    renderBqTable();
    renderDeliverablesChecklist();
    renderDayworkTable();
    renderPreview();
    autoSaveState();
}

// ==========================================
// 14. REVISION TRACKER & SMART REF NO
// ==========================================

function incrementRevision() {
    const currentRef = state.ourRef || "SJK/2026/Q-1002-Rev01";
    const revMatch = currentRef.match(/Rev(\d+)/i);

    if (revMatch) {
        const nextRevNum = parseInt(revMatch[1], 10) + 1;
        const formattedRev = String(nextRevNum).padStart(2, '0');
        state.ourRef = currentRef.replace(/Rev\d+/i, `Rev${formattedRev}`);
    } else {
        state.ourRef = `${currentRef}-Rev02`;
    }

    state.quoteDate = new Date().toISOString().split("T")[0];
    setVal("ourRef", state.ourRef);
    setVal("quoteDate", state.quoteDate);
    renderPreview();
    autoSaveState();
}

// ==========================================
// 15. LANGUAGE & LOCALIZATION SWITCHER
// ==========================================

function setLanguage(lang) {
    state.currentLang = lang;

    const bmBtn = document.getElementById("langBmBtn");
    const enBtn = document.getElementById("langEnBtn");
    if (bmBtn) bmBtn.classList.toggle("active", lang === "bm");
    if (enBtn) enBtn.classList.toggle("active", lang === "en");

    const t = TRANSLATIONS[lang];

    setText("uiHeaderTitle", t.headerTitle);
    setText("uiHeaderSubtitle", t.headerSubtitle);
    setText("lblTemplateSelect", t.lblTemplateSelect);
    setText("btnApplyTemplate", t.btnApplyTemplate);
    setText("btnTextNewQuote", t.btnNewQuote);
    setText("btnTextDuplicate", t.btnDuplicate);
    setText("btnTextSave", t.btnSaveDraft);
    setText("tab1Btn", t.tab1);
    setText("tab2Btn", t.tab2);

    setText("secTitleConfig", t.secConfig);
    setText("secTitleLandAdmin", t.secLandAdmin);
    setText("secTitleClient", t.secClient);
    setText("secTitleTerms", t.secTerms);
    setText("lblMultiplierTitle", t.secMultiplier);
    setText("secTitleDaywork", t.secDaywork);
    setText("secTitleDeliverables", t.secDeliverables);

    setText("lblFirmProfileSelect", t.lblFirmProfileSelect);
    setText("btnNewFirmProfile", t.btnNewFirmProfile);
    setText("btnSaveFirmProfile", t.btnSaveFirmProfile);
    setText("btnDeleteFirmProfile", t.btnDeleteFirmProfile);

    setText("lblClientDirectorySelect", t.lblClientDirectorySelect);
    setText("btnNewClient", t.btnNewClient);
    setText("btnSaveClient", t.btnSaveClient);
    setText("btnDeleteClient", t.btnDeleteClient);

    setText("lblFirmName", t.lblFirmName);
    setText("lblBqType", t.lblBqType);
    setText("lblFirmLjtNo", t.lblFirmLjtNo);
    setText("lblSurveyorLjtNo", t.lblSurveyorLjtNo);
    setText("lblPracticeYear", t.lblPracticeYear);
    setText("lblPiiCoverage", t.lblPiiCoverage);
    setText("lblFirmPhone", t.lblFirmPhone);
    setText("lblFirmEmail", t.lblFirmEmail);
    setText("lblFirmAddress", t.lblFirmAddress);
    setText("lblCustomLogo", t.lblCustomLogo);
    setText("lblCustomSignature", t.lblCustomSignature);

    setText("lblLandState", t.lblLandState);
    setText("lblLandDistrict", t.lblLandDistrict);
    setText("lblLandMukim", t.lblLandMukim);
    setText("lblLotNo", t.lblLotNo);
    setText("lblTitleNo", t.lblTitleNo);
    setText("lblLandCategory", t.lblLandCategory);
    setText("lblLandArea", t.lblLandArea);
    setText("lblCoordSystem", t.lblCoordSystem);
    setText("lblVerticalDatum", t.lblVerticalDatum);
    setText("lblDistanceZone", t.lblDistanceZone);

    // Update Distance Zone Options text
    const distSelect = document.getElementById("distanceZone");
    if (distSelect) {
        Object.keys(DISTANCE_ZONES).forEach(key => {
            const opt = distSelect.querySelector(`option[value="${key}"]`);
            if (opt) {
                opt.textContent = lang === "en" ? DISTANCE_ZONES[key].labelEn : DISTANCE_ZONES[key].labelBm;
            }
        });
    }

    setText("lblClientCompany", t.lblClientCompany);
    setText("lblClientCategory", t.lblClientCategory);
    setText("lblClientRef", t.lblClientRef);
    setText("lblOurRef", t.lblOurRef);
    setText("lblQuoteDate", t.lblQuoteDate);
    setText("lblClientName", t.lblClientName);
    setText("lblClientPhone", t.lblClientPhone);
    setText("lblClientEmail", t.lblClientEmail);
    setText("lblClientAddress", t.lblClientAddress);

    setText("lblQuoteTitle", t.lblQuoteTitle);
    setText("lblQuoteSubtitle", t.lblQuoteSubtitle);
    setText("lblProjectManager", t.lblProjectManager);
    setText("lblDuration", t.lblDuration);
    setText("lblDeposit", t.lblDeposit);
    setText("lblDiscount", t.lblDiscount);
    setText("lblEnableSst", t.lblEnableSst);
    setText("lblNotes", t.lblNotes);

    setText("combinedMultiplierLabel", t.combinedMultiplierLabel);
    setText("lblTerrainMultiplier", t.lblTerrainMultiplier);
    setText("lblVegetationMultiplier", t.lblVegetationMultiplier);
    setText("lblMultiplierNote", t.lblMultiplierNote);

    const statWarn = document.getElementById("statutoryWarningText");
    if (statWarn) {
        statWarn.innerHTML = `<strong>${lang === 'bm' ? 'Peringatan Pematuhan Akta 458:' : 'Act 458 Compliance Notice:'}</strong> ${t.statutoryWarningText}`;
    }

    setText("btnFilterAll", t.btnAll);
    setText("btnFilterPartA", state.bqType === "jkr" ? (lang === "en" ? "Stage 1 (Preliminary)" : "Stage 1 (Awalan)") : t.btnPartA);
    setText("btnFilterPartB", state.bqType === "jkr" ? (lang === "en" ? "Stage 2 (Setting Out)" : "Stage 2 (Pancangan)") : t.btnPartB);
    setText("btnFilterPartC", state.bqType === "jkr" ? (lang === "en" ? "Reimbursables (PBT)" : "Reimbursables (PBT)") : t.btnPartC);
    setText("btnFilterDaywork", t.btnDaywork);
    setText("btnFilterDeliverables", t.btnDeliverables);

    setText("thCode", t.thCode);
    setText("thDesc", t.thDesc);
    setText("thUnit", t.thUnit);
    setText("thQty", t.thQty);
    setText("thRate", t.thRate);

    setText("prevStepBtn", t.btnBack);
    setText("nextStepBtn", t.btnNext);
    setText("btnTextPrint", t.btnPrint);
    setText("btnTextCsv", t.btnCsv);
    setText("btnTextPdf", t.btnPdf);

    populateFirmProfilesDropdown();
    populateClientsDropdown();
    renderBqTable();
    renderDeliverablesChecklist();
    renderDayworkTable();
    renderPreview();
    autoSaveState();
}

// ==========================================
// 16. BQ TABLE FORM RENDERING & FILTERING
// ==========================================

let activeFilter = "all";

function sortBqItemsForRender(items) {
    items.sort((a, b) => {
        // Sort by Code SR number mathematically (Abaikan Kategori & Stage, ikut nombor mutlak)
        const getNum = (code) => {
            if (!code) return 99999;
            const match = code.match(/\d+/);
            return match ? parseInt(match[0], 10) : 99999;
        };
        const numA = getNum(a.code);
        const numB = getNum(b.code);
        if (numA !== numB) return numA - numB;

        // Fallback to normal string compare if same number
        return (a.code || '').localeCompare(b.code || '');
    });

    // console.log("DEBUG SORTING RESULTS: ", items.map(x => x.code).join(", "));
    return items;
}

function renderBqTable() {
    const tableBody = document.getElementById("formBqTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const lang = state.currentLang;
    const t = TRANSLATIONS[lang];
    const isJkr = state.bqType === "jkr";
    let currentCategory = "";
    let currentSubCategory = "";
    let currentSubSubCategory = "";
    let currentSection = "";

    let filteredItems = ALL_BQ_ITEMS.filter(it => !isItemFiltered(it));
    filteredItems = sortBqItemsForRender(filteredItems);

    filteredItems.forEach(item => {
        item._jkrPrintDesc = "";

        // Section Filtering logic
        if (isJkr) {
            if (activeFilter === "part_a" && item.jkrStage !== "stage1") return;
            if (activeFilter === "part_b" && item.jkrStage !== "stage2") return;
            if (activeFilter === "part_c" && item.jkrStage !== "reimbursable") return;
        } else {
            if (activeFilter === "part_a" && item.section !== "A") return;
            if (activeFilter === "part_b" && item.section !== "B") return;
            if (activeFilter === "part_c" && item.section !== "C") return;
        }

        const itemSecKey = isJkr ? item.jkrStage : item.section;
        if (itemSecKey !== currentSection && activeFilter === "all") {
            currentSection = itemSecKey;
            const secRow = document.createElement("tr");
            let secClass = "section-header-row";
            let secTitle = "";

            if (isJkr) {
                if (currentSection === "stage1") {
                    secClass = "section-header-row";
                    secTitle = t.jkrStage1Band;
                } else if (currentSection === "stage2") {
                    secClass = "section-header-row section-b";
                    secTitle = t.jkrStage2Band;
                } else {
                    secClass = "section-header-row section-c";
                    secTitle = t.jkrReimbursableBand;
                }
            } else {
                if (currentSection === "A") {
                    secClass = "section-header-row";
                    secTitle = t.sectionABand;
                } else if (currentSection === "B") {
                    secClass = "section-header-row section-b";
                    secTitle = t.sectionBBand;
                } else {
                    secClass = "section-header-row section-c";
                    secTitle = t.sectionCBand;
                }
            }

            secRow.className = secClass;
            const totalFormCols = state.showRefColumn ? 6 : 5;
            secRow.innerHTML = `<td colspan="${totalFormCols}" style="padding: 0.5rem 0.65rem;">${secTitle}</td>`;
            tableBody.appendChild(secRow);
        }

        const categoryName = (lang === "en" && item.categoryEn) ? item.categoryEn : item.category;
        if (categoryName !== currentCategory) {
            currentCategory = categoryName;
            currentSubCategory = "";
            currentSubSubCategory = "";
            const catRow = document.createElement("tr");
            catRow.className = "category-row";
            const totalFormCols = state.showRefColumn ? 6 : 5;
            catRow.innerHTML = `<td colspan="${totalFormCols}" style="font-weight: 700;">${cleanCategoryName(currentCategory)}</td>`;
            tableBody.appendChild(catRow);
        }

        const subCategoryName = (lang === "en" && item.subCategoryEn) ? item.subCategoryEn : item.subCategory;
        if (subCategoryName && subCategoryName !== currentSubCategory) {
            currentSubCategory = subCategoryName;
            currentSubSubCategory = "";
            const subCatRow = document.createElement("tr");
            subCatRow.className = "sub-category-row";
            const totalFormCols = state.showRefColumn ? 6 : 5;
            subCatRow.innerHTML = `<td colspan="${totalFormCols}" style="font-weight: 600; font-size: 0.75rem; color: #2b6cb0; padding: 0.35rem 0.65rem; background-color: #f7fafc; padding-left: 1.5rem; border-bottom: 1px solid #edf2f7;">${subCategoryName}</td>`;
            tableBody.appendChild(subCatRow);
        } else if (!subCategoryName) {
            currentSubCategory = "";
        }

        const subSubCategoryName = (lang === "en" && item.subSubCategoryEn) ? item.subSubCategoryEn : item.subSubCategory;
        if (subSubCategoryName && subSubCategoryName !== currentSubSubCategory) {
            currentSubSubCategory = subSubCategoryName;
            const subSubCatRow = document.createElement("tr");
            subSubCatRow.className = "sub-sub-category-row";
            const totalFormCols = state.showRefColumn ? 6 : 5;
            subSubCatRow.innerHTML = `<td colspan="${totalFormCols}" style="font-weight: 600; font-size: 0.7rem; color: #555; padding: 0.35rem 0.65rem; background-color: #fdfdfd; padding-left: 2.2rem; border-bottom: 1px dashed #edf2f7;">${subSubCategoryName}</td>`;
            tableBody.appendChild(subSubCatRow);
        } else if (!subSubCategoryName) {
            currentSubSubCategory = "";
        }

        let itemName = getItemDisplayName(item, lang);
        const itemDesc = (lang === "en" && item.descriptionEn) ? item.descriptionEn : item.description;
        const effectiveRate = getItemEffectiveRate(item);

        const tr = document.createElement("tr");

        let multiplierBadge = "";
        if (item.applyMultiplier && state.bqType !== "jkr" && getCombinedMultiplier() > 1.0) {
            multiplierBadge = `<span style="background: #edf2f7; color: #2b6cb0; font-size: 0.68rem; font-weight: 700; padding: 1px 4px; border-radius: 3px; margin-left: 4px;">*${getCombinedMultiplier().toFixed(2)}x</span>`;
        }

        let statutoryBadge = "";
        if (item.isStatutory) {
            statutoryBadge = `<span style="background: #feebc8; color: #7b341e; font-size: 0.65rem; font-weight: 700; padding: 1px 4px; border-radius: 3px; margin-left: 4px;">LJT / PBT</span>`;
        }

        const refAndDesc = getItemReferenceAndDescription(item, lang);
        tr.innerHTML = `
            <td style="font-weight: bold; width: 8%; text-align: center;">${item.code}</td>
            <td class="ref-col" style="width: 12%; text-align: left; font-weight: 600; font-size: 0.75rem; color: #2b6cb0;">
                ${refAndDesc.ref ? `<span class="ref-badge" style="background-color: #ebf8ff; color: #2b6cb0; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.68rem; border: 1px solid #bee3f8; display: inline-block;">Ref: ${refAndDesc.ref}</span>` : ''}
            </td>
            <td style="width: 44%;">
                <strong>${itemName}</strong> ${statutoryBadge} ${multiplierBadge}
                ${refAndDesc.cleanDesc ? `<br><span style="font-size: 0.7rem; color: #718096;">${refAndDesc.cleanDesc}</span>` : ''}
            </td>
            <td style="width: 12%; text-align: center;">${item.unit}</td>
            <td style="width: 14%;">
                <input type="number" class="qty-form-input" data-code="${item.code}" value="${state.itemQuantities[item.code] || ''}" placeholder="0" min="0" step="any" style="width: 100%; text-align: center;">
            </td>
            <td style="width: 22%;">
                <input type="number" class="rate-form-input" data-code="${item.code}" value="${effectiveRate.toFixed(2)}" placeholder="${effectiveRate.toFixed(2)}" min="0" step="any" style="width: 100%; text-align: right;">
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderDayworkTable() {
    const tableBody = document.getElementById("formDayworkTableBody");
    if (!tableBody) return;
    tableBody.innerHTML = "";

    const lang = state.currentLang;

    DAYWORK_ITEMS.forEach(dw => {
        const dwName = (lang === "en" && dw.nameEn) ? dw.nameEn : dw.name;
        const currentRate = state.dayworkRates[dw.code] || dw.rate;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight: bold; text-align: center;">${dw.code}</td>
            <td><strong>${dwName}</strong></td>
            <td style="text-align: center;">${dw.unit}</td>
            <td>
                <input type="number" class="daywork-rate-input" data-code="${dw.code}" value="${currentRate.toFixed(2)}" style="width: 100%; text-align: right;">
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function renderDeliverablesChecklist() {
    const container = document.getElementById("deliverablesChecklistGrid");
    if (!container) return;
    container.innerHTML = "";

    const lang = state.currentLang;

    DELIVERABLES_OPTIONS.forEach(del => {
        const labelText = (lang === "en" && del.labelEn) ? del.labelEn : del.label;
        const isChecked = state.deliverables[del.id] !== undefined ? state.deliverables[del.id] : del.defaultChecked;

        const itemDiv = document.createElement("div");
        itemDiv.className = "deliverable-item";
        itemDiv.innerHTML = `
            <input type="checkbox" id="${del.id}" class="deliverable-chk" ${isChecked ? 'checked' : ''}>
            <label for="${del.id}" style="cursor: pointer; margin-bottom: 0;">${labelText}</label>
        `;
        container.appendChild(itemDiv);
    });
}

// ==========================================
// 17. 3-TIER FINANCIAL CALCULATION ENGINE
// ==========================================

function computeFinancialSummary() {
    const isJkr = state.bqType === "jkr";

    let subtotalStage1 = 0.0;
    let subtotalStage2 = 0.0;
    let subtotalReimbursables = 0.0;

    let stage2ActiveTotal = 0.0;
    ALL_BQ_ITEMS.forEach(it => {
        if (isItemFiltered(it)) return;
        if (it.jkrStage === "stage2" && it.code !== "SR_DRAWING") {
            const q = parseFloat(state.itemQuantities[it.code]) || 0;
            if (q > 0) {
                const r = getItemEffectiveRate(it);
                stage2ActiveTotal += q * r;
            }
        }
    });

    let subtotalA = 0.0;
    let subtotalB = 0.0;
    let subtotalC = 0.0;
    let hasActiveStatutoryCadastral = false;

    // Compute LiDAR Stage 2 Acquisition subtotal first
    let lidarStage2AcquisitionSubtotal = 0.0;
    ALL_BQ_ITEMS.forEach(item => {
        if (isItemFiltered(item)) return;
        if (item.category === "STAGE 2: AERIAL MAPPING (LiDAR) - DATA ACQUISITION" ||
            item.categoryEn === "STAGE 2: AERIAL MAPPING (LiDAR) - DATA ACQUISITION") {
            const qty = parseFloat(state.itemQuantities[item.code]) || 0;
            if (qty > 0) {
                const rate = getItemEffectiveRate(item);
                lidarStage2AcquisitionSubtotal += qty * rate;
            }
        }
    });

    ALL_BQ_ITEMS.forEach(item => {
        if (isItemFiltered(item)) return;
        const qty = parseFloat(state.itemQuantities[item.code]) || 0;
        if (qty <= 0) return;

        const rate = getItemEffectiveRate(item);
        let itemTotal = 0.0;
        if (item.unit === "%") {
            if (item.code === "SR_DRAWING") {
                itemTotal = qty * (rate / 100.0) * stage2ActiveTotal;
            } else {
                itemTotal = qty * (rate / 100.0) * lidarStage2AcquisitionSubtotal;
            }
        } else {
            itemTotal = qty * rate;
        }

        if (isJkr) {
            if (item.jkrStage === "stage1") {
                subtotalStage1 += itemTotal;
            } else if (item.jkrStage === "stage2") {
                subtotalStage2 += itemTotal;
            } else {
                subtotalReimbursables += itemTotal;
            }
        } else {
            if (item.section === "A") {
                subtotalA += itemTotal;
                if (item.isStatutory) hasActiveStatutoryCadastral = true;
            } else if (item.section === "B") {
                subtotalB += itemTotal;
            } else if (item.section === "C") {
                subtotalC += itemTotal;
            }
        }
    });

    if (isJkr) {
        const totalConsultantFee = subtotalStage1 + subtotalStage2;
        const discountAmount = Math.min(parseFloat(state.discount) || 0.0, totalConsultantFee);
        const discountedConsultantFee = Math.max(0, totalConsultantFee - discountAmount);
        const sstAmount = state.enableSst ? ((discountedConsultantFee + subtotalReimbursables) * 0.08) : 0.0;
        const grandTotal = discountedConsultantFee + subtotalReimbursables + sstAmount;

        return {
            isJkr: true,
            subtotalStage1,
            subtotalStage2,
            totalConsultantFee,
            discountAmount,
            discountedConsultantFee,
            sstAmount,
            netConsultantFee: discountedConsultantFee + sstAmount,
            subtotalReimbursables,
            grandTotal,
            hasActiveStatutoryCadastral: false
        };
    } else {
        const discountA = Math.min(parseFloat(state.discount) || 0.0, subtotalA);
        const discountedSubtotalA = Math.max(0, subtotalA - discountA);
        const sstA = state.enableSst ? (discountedSubtotalA * 0.08) : 0.0;
        const netA = discountedSubtotalA + sstA;
        const grandTotal = netA + subtotalB + subtotalC;

        return {
            isJkr: false,
            subtotalA,
            discountA,
            discountedSubtotalA,
            sstA,
            netA,
            subtotalB,
            subtotalC,
            grandTotal,
            hasActiveStatutoryCadastral
        };
    }
}

// ==========================================
// 18. LIVE A4 PREVIEW RENDERER (WITH FORMATMONEY & SCALED SEAL)
// ==========================================

function formatDateString(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const monthsBm = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
    const monthsEn = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const months = state.currentLang === "en" ? monthsEn : monthsBm;
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}


// JKR Dynamic Numbering & Flattening
function applyJkrDynamicNumbering() {
    const isJkr = state.bqType === 'jkr';
    if (!isJkr) return;

    const flattenCategories = [
        "STAGE 1: MOBILIZATION AND DEMOBILIZATION",
        "STAGE 1: POINT POSITIONING BY SATELLITE (GPS)",
        "STAGE 1: SURVEY IN SECURITY AREAS",
        "STAGE 1: SURVEY OF STRIP WITH SPOT LEVEL AND DETAIL",
        "STAGE 1: CROSS SECTION WITH SOUNDING",
        "STAGE 1: LONGITUDINAL PROFILING ALONG ESTABLISH CHAINAGE PEGS",
        "STAGE 1: CROSS SECTIONING",
        "STAGE 1: SURVEY OF STRIP WITH DETAIL",
        "STAGE 2: MOBILIZATION AND DEMOBILIZATION",
        "STAGE 2: SURVEY IN SECURITY AREAS",
        "STAGE 1: PLANIMETRIC CONTROL AND CONNECTION",
        "STAGE 1: HEIGHT CONTROL AND CONNECTION",
        "STAGE 1: MARKING OF TREES WITHIN THE RESERVE BOUNDARIES",
        "STAGE 1: Contour and Detail",
        "STAGE 1: Grid Heighing",
        "STAGE 1: SURVEY OF BRIDGE SITES",
        "STAGE 1: Bathhymatric (Offshore) Profiling",
        "STAGE 2: SETTING OUT CENTRELINE OF ROAD AND RAILWAY (20m interval)",
        "STAGE 2: SETTING OUT RESERVE BOUNDARIES"
    ];

    function getLetter(index) {
        let letter = "";
        while (index >= 0) {
            letter = String.fromCharCode(97 + (index % 26)) + letter;
            index = Math.floor(index / 26) - 1;
        }
        return letter;
    }

    let catCounts = {};
    const lang = state.currentLang;

    ALL_BQ_ITEMS.forEach(item => {
        if (isItemFiltered(item)) return;
        const qty = parseFloat(state.itemQuantities[item.code]) || 0;
        if (qty <= 0) return;
        const cat = item.category;
        if (catCounts[cat] === undefined) catCounts[cat] = 0;

        let baseDesc = (lang === "en" && item.nameEn) ? item.nameEn : item.name;

        if (item.subCategory) {
            baseDesc = (lang === "en" && item.subCategoryEn) ? item.subCategoryEn : item.subCategory;
        } else if (item._originalCategory && flattenCategories.includes(item._originalCategory.trim())) {
            let parentName = item._originalCategory.replace(/^STAGE \d+:\s*/i, "");
            parentName = parentName.replace(/\(GPS\)/i, "(GPS)");
            baseDesc = parentName;
        } else {
            baseDesc = baseDesc.replace(/^([a-z]|[ivx]+)[\.\)]\s*/i, "");
        }


        baseDesc = baseDesc.charAt(0).toUpperCase() + baseDesc.slice(1).toLowerCase();
        baseDesc = baseDesc.replace(/\b(gps|jkr|ptg|pdt|lidar|rm)\b/gi, match => {
            if (match.toLowerCase() === 'lidar') return 'LiDAR';
            if (match.toLowerCase() === 'rm') return 'RM';
            return match.toUpperCase();
        });
        const letter = getLetter(catCounts[cat]);
        catCounts[cat]++;
        item._jkrPrintDesc = letter + ". " + baseDesc;
    });
}

function renderPreview() {
    if (typeof fixJkrCategoriesGrouping === "function") fixJkrCategoriesGrouping();
    if (typeof applyJkrDynamicNumbering === "function") applyJkrDynamicNumbering();
    const lang = state.currentLang;
    const t = TRANSLATIONS[lang];
    const fin = computeFinancialSummary();
    const isJkr = state.bqType === "jkr";
    const zone = getDistanceZoneObj();

    // 1. Check Statutory Cadastral Discount Warning
    const warningElem = document.getElementById("statutoryWarningBanner");
    if (warningElem) {
        if (state.discount > 0 && fin.hasActiveStatutoryCadastral) {
            warningElem.style.display = "flex";
        } else {
            warningElem.style.display = "none";
        }
    }

    // 2. Render Letterhead using Active Firm Profile
    const letterheadContainer = document.getElementById("prevLetterhead");
    if (letterheadContainer) {
        let logoHtml = "";
        if (state.customLogoDataUrl) {
            logoHtml = `
                <div class="letterhead-logo" style="border: none;">
                    <img src="${state.customLogoDataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>
            `;
        } else {
            logoHtml = `
                <div class="letterhead-logo">
                    <svg width="45" height="45" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="15" y="15" width="70" height="70" rx="4" stroke="#1a365d" stroke-width="6"/>
                        <line x1="50" y1="15" x2="50" y2="85" stroke="#1a365d" stroke-width="3" />
                        <line x1="15" y1="50" x2="85" y2="50" stroke="#1a365d" stroke-width="3" />
                        <circle cx="50" cy="50" r="12" fill="#b8922e" stroke="#1a365d" stroke-width="2"/>
                    </svg>
                </div>
            `;
        }

        const firmTitle = state.firmName || "Syarikat Jurukur Konsultant (SJK)";
        const firmSubtitle = `Licensed Land Surveyors & Geomatics Engineering Consultants | No. LJT: ${state.firmLjtNo}`;
        const firmAddress = state.firmAddress || "No. 45A, Jalan Tun Sambanthan, Brickfields, 50470 Kuala Lumpur";
        const firmContact = `Tel: ${state.firmPhone || '+603-2274 5566'} | E-mel: ${state.firmEmail || 'admin@sjk.com.my'}`;

        letterheadContainer.innerHTML = `
            ${logoHtml}
            <div class="letterhead-info">
                <div class="letterhead-title">${firmTitle}</div>
                <div class="letterhead-subtitle">${firmSubtitle}</div>
                <div class="letterhead-contact">
                    ${firmAddress}<br>
                    ${firmContact}
                </div>
            </div>
        `;
    }

    // 3. Document Meta Details
    setText("prevLblTo", t.prevTo);
    setText("prevClientCompany", state.clientCompany || "-");
    setText("prevClientName", state.clientName || "-");

    let clientContactDetails = "";
    if (state.clientPhone) clientContactDetails += `Tel: ${state.clientPhone}\n`;
    if (state.clientEmail) clientContactDetails += `Emel: ${state.clientEmail}`;
    setText("prevClientContact", clientContactDetails);

    const clientAddressEl = document.getElementById("prevClientAddress");
    if (clientAddressEl) {
        const addressStr = state.clientAddress || "";
        clientAddressEl.innerHTML = addressStr.replace(/\n/g, "<br>");
    }

    setText("prevLblOurRef", t.prevOurRef);
    setText("prevOurRef", state.ourRef || "-");
    setText("prevLblClientRef", t.prevClientRef);
    setText("prevClientRef", state.clientRef || "-");
    setText("prevLblQuoteDate", t.prevDate);
    setText("prevQuoteDate", formatDateString(state.quoteDate));
    setText("prevLblLjtFirm", t.prevLjtFirm);
    setText("prevFirmLjtNo", state.firmLjtNo || "-");

    // 4. Land Administration Metadata Box (Includes Distance Zone)
    setText("prevLblLandInfo", t.prevLandInfo);
    setText("prevLandStateDisplay", state.landState);
    setText("prevLblLot", t.prevLot);
    setText("prevLotNo", state.lotNo || "-");
    setText("prevLblTitle", t.prevTitle);
    setText("prevTitleNo", state.titleNo || "-");
    setText("prevLblMukim", t.prevMukim);
    setText("prevMukimDistrict", `${state.landMukim || '-'}, ${state.landDistrict || '-'}`);
    setText("prevLblArea", t.prevArea);
    setText("prevArea", `${state.landArea || '-'} ${state.landAreaUnit || ''}`);
    setText("prevLblCategory", t.prevCategory);
    setText("prevLandCategory", state.landCategory || "-");
    setText("prevLblCoord", t.prevCoord);
    setText("prevCoordSystem", state.coordSystem || "-");
    setText("prevLblDatum", t.prevDatum);
    setText("prevVerticalDatum", state.verticalDatum || "-");
    setText("prevLblSiteFactor", t.prevSiteFactor);

    const combined = getCombinedMultiplier();
    setText("prevCombinedFactor", combined === 1.0 ? "1.00x (Normal)" : `${combined.toFixed(2)}x (Pengali Tapak)`);

    setText("prevLblDistanceZone", t.prevDistanceZone || "Zon Jarak:");
    setText("prevDistanceZoneDisplay", lang === "en" ? zone.displayEn : zone.displayBm);

    // 5. Document Titles
    setText("prevQuoteTitle", state.quoteTitle || "-");
    setText("prevQuoteSubtitle", state.quoteSubtitle || "");

    // 6. Table Headers
    setText("prevThNo", t.prevThNo);
    setText("prevThScope", t.prevThScope);
    setText("prevThUnit", t.prevThUnit);
    setText("prevThQty", t.prevThQty);
    setText("prevThRate", t.prevThRate);
    setText("prevThTotal", t.prevThTotal);

    // 7. Render Items Table in Document with Thousands Separator (formatMoney)
    const previewTableBody = document.getElementById("prevBqTableBody");
    if (previewTableBody) {
        previewTableBody.innerHTML = "";

        const renderGroupItems = (filterFn, sectionTitle, sectionClass) => {
            let matchingItems = ALL_BQ_ITEMS.filter(item => filterFn(item) && (state.itemQuantities[item.code] || 0) > 0 && !isItemFiltered(item));
            matchingItems = sortBqItemsForRender(matchingItems);
            if (matchingItems.length === 0) return 0;

            const totalCols = state.showRefColumn ? 7 : 6;
            const secRow = document.createElement("tr");
            secRow.className = `section-band-row ${sectionClass}`;
            secRow.innerHTML = `<td colspan="${totalCols}">${sectionTitle}</td>`;
            previewTableBody.appendChild(secRow);

            let currentCat = "";
            let currentSubCat = "";
            let currentSubSubCat = "";
            let secSum = 0;

            // Compute LiDAR Stage 2 Acquisition subtotal
            let lidarStage2AcquisitionSubtotal = 0.0;
            ALL_BQ_ITEMS.forEach(it => {
                if (isItemFiltered(it)) return;

                if (it.category === "STAGE 2: AERIAL MAPPING (LiDAR) - DATA ACQUISITION" ||
                    it.categoryEn === "STAGE 2: AERIAL MAPPING (LiDAR) - DATA ACQUISITION") {
                    const q = parseFloat(state.itemQuantities[it.code]) || 0;
                    if (q > 0) {
                        const r = getItemEffectiveRate(it);
                        lidarStage2AcquisitionSubtotal += q * r;
                    }
                }
            });

            let stage2ActiveTotal = 0.0;
            ALL_BQ_ITEMS.forEach(it => {
                if (isItemFiltered(it)) return;
                if (it.jkrStage === "stage2" && it.code !== "SR_DRAWING") {
                    const q = parseFloat(state.itemQuantities[it.code]) || 0;
                    if (q > 0) {
                        const r = getItemEffectiveRate(it);
                        stage2ActiveTotal += q * r;
                    }
                }
            });

            matchingItems.forEach(item => {
                const catName = (lang === "en" && item.categoryEn) ? item.categoryEn : item.category;
                if (catName !== currentCat) {
                    currentCat = catName;
                    currentSubCat = "";
                    currentSubSubCat = "";
                    const catRow = document.createElement("tr");
                    catRow.className = "item-stage-row";
                    catRow.innerHTML = `
                        <td class="center" style="font-weight: bold;"></td>
                        <td colspan="${totalCols - 1}" style="font-weight: bold; text-transform: uppercase;">${cleanCategoryName(currentCat)}</td>
                    `;
                    previewTableBody.appendChild(catRow);
                }

                const subCatName = (lang === "en" && item.subCategoryEn) ? item.subCategoryEn : item.subCategory;
                if (state.bqType !== 'jkr') {
                    if (subCatName && subCatName !== currentSubCat) {
                        currentSubCat = subCatName;
                        currentSubSubCat = "";
                        const subCatRow = document.createElement("tr");
                        subCatRow.className = "item-sub-stage-row";
                        subCatRow.innerHTML = `
                            <td class="center"></td>
                            <td colspan="${totalCols - 1}" style="font-weight: 600; font-size: 0.72rem; color: #2b6cb0; background-color: #fcfcfc; padding: 0.25rem 0.5rem; text-align: left; padding-left: 1rem; border-bottom: 1px solid #edf2f7;">${subCatName}</td>
                        `;
                        previewTableBody.appendChild(subCatRow);
                    } else if (!subCatName) {
                        currentSubCat = "";
                    }
                }

                const subSubCatName = (lang === "en" && item.subSubCategoryEn) ? item.subSubCategoryEn : item.subSubCategory;
                if (state.bqType !== 'jkr') {
                    if (subSubCatName && subSubCatName !== currentSubSubCat) {
                        currentSubSubCat = subSubCatName;
                        const subSubCatRow = document.createElement("tr");
                        subSubCatRow.className = "item-sub-sub-stage-row";
                        subSubCatRow.innerHTML = `
                            <td class="center"></td>
                            <td colspan="${totalCols - 1}" style="font-weight: 600; font-size: 0.68rem; color: #555; background-color: #fdfdfd; padding: 0.25rem 0.5rem; text-align: left; padding-left: 1.5rem; border-bottom: 1px dashed #edf2f7; font-style: italic;">${subSubCatName}</td>
                        `;
                        previewTableBody.appendChild(subSubCatRow);
                    } else if (!subSubCatName) {
                        currentSubSubCat = "";
                    }
                }

                const qty = parseFloat(state.itemQuantities[item.code]) || 0;
                const rate = getItemEffectiveRate(item);
                let total = 0.0;
                if (item.unit === "%") {
                    if (item.code === "SR_DRAWING") {
                        total = qty * (rate / 100.0) * stage2ActiveTotal;
                    } else {
                        total = qty * (rate / 100.0) * lidarStage2AcquisitionSubtotal;
                    }
                } else {
                    total = qty * rate;
                }
                secSum += total;

                let itemName = getItemDisplayName(item, lang);
                if (state.bqType === 'jkr' && item._jkrPrintDesc) {
                    itemName = item._jkrPrintDesc;
                }
                const refAndDesc = getItemReferenceAndDescription(item, lang);

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td class="center" style="font-weight: bold;">${item.code}</td>
                    <td class="ref-col" style="font-size: 0.7rem; color: #2b6cb0; text-align: left; vertical-align: top;">
                        ${refAndDesc.ref ? `<span class="ref-badge" style="background-color: #ebf8ff; color: #2b6cb0; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.68rem; border: 1px solid #bee3f8; display: inline-block;">Ref: ${refAndDesc.ref}</span>` : ''}
                    </td>
                    <td>
                        <strong>${itemName}</strong>
                        ${refAndDesc.cleanDesc ? `<br><span style="font-size: 0.68rem; color: #4a5568; font-family: var(--font-sans);">${refAndDesc.cleanDesc}</span>` : ''}
                    </td>
                    <td class="center">${item.unit}</td>
                    <td class="center">${qty}</td>
                    <td class="right">${item.unit === "%" ? rate.toFixed(2) + " %" : formatMoney(rate)}</td>
                    <td class="right">${formatMoney(total)}</td>
                `;
                previewTableBody.appendChild(tr);
            });

            return secSum;
        };

        let summaryRows = [];

        if (isJkr) {
            renderGroupItems(item => item.jkrStage === "stage1", t.jkrStage1Band, "");
            renderGroupItems(item => item.jkrStage === "stage2", t.jkrStage2Band, "section-b");
            renderGroupItems(item => item.jkrStage === "reimbursable", t.jkrReimbursableBand, "section-c");

            const subtotalPreTax = fin.discountedConsultantFee + fin.subtotalReimbursables;
            const subtotalLabel = lang === "en" ? "Subtotal" : "Jumlah Keseluruhan";

            summaryRows = [
                { label: subtotalLabel, val: formatMoney(fin.totalConsultantFee + fin.subtotalReimbursables), isSub: true, isBold: true },
                ...(fin.discountAmount > 0 ? [{ label: t.discountJkr, val: `-${formatMoney(fin.discountAmount)}`, isSub: true }] : []),
                ...(fin.discountAmount > 0 ? [{ label: lang === "en" ? "Net Subtotal" : "Jumlah Bersih", val: formatMoney(subtotalPreTax), isSub: true, isBold: true }] : []),
                ...(state.enableSst ? [{ label: lang === "en" ? "Service Tax (SST 8%)" : "Cukai Perkhidmatan (SST 8%)", val: formatMoney(fin.sstAmount), isSub: true }] : []),
                { label: t.grandTotal, val: formatMoney(fin.grandTotal), isTotal: true }
            ];
        } else {
            renderGroupItems(item => item.section === "A", t.sectionABand, "");
            renderGroupItems(item => item.section === "B", t.sectionBBand, "section-b");
            renderGroupItems(item => item.section === "C", t.sectionCBand, "section-c");

            summaryRows = [
                { label: t.subtotalA, val: formatMoney(fin.subtotalA), isSub: true },
                ...(fin.discountA > 0 ? [{ label: t.discountA, val: `-${formatMoney(fin.discountA)}`, isSub: true }] : []),
                ...(state.enableSst ? [{ label: t.sstA, val: formatMoney(fin.sstA), isSub: true }] : []),
                { label: t.netA, val: formatMoney(fin.netA), isSub: true, isBold: true },
                ...(fin.subtotalB > 0 ? [{ label: t.subtotalB, val: formatMoney(fin.subtotalB), isSub: true }] : []),
                ...(fin.subtotalC > 0 ? [{ label: t.subtotalC, val: formatMoney(fin.subtotalC), isSub: true }] : []),
                { label: t.grandTotal, val: formatMoney(fin.grandTotal), isTotal: true }
            ];
        }

        summaryRows.forEach(row => {
            const tr = document.createElement("tr");
            tr.className = `summary-row ${row.isTotal ? 'total' : (row.isSub ? 'subtotal' : '')}`;
            const labelColspan = state.showRefColumn ? 6 : 5;
            tr.innerHTML = `
                <td colspan="${labelColspan}" class="right" style="${row.isBold || row.isTotal ? 'font-weight: bold;' : ''}">${row.label}</td>
                <td class="right" style="${row.isBold || row.isTotal ? 'font-weight: bold;' : ''}">${row.val}</td>
            `;
            previewTableBody.appendChild(tr);
        });
    }

    // 8. Render Deliverables Tags
    setText("prevLblDeliverablesTitle", t.prevDeliverablesTitle);
    const deliverablesList = document.getElementById("prevDeliverablesList");
    if (deliverablesList) {
        deliverablesList.innerHTML = "";
        DELIVERABLES_OPTIONS.forEach(del => {
            if (state.deliverables[del.id]) {
                const tag = document.createElement("div");
                tag.className = "doc-deliverable-tag";
                tag.innerText = (lang === "en" && del.labelEn) ? del.labelEn : del.label;
                deliverablesList.appendChild(tag);
            }
        });
    }

    // 9. Summary Terms
    setText("prevLblDuration", t.prevDuration);
    setText("prevDuration", state.duration || "N/A");
    setText("prevLblDeposit", t.prevDeposit);
    setText("prevDeposit", state.deposit || "N/A");

    // 10. Service Notes
    setText("prevLblTermsHeader", t.prevTermsHeader);
    const notesOl = document.getElementById("prevNotes");
    if (notesOl) {
        notesOl.innerHTML = "";
        const noteLines = (state.notes || "").split("\n").filter(line => line.trim().length > 0);
        noteLines.forEach(line => {
            const li = document.createElement("li");
            li.innerText = line;
            notesOl.appendChild(li);
        });
    }

    // 11. Signatory Block & Seal Stamp with Dynamic Font Sizing (Issue 6)
    setText("prevLblPreparedBy", t.prevPreparedBy);
    setText("prevSurveyorName", state.projectManager);
    setText("prevSurveyorTitle", t.prevSurveyorTitle);
    setText("prevSurveyorLjtReg", `No. Perakuan LJT: ${state.surveyorLjtNo} | PII: ${state.piiCoverage}`);

    const signatureContainer = document.getElementById("prevSignatureContainer");
    if (signatureContainer) {
        if (state.customSignatureDataUrl) {
            signatureContainer.innerHTML = `<img src="${state.customSignatureDataUrl}" style="max-height: 48px; max-width: 140px; object-fit: contain;" />`;
        } else {
            signatureContainer.innerHTML = `
                <svg width="150" height="50" viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 35 C35 15, 50 45, 65 20 C75 8, 85 48, 100 25 C115 8, 125 38, 138 22" stroke="#1d4ed8" stroke-width="2.5" stroke-linecap="round"/>
                    <path d="M35 30 L115 25" stroke="#1d4ed8" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            `;
        }
    }

    // Dynamic Font Scaling for Surveyor Seal Stamp Name (Issue 6)
    const stampNameElem = document.getElementById("prevSurveyorStampName");
    const stampLjtElem = document.getElementById("prevSurveyorStampLjt");
    if (stampNameElem) {
        const cleanName = (state.projectManager || "JURUUKUR").replace(/(Ir\.|Sr\.|Ts\.|bin|binti|Dato'|Datuk)/gi, "").trim();
        const nameWords = cleanName.split(" ").slice(0, 3).join(" ").toUpperCase();
        stampNameElem.textContent = nameWords;

        if (nameWords.length > 16) {
            stampNameElem.setAttribute("font-size", "4.2");
        } else if (nameWords.length > 11) {
            stampNameElem.setAttribute("font-size", "5.2");
        } else {
            stampNameElem.setAttribute("font-size", "6.8");
        }
    }
    if (stampLjtElem) {
        stampLjtElem.textContent = `LJT NO: ${state.surveyorLjtNo}`;
    }

    applyJkrPrintClone();

    // DISPATCH HTML TO NEW TAB IF OPEN
    syncLivePreview();
}
// === JKR 1:1 CLONE OVERRIDES ===
function applyJkrPrintClone() {
    const isJkr = state.bqType === "jkr";

    // 1. Header & Address Block
    let jkrHeader = document.getElementById("jkrCloneHeader");
    const docMetaClient = document.querySelector(".doc-meta-client");
    const docMetaDetails = document.querySelector(".doc-meta-details");

    if (isJkr) {
        if (docMetaClient) docMetaClient.style.display = "none";
        if (docMetaDetails) docMetaDetails.style.display = "none";

        if (!jkrHeader) {
            jkrHeader = document.createElement("div");
            jkrHeader.id = "jkrCloneHeader";
            const docMeta = document.querySelector(".doc-meta");
            if (docMeta) docMeta.appendChild(jkrHeader);
        }

        if (jkrHeader) {
            jkrHeader.style.display = "block";
            jkrHeader.innerHTML = `
                <table style="width: 100%; font-family: var(--font-sans); font-size: 0.8rem; margin-bottom: 1.5rem; border-collapse: collapse;">
                    <tr>
                        <td style="width: 5%; vertical-align: top; font-weight: bold; padding: 0.2rem 0;">To:</td>
                        <td style="width: 55%; vertical-align: top; padding: 0.2rem 0;"><strong>${state.clientCompany || '-'}</strong><br>${(state.clientAddress || '').replace(/\n/g, '<br>')}</td>
                        <td style="width: 8%; vertical-align: top; text-align: right; font-weight: bold; padding: 0.2rem 0.5rem 0.2rem 0;">Ruj:</td>
                        <td style="width: 32%; vertical-align: top; padding: 0.2rem 0;"><strong>${state.ourRef || '-'}</strong></td>
                    </tr>
                    <tr>
                        <td style="vertical-align: top; font-weight: bold; padding: 0.2rem 0;">Att:</td>
                        <td style="vertical-align: top; padding: 0.2rem 0;"><strong>${state.clientName || '-'}</strong></td>
                        <td style="vertical-align: top; text-align: right; font-weight: bold; padding: 0.2rem 0.5rem 0.2rem 0;">Date:</td>
                        <td style="vertical-align: top; padding: 0.2rem 0;">${formatDateString(state.quoteDate) || '-'}</td>
                    </tr>
                </table>
            `;
        }
    } else {
        if (docMetaClient) docMetaClient.style.display = "";
        if (docMetaDetails) docMetaDetails.style.display = "";
        if (jkrHeader) jkrHeader.style.display = "none";
    }

    // 5. Hide Deliverables, T&C, Daywork
    const prevDeliverablesBox = document.getElementById("prevDeliverablesBox");
    const termsBlock = document.querySelector(".terms-conditions");
    const dayworkBox = document.getElementById("printDayworkSchedule"); // assuming it exists
    const dayworkSectionBox = document.querySelector(".doc-daywork-section");

    const landAdmin = document.getElementById("prevLandAdminBox");
    const docTitle = document.getElementById("prevQuoteTitle");
    const summaryBlock = document.getElementById("prevDuration")?.closest("div");
    const docSub = document.getElementById("prevQuoteSubtitle");

    if (isJkr) {
        if (prevDeliverablesBox) prevDeliverablesBox.style.display = "none";
        if (termsBlock) termsBlock.style.display = "none";
        if (dayworkBox) dayworkBox.style.display = "none";
        if (dayworkSectionBox) dayworkSectionBox.style.display = "none";
        if (summaryBlock) summaryBlock.style.display = "none";

        if (landAdmin) landAdmin.style.display = "none";
        if (docTitle) docTitle.style.display = "none";
        if (docSub) docSub.style.display = "none";
    } else {
        if (prevDeliverablesBox) prevDeliverablesBox.style.display = "";
        if (termsBlock) termsBlock.style.display = "";
        if (dayworkBox) dayworkBox.style.display = "";
        if (dayworkSectionBox) dayworkSectionBox.style.display = "";
        if (summaryBlock) summaryBlock.style.display = "";

        if (landAdmin) landAdmin.style.display = "";
        if (docTitle) docTitle.style.display = "";
        if (docSub) docSub.style.display = "";
    }

    // Signatory Alignment
    const signatureBlock = document.querySelector(".signature-block");
    if (signatureBlock) {
        if (isJkr) {
            signatureBlock.style.display = "flex";
            signatureBlock.style.justifyContent = "flex-start";
            signatureBlock.style.flexDirection = "row";
            signatureBlock.style.gap = "4rem";
            signatureBlock.style.marginTop = "2rem";
        } else {
            signatureBlock.style.display = "flex";
            signatureBlock.style.justifyContent = "flex-end";
            signatureBlock.style.marginTop = "3rem";
        }
    }

    // 2. PROJECT Box & 3. Table Headers & 4. Categories
    const bqTable = document.getElementById("prevBqTable");
    const thNo = document.getElementById("prevThNo");
    const thScope = document.getElementById("prevThScope");
    const thUnit = document.getElementById("prevThUnit");
    const thQty = document.getElementById("prevThQty");
    const thRate = document.getElementById("prevThRate");
    const thTotal = document.getElementById("prevThTotal");
    const thRef = document.getElementById("prevThRef");
    const previewTableBody = document.getElementById("prevBqTableBody");

    if (isJkr) {
        if (bqTable) bqTable.classList.add("hide-ref-col"); // Force hide ref col

        if (thNo) { thNo.style.display = "none"; }
        if (thRef) { thRef.style.display = "none"; }
        if (thScope) { thScope.innerText = "Descriptions"; thScope.style.width = "50%"; }
        if (thUnit) { thUnit.innerText = "Unit"; thUnit.style.width = "10%"; }
        if (thQty) { thQty.innerText = "Quantity"; thQty.style.width = "10%"; }
        if (thRate) { thRate.innerText = "Rate (RM)"; thRate.style.width = "14%"; }
        if (thTotal) { thTotal.innerText = "Amount (RM)"; thTotal.style.width = "16%"; }

        if (previewTableBody) {
            // Hide STAGE bands
            const bands = previewTableBody.querySelectorAll(".section-band-row");
            bands.forEach(b => b.style.display = "none");

            // Rename categories and span 5 cols
            const catRows = previewTableBody.querySelectorAll(".item-stage-row td:nth-child(2)");
            catRows.forEach(td => {
                td.setAttribute("colspan", "5");
            });

            // Hide the first column (Item Code) for all item rows and category empty first cells
            // Item rows have .center as first child, category rows have .center as first child.
            // Do NOT hide for .summary-row
            const firstTds = previewTableBody.querySelectorAll("tr:not(.summary-row) td:first-child");
            firstTds.forEach(td => td.style.display = "none");

            // PROJECT Box
            let projRow = document.getElementById("jkrProjectRow");
            if (projRow) projRow.remove();

            projRow = document.createElement("tr");
            projRow.id = "jkrProjectRow";
            const qTitle = state.quoteTitle ? state.quoteTitle.toUpperCase() : '';
            const qSub = state.quoteSubtitle ? ` - ${state.quoteSubtitle.toUpperCase()}` : '';
            const lot = state.lotNo ? ` - ${state.lotNo.toUpperCase()}` : '';

            projRow.innerHTML = `
                <td colspan="5" style="border: 2px solid #2d3748; font-weight: bold; padding: 0.75rem 0.5rem; text-align: left; font-size: 0.8rem;">
                    PROJECT: <span style="text-transform: uppercase;">${qTitle}${qSub}${lot}</span>
                </td>
            `;
            const thead = bqTable.querySelector("thead");
            if (thead) {
                thead.insertBefore(projRow, thead.firstChild);
            }

            // Fix Summary Rows Colspan and Alignment
            const summaryTds = previewTableBody.querySelectorAll(".summary-row td:first-child");
            summaryTds.forEach(td => {
                td.setAttribute("colspan", "4");
                td.style.textAlign = "right";
                td.style.paddingRight = "1.5rem";
            });
            const summaryVals = previewTableBody.querySelectorAll(".summary-row td:last-child");
            summaryVals.forEach(td => {
                td.style.textAlign = "right";
            });
        }
    } else {
        if (typeof fixJkrCategoriesGrouping === "function") fixJkrCategoriesGrouping(true);
        if (bqTable && !state.showRefColumn) bqTable.classList.add("hide-ref-col");
        if (bqTable && state.showRefColumn) bqTable.classList.remove("hide-ref-col");
        if (thNo) { thNo.style.display = ""; thNo.style.width = "8%"; }
        if (thRef) { thRef.style.display = state.showRefColumn ? "" : "none"; thRef.style.width = "12%"; }
        let pRow = document.getElementById("jkrProjectRow");
        if (pRow) pRow.remove();
    }
}

// ==========================================
// 19. CSV EXPORT ENGINE (RFC 4180)
// ==========================================

function exportToCsv() {
    const lang = state.currentLang;
    const fin = computeFinancialSummary();
    const isJkr = state.bqType === "jkr";
    const zone = getDistanceZoneObj();

    let csvContent = "";

    csvContent += `"SISTEM PENJANA SEBUT HARGA UKUR TANAH (LJT / PEJUTA / JKR)"\r\n`;
    csvContent += `"Format Sebut Harga / Format","${isJkr ? 'JKR Standard (Stage 1 & Stage 2)' : 'Commercial / LJT Standard'}"\r\n`;
    csvContent += `"Rujukan Dokumen / Ref","${state.ourRef}","Tarikh / Date","${state.quoteDate}"\r\n`;
    csvContent += `"Firma Ukur LJT","${state.firmName}","No. LJT","${state.firmLjtNo}"\r\n`;
    csvContent += `"Pelanggan / Client","${state.clientCompany}","U.P. / Attn","${state.clientName}"\r\n`;
    csvContent += `"Maklumat Tanah","${state.lotNo}, ${state.landMukim}, ${state.landDistrict}, ${state.landState}"\r\n`;
    csvContent += `"Keluasan Tanah","${state.landArea} ${state.landAreaUnit}","Datum","${state.coordSystem} / ${state.verticalDatum}"\r\n`;
    csvContent += `"Zon Jarak Mobilisasi","${lang === 'en' ? zone.labelEn : zone.labelBm}"\r\n`;
    csvContent += `"Faktor Pengali Tapak","Terrain: ${state.terrainMultiplier}x, Vegetation: ${state.vegetationMultiplier}x, Combined: ${getCombinedMultiplier().toFixed(2)}x"\r\n\r\n`;

    csvContent += `"Peringkat / Bahagian (Section)","Kod (Code)","Skop Kerja (Scope Description)","Unit","Kuantiti (Qty)","Kadar Asas RM (Base Rate)","Kadar Berkesan RM (Effective Rate)","Jumlah RM (Total)","Status Cukai SST (Tax)"\r\n`;

    // Compute LiDAR Stage 2 Acquisition subtotal for CSV
    let lidarStage2AcquisitionSubtotal = 0.0;
    ALL_BQ_ITEMS.forEach(it => {
        if (isItemFiltered(it)) return;

        if (it.category === "STAGE 2: AERIAL MAPPING (LiDAR) - DATA ACQUISITION" ||
            it.categoryEn === "STAGE 2: AERIAL MAPPING (LiDAR) - DATA ACQUISITION") {
            const q = parseFloat(state.itemQuantities[it.code]) || 0;
            if (q > 0) {
                const r = getItemEffectiveRate(it);
                lidarStage2AcquisitionSubtotal += q * r;
            }
        }
    });

    let stage2ActiveTotal = 0.0;
    ALL_BQ_ITEMS.forEach(it => {
        if (isItemFiltered(it)) return;
        if (it.jkrStage === "stage2" && it.code !== "SR_DRAWING") {
            const q = parseFloat(state.itemQuantities[it.code]) || 0;
            if (q > 0) {
                const r = getItemEffectiveRate(it);
                stage2ActiveTotal += q * r;
            }
        }
    });

    ALL_BQ_ITEMS.forEach(item => {
        if (isItemFiltered(item)) return;

        const qty = parseFloat(state.itemQuantities[item.code]) || 0;
        if (qty <= 0) return;

        const baseRate = (state.itemRates[item.code] || item.defaultRate).toFixed(2);
        const effectiveRate = getItemEffectiveRate(item).toFixed(2);

        let totalVal = 0.0;
        if (item.unit === "%") {
            if (item.code === "SR_DRAWING") {
                totalVal = qty * (parseFloat(effectiveRate) / 100.0) * stage2ActiveTotal;
            } else {
                totalVal = qty * (parseFloat(effectiveRate) / 100.0) * lidarStage2AcquisitionSubtotal;
            }
        } else {
            totalVal = qty * parseFloat(effectiveRate);
        }
        const total = totalVal.toFixed(2);

        let secLabel = "";
        let taxStatus = "";

        if (isJkr) {
            secLabel = item.jkrStage === "stage1" ? "Stage 1 (Awalan)" : (item.jkrStage === "stage2" ? "Stage 2 (Pancangan)" : "Reimbursables");
            taxStatus = state.enableSst ? "SST 8%" : "0% SST";
        } else {
            secLabel = item.section === "A" ? "Bahagian A (Profesional)" : (item.section === "B" ? "Bahagian B (Disbursement)" : "Bahagian C (Logistik)");
            taxStatus = item.section === "A" ? (state.enableSst ? "SST 8%" : "0% SST") : "Disbursement (0% SST)";
        }

        let itemName = getItemDisplayName(item, lang);
        if (state.bqType === 'jkr' && item._jkrPrintDesc) {
            itemName = item._jkrPrintDesc;
        }

        csvContent += `"${secLabel}","${item.code}","${itemName.replace(/"/g, '""')}","${item.unit}",${qty},${baseRate},${effectiveRate},${total},"${taxStatus}"\r\n`;
    });

    csvContent += `\r\n`;
    if (isJkr) {
        csvContent += `""\r\n`;
        csvContent += `"","","Jumlah Yuran Perunding (Stage 1 + Stage 2)","","","","",${fin.totalConsultantFee.toFixed(2)},""\r\n`;
        if (fin.discountAmount > 0) {
            csvContent += `"","","Tolak: Diskaun Yuran Perunding","","","","",-${fin.discountAmount.toFixed(2)},""\r\n`;
        }
        csvContent += `"","","Yuran Perunding Bersih","","","","",${fin.discountedConsultantFee.toFixed(2)},""\r\n`;
        csvContent += `"","","Jumlah Kos Imbuhan Balik (Reimbursables)","","","","",${fin.subtotalReimbursables.toFixed(2)},""\r\n`;
        const grossTotalVal = fin.discountedConsultantFee + fin.subtotalReimbursables;
        csvContent += `"","","Jumlah Kasar (Yuran Bersih + Reimbursables)","","","","",${grossTotalVal.toFixed(2)},""\r\n`;
        if (state.enableSst) {
            csvContent += `"","","Cukai Perkhidmatan (SST 8%)","","","","",${fin.sstAmount.toFixed(2)},""\r\n`;
        }
    } else {
        csvContent += `"","","Subtotal Bahagian A (Yuran Profesional)","","","","",${fin.subtotalA.toFixed(2)},""\r\n`;
        if (fin.discountA > 0) {
            csvContent += `"","","Tolak: Diskaun Yuran Profesional","","","","",-${fin.discountA.toFixed(2)},""\r\n`;
        }
        if (state.enableSst) {
            csvContent += `"","","Cukai Perkhidmatan (SST 8% ke atas Bahagian A)","","","","",${fin.sstA.toFixed(2)},""\r\n`;
        }
        csvContent += `"","","Subtotal Bahagian B (Bayaran Balik Agensi Kerajaan - 0% SST)","","","","",${fin.subtotalB.toFixed(2)},""\r\n`;
        csvContent += `"","","Subtotal Bahagian C (Logistik & Operasi Tapak)","","","","",${fin.subtotalC.toFixed(2)},""\r\n`;
    }
    csvContent += `"","","JUMLAH KESELURUHAN SEBUT HARGA (GRAND TOTAL)","","","","",${fin.grandTotal.toFixed(2)},""\r\n`;

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeRef = (state.ourRef || "Quotation").replace(/[^a-zA-Z0-9_-]/g, "_");
    link.setAttribute("href", url);
    link.setAttribute("download", `SebutHarga_${safeRef}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// 20. INITIALIZATION & EVENT LISTENERS
// ==========================================

function initFormValues() {
    const isJkr = state.bqType === "jkr";
    setVal("firmName", state.firmName || "");
    setVal("bqType", state.bqType);
    setVal("firmLjtNo", state.firmLjtNo || "");
    setVal("surveyorLjtNo", state.surveyorLjtNo || "");
    setVal("practiceYear", state.practiceYear || "2026");
    setVal("piiCoverage", state.piiCoverage || "RM 1,000,000 (Aktif)");
    setVal("firmPhone", state.firmPhone || "");
    setVal("firmEmail", state.firmEmail || "");
    setVal("firmAddress", state.firmAddress || "");

    setVal("landState", state.landState);
    setVal("landDistrict", state.landDistrict);
    setVal("landMukim", state.landMukim);
    setVal("lotNo", state.lotNo);
    setVal("titleNo", state.titleNo);
    setVal("landCategory", state.landCategory);
    setVal("landArea", state.landArea);
    setVal("landAreaUnit", state.landAreaUnit);
    setVal("coordSystem", state.coordSystem);
    setVal("verticalDatum", state.verticalDatum);
    setVal("distanceZone", state.distanceZone || "zone_50_150");

    setVal("clientCompany", state.clientCompany);
    setVal("clientCategory", state.clientCategory || "Agensi Kerajaan");
    setVal("clientRef", state.clientRef);
    setVal("ourRef", state.ourRef);
    setVal("quoteDate", state.quoteDate);
    setVal("clientName", state.clientName);
    setVal("clientPhone", state.clientPhone);
    setVal("clientEmail", state.clientEmail);
    setVal("clientAddress", state.clientAddress);

    setVal("quoteTitle", state.quoteTitle);
    setVal("quoteSubtitle", state.quoteSubtitle);
    setVal("projectManager", state.projectManager);
    setVal("duration", state.duration);
    setVal("deposit", state.deposit);
    setVal("discount", state.discount);
    setChecked("enableSst", state.enableSst);
    setChecked("toggleRefCol", state.showRefColumn);
    setVal("jkrTerrainFilter", state.jkrTerrainFilter || "mixed");
    const pejutaCard = document.getElementById("pejutaMultiplierCard");
    const jkrCard = document.getElementById("jkrTerrainCard");
    if (isJkr) {
        if (pejutaCard) pejutaCard.style.display = "none";
        if (jkrCard) jkrCard.style.display = "block";
    } else {
        if (pejutaCard) pejutaCard.style.display = "block";
        if (jkrCard) jkrCard.style.display = "none";
    }
    const formTable = document.getElementById("formBqTable");
    const prevTable = document.getElementById("prevBqTable");
    if (state.showRefColumn) {
        if (formTable) formTable.classList.remove("hide-ref-col");
        if (prevTable) prevTable.classList.remove("hide-ref-col");
    } else {
        if (formTable) formTable.classList.add("hide-ref-col");
        if (prevTable) prevTable.classList.add("hide-ref-col");
    }
    setVal("notes", state.notes);

    setVal("terrainMultiplier", state.terrainMultiplier ? state.terrainMultiplier.toFixed(2) : "1.00");
    setVal("vegetationMultiplier", state.vegetationMultiplier ? state.vegetationMultiplier.toFixed(2) : "1.00");
    updateMultiplierDisplay();

    const lang = state.currentLang;
    const t = TRANSLATIONS[lang];
    setText("btnFilterPartA", isJkr ? (lang === "en" ? "Stage 1 (Preliminary)" : "Stage 1 (Awalan)") : t.btnPartA);
    setText("btnFilterPartB", isJkr ? (lang === "en" ? "Stage 2 (Setting Out)" : "Stage 2 (Pancangan)") : t.btnPartB);
    setText("btnFilterPartC", isJkr ? (lang === "en" ? "Reimbursables (PBT)" : "Reimbursables (PBT)") : t.btnPartC);
}

function setupEventListeners() {
    const formFields = [
        "firmName", "firmLjtNo", "surveyorLjtNo", "practiceYear", "piiCoverage",
        "firmPhone", "firmEmail", "firmAddress",
        "landDistrict", "landMukim", "lotNo", "titleNo", "landCategory",
        "landArea", "landAreaUnit", "coordSystem", "verticalDatum", "distanceZone",
        "clientCompany", "clientCategory", "clientRef", "ourRef", "quoteDate",
        "clientName", "clientPhone", "clientEmail", "clientAddress",
        "quoteTitle", "quoteSubtitle", "projectManager", "duration",
        "deposit", "notes"
    ];

    formFields.forEach(id => {
        const elem = document.getElementById(id);
        if (!elem) return;
        elem.addEventListener("input", (e) => {
            let val = e.target.value;
            if (id === "landArea") val = parseFloat(val) || 0;
            state[id] = val;
            renderPreview();
            autoSaveState();
        });
        elem.addEventListener("change", (e) => {
            let val = e.target.value;
            if (id === "landArea") val = parseFloat(val) || 0;
            state[id] = val;
            if (id === "distanceZone") {
                renderBqTable();
            }
            renderPreview();
            autoSaveState();
        });
    });

    // Firm Directory Listeners
    const firmSelect = document.getElementById("firmProfileSelect");
    if (firmSelect) {
        firmSelect.addEventListener("change", (e) => applyFirmProfile(e.target.value));
    }
    const btnNewFirm = document.getElementById("btnNewFirmProfile");
    if (btnNewFirm) btnNewFirm.addEventListener("click", resetFirmForm);
    const btnSaveFirm = document.getElementById("btnSaveFirmProfile");
    if (btnSaveFirm) btnSaveFirm.addEventListener("click", saveCurrentFirmProfile);
    const btnDelFirm = document.getElementById("btnDeleteFirmProfile");
    if (btnDelFirm) btnDelFirm.addEventListener("click", deleteSelectedFirmProfile);

    // Client Directory Listeners
    const clientSelect = document.getElementById("clientDirectorySelect");
    if (clientSelect) {
        clientSelect.addEventListener("change", (e) => applyClientRecord(e.target.value));
    }
    const btnNewCli = document.getElementById("btnNewClient");
    if (btnNewCli) btnNewCli.addEventListener("click", resetClientForm);
    const btnSaveCli = document.getElementById("btnSaveClient");
    if (btnSaveCli) btnSaveCli.addEventListener("click", saveCurrentClientRecord);
    const btnDelCli = document.getElementById("btnDeleteClient");
    if (btnDelCli) btnDelCli.addEventListener("click", deleteSelectedClientRecord);

    // BQ Type change listener
    const bqTypeSelect = document.getElementById("bqType");
    if (bqTypeSelect) {
        bqTypeSelect.addEventListener("change", (e) => {
            state.bqType = e.target.value;
            initFormValues();
            renderBqTable();
            renderPreview();
            autoSaveState();
        });
    }

    // State change listener (auto-adjust Party-Day rates)
    const landStateSelect = document.getElementById("landState");
    if (landStateSelect) {
        landStateSelect.addEventListener("change", (e) => {
            state.landState = e.target.value;
            renderBqTable();
            renderPreview();
            autoSaveState();
        });
    }

    // Distance Zone listener
    const distZoneSelect = document.getElementById("distanceZone");
    if (distZoneSelect) {
        distZoneSelect.addEventListener("change", (e) => {
            state.distanceZone = e.target.value;
            renderBqTable();
            renderPreview();
            autoSaveState();
        });
    }

    // Discount input
    const discInput = document.getElementById("discount");
    if (discInput) {
        discInput.addEventListener("input", (e) => {
            state.discount = parseFloat(e.target.value) || 0;
            renderPreview();
            autoSaveState();
        });
    }

    // SST checkbox
    const sstChk = document.getElementById("enableSst");
    if (sstChk) {
        sstChk.addEventListener("change", (e) => {
            state.enableSst = e.target.checked;
            renderPreview();
            autoSaveState();
        });
    }

    // Reference column checkbox toggle
    const refColChk = document.getElementById("toggleRefCol");
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

    // JKR Terrain filter dropdown change listener
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
    document.addEventListener("input", (e) => {
        if (e.target.classList.contains("qty-form-input")) {
            const code = e.target.dataset.code;
            state.itemQuantities[code] = parseFloat(e.target.value) || 0;
            renderPreview();
            autoSaveState();
        }
        if (e.target.classList.contains("rate-form-input")) {
            const code = e.target.dataset.code;
            state.itemRates[code] = parseFloat(e.target.value) || 0;
            renderPreview();
            autoSaveState();
        }
        if (e.target.classList.contains("daywork-rate-input")) {
            const code = e.target.dataset.code;
            state.dayworkRates[code] = parseFloat(e.target.value) || 0;
            autoSaveState();
        }
    });

    // Deliverables checkbox
    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("deliverable-chk")) {
            state.deliverables[e.target.id] = e.target.checked;
            renderPreview();
            autoSaveState();
        }
    });

    // Custom Logo File Reader
    const logoInput = document.getElementById("customLogo");
    if (logoInput) {
        logoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    state.customLogoDataUrl = event.target.result;
                    renderPreview();
                    autoSaveState();
                };
                reader.readAsDataURL(file);
            } else {
                state.customLogoDataUrl = null;
                renderPreview();
                autoSaveState();
            }
        });
    }

    // Custom Signature File Reader
    const sigInput = document.getElementById("customSignature");
    if (sigInput) {
        sigInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    state.customSignatureDataUrl = event.target.result;
                    renderPreview();
                    autoSaveState();
                };
                reader.readAsDataURL(file);
            } else {
                state.customSignatureDataUrl = null;
                renderPreview();
                autoSaveState();
            }
        });
    }

    // Template Selector Button
    const btnApplyTpl = document.getElementById("btnApplyTemplate");
    if (btnApplyTpl) {
        btnApplyTpl.addEventListener("click", () => {
            const selected = document.getElementById("templateSelect")?.value;
            if (selected) applyProjectTemplate(selected);
        });
    }

    const tplSelect = document.getElementById("templateSelect");
    if (tplSelect) {
        tplSelect.addEventListener("change", (e) => {
            if (e.target.value) applyProjectTemplate(e.target.value);
        });
    }

    // New Quotation Reset & Duplicate Buttons (Issue 7)
    const btnNewQuote = document.getElementById("btnNewQuotation");
    if (btnNewQuote) {
        btnNewQuote.addEventListener("click", resetNewQuotation);
    }

    const btnDupQuote = document.getElementById("btnDuplicateQuotation");
    if (btnDupQuote) {
        btnDupQuote.addEventListener("click", duplicateQuotation);
    }

    // Save Draft & Revision Buttons
    const btnSave = document.getElementById("btnSaveDraft");
    if (btnSave) {
        btnSave.addEventListener("click", () => {
            autoSaveState();
            alert(state.currentLang === "en" ? "Draft successfully saved to browser local storage!" : "Draf sebut harga berjaya disimpan dalam storan pelayar!");
        });
    }

    const btnRev = document.getElementById("btnIncrementRev");
    if (btnRev) {
        btnRev.addEventListener("click", incrementRevision);
    }

    // JSON Export & Import
    const btnExpJson = document.getElementById("btnExportJson");
    if (btnExpJson) {
        btnExpJson.addEventListener("click", exportToJson);
    }
    const btnImpTrig = document.getElementById("btnImportJsonTrigger");
    if (btnImpTrig) {
        btnImpTrig.addEventListener("click", () => {
            document.getElementById("jsonFileInput")?.click();
        });
    }
    const jsonFileInput = document.getElementById("jsonFileInput");
    if (jsonFileInput) {
        jsonFileInput.addEventListener("change", (e) => {
            importFromJson(e.target.files[0]);
        });
    }

    // Subtab Filters
    const subtabButtons = document.querySelectorAll(".bq-subtab-btn");
    subtabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            subtabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeFilter = btn.dataset.filter;

            const bqTableContainer = document.getElementById("bqTableContainer");
            const dayworkContainer = document.getElementById("dayworkContainer");
            const deliverablesContainer = document.getElementById("deliverablesContainer");

            if (activeFilter === "daywork") {
                if (bqTableContainer) bqTableContainer.style.display = "none";
                if (dayworkContainer) dayworkContainer.style.display = "block";
                if (deliverablesContainer) deliverablesContainer.style.display = "none";
            } else if (activeFilter === "deliverables") {
                if (bqTableContainer) bqTableContainer.style.display = "none";
                if (dayworkContainer) dayworkContainer.style.display = "none";
                if (deliverablesContainer) deliverablesContainer.style.display = "block";
            } else {
                if (bqTableContainer) bqTableContainer.style.display = "block";
                if (dayworkContainer) dayworkContainer.style.display = "none";
                if (deliverablesContainer) deliverablesContainer.style.display = "none";
                renderBqTable();
            }
        });
    });

    // Wizard Step Tabs
    const tab1Btn = document.getElementById("tab1Btn");
    const tab2Btn = document.getElementById("tab2Btn");
    const tab1Pane = document.getElementById("tab1Pane");
    const tab2Pane = document.getElementById("tab2Pane");
    const prevStepBtn = document.getElementById("prevStepBtn");
    const nextStepBtn = document.getElementById("nextStepBtn");

    function goToTab(tabIndex) {
        state.activeTab = tabIndex;
        autoSaveState();

        // Scroll form content container to top
        const formContent = document.querySelector(".form-content");
        if (formContent) formContent.scrollTop = 0;

        // Scroll preview panel to top
        const previewPanel = document.querySelector(".preview-panel");
        if (previewPanel) previewPanel.scrollTop = 0;

        // Scroll window for mobile responsive view
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (tabIndex === 1) {
            if (tab1Btn) tab1Btn.classList.add("active");
            if (tab2Btn) tab2Btn.classList.remove("active");
            if (tab1Pane) tab1Pane.classList.add("active");
            if (tab2Pane) tab2Pane.classList.remove("active");
            if (prevStepBtn) prevStepBtn.style.visibility = "hidden";
            if (nextStepBtn) nextStepBtn.innerText = state.currentLang === "en" ? "Next: BQ Items" : "Seterusnya: Senarai BQ";
        } else {
            if (tab2Btn) tab2Btn.classList.add("active");
            if (tab1Btn) tab1Btn.classList.remove("active");
            if (tab2Pane) tab2Pane.classList.add("active");
            if (tab1Pane) tab1Pane.classList.remove("active");
            if (prevStepBtn) prevStepBtn.style.visibility = "visible";
            if (nextStepBtn) nextStepBtn.innerText = state.currentLang === "en" ? "View Preview" : "Papar Sebut Harga";
        }
    }

    if (tab1Btn) tab1Btn.addEventListener("click", () => goToTab(1));
    if (tab2Btn) tab2Btn.addEventListener("click", () => goToTab(2));
    if (prevStepBtn) prevStepBtn.addEventListener("click", () => goToTab(1));
    if (nextStepBtn) {
        nextStepBtn.addEventListener("click", () => {
            if (tab1Pane && tab1Pane.classList.contains("active")) {
                goToTab(2);
            } else {
                const container = document.querySelector(".main-container");
                if (container && container.classList.contains("preview-hidden")) {
                    togglePreview();
                }
            }
        });
    }

    // Toggle Preview Panel
    const previewToggleBtn = document.getElementById("previewToggleBtn");
    function togglePreview() {
        const container = document.querySelector(".main-container");
        if (!container) return;
        container.classList.toggle("preview-hidden");
        const isHidden = container.classList.contains("preview-hidden");
        const t = TRANSLATIONS[state.currentLang];
        if (previewToggleBtn) {
            previewToggleBtn.innerText = isHidden ? t.previewBtnShow : t.previewBtnHide;
            previewToggleBtn.classList.toggle("btn-primary", !isHidden);
            previewToggleBtn.classList.toggle("btn-secondary", isHidden);
        }
        if (!isHidden) {
            const previewPanel = document.querySelector(".preview-panel");
            if (previewPanel) previewPanel.scrollTop = 0;
        }
    }
    if (previewToggleBtn) {
        previewToggleBtn.addEventListener("click", togglePreview);
    }

    // Print & CSV & PDF actions
    const printBtn = document.getElementById("printBtn");
    if (printBtn) printBtn.addEventListener("click", () => window.print());

    const csvBtn = document.getElementById("exportCsvBtn");
    if (csvBtn) csvBtn.addEventListener("click", exportToCsv);

    const pdfBtn = document.getElementById("downloadPdfBtn");
    if (pdfBtn) {
        pdfBtn.addEventListener("click", () => {
            const element = document.getElementById("a4Page");
            const safeRef = (state.ourRef || "Quotation").replace(/[^a-zA-Z0-9_-]/g, "_");
            const opt = {
                margin: 0,
                filename: `SebutHarga_${safeRef}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        });
    }

    // Restore active tab from state on initialization
    const restoredTab = parseInt(state.activeTab) || 1;
    goToTab(restoredTab);
}

// ==========================================
// 21. DOM BOOTSTRAP
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
    restoreFromLocalStorage();
    populateFirmProfilesDropdown();
    populateClientsDropdown();
    initFormValues();
    setupEventListeners();
    renderBqTable();
    renderDeliverablesChecklist();
    renderDayworkTable();
    renderPreview();

    // Async Supabase Sync on Startup
    if (typeof supabaseClient !== 'undefined') {
        // Sync BQ
        if (typeof fetchBqItemsFromDb === 'function') {
            fetchBqItemsFromDb().then(dbItems => {
                if (dbItems && dbItems.length > 0) {
                    ALL_BQ_ITEMS = dbItems;
                    localStorage.setItem('LLS_CUSTOM_BQ_ITEMS', JSON.stringify(ALL_BQ_ITEMS));
                    console.log("Berjaya memuat turun BQ dari Supabase:", dbItems.length, "item");
                    if (typeof renderBqTable === 'function') renderBqTable();
                    if (typeof updatePreview === 'function') updatePreview();
                }
            });
        }

        // Sync Firms
        if (typeof fetchFirmsFromDb === 'function') {
            fetchFirmsFromDb().then(dbFirms => {
                if (dbFirms && dbFirms.length > 0) {
                    localStorage.setItem(FIRMS_STORAGE_KEY, JSON.stringify(dbFirms));
                    console.log("Berjaya memuat turun Firma dari Supabase:", dbFirms.length);
                    populateFirmProfilesDropdown();
                    if (typeof renderPreview === 'function') renderPreview();
                }
            });
        }

        // Sync Clients
        if (typeof fetchClientsFromDb === 'function') {
            fetchClientsFromDb().then(dbClients => {
                if (dbClients && dbClients.length > 0) {
                    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(dbClients));
                    console.log("Berjaya memuat turun Klien dari Supabase:", dbClients.length);
                    populateClientsDropdown();
                    if (typeof renderPreview === 'function') renderPreview();
                }
            });
        }
    }
});


// Fix JKR Categories Grouping
function fixJkrCategoriesGrouping(forceRestore = false) {
    // Disabled so that users can have full control over category names in the BQ Admin UI.
}
// ==========================================
// BQ ITEM MANAGER LOGIC (ADMIN UI)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('bqManagerModal');
    const openBtn = document.getElementById('bqManagerBtn');
    const closeBtn = document.getElementById('closeBqManagerModal');
    const listBody = document.getElementById('bqManagerList');
    const searchInput = document.getElementById('bqSearchInput');
    const form = document.getElementById('bqManagerForm');
    const addNewBtn = document.getElementById('addNewBqBtn');
    const deleteBtn = document.getElementById('bqDeleteBtn');
    const resetBtn = document.getElementById('bqResetDefaultBtn');
    const clearAllBtn = document.getElementById('bqClearAllBtn');
    const formTitle = document.getElementById('bqFormTitle');

    // State
    let currentEditItemCode = null;

    // Keyboard shortcut (Ctrl + Shift + B)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'b') {
            e.preventDefault();
            openModal();
        }
    });

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    function openModal() {
        modal.style.display = 'flex';
        renderList();
        resetForm();
    }

    function closeModal() {
        modal.style.display = 'none';
        // When closing, re-render the main form in case items changed
        if (typeof renderBqTable === 'function') renderBqTable();
        if (typeof computeFinancialSummary === 'function') computeFinancialSummary();
        if (typeof updatePreview === 'function') updatePreview();
    }

    function saveBqToStorage(itemToUpsert = null, itemToDeleteCode = null, isBulk = false) {
        // Simpan ke local sebagai cache / offline-first
        localStorage.setItem('LLS_CUSTOM_BQ_ITEMS', JSON.stringify(ALL_BQ_ITEMS));

        // Pautkan ke Supabase jika aktif
        if (typeof supabaseClient !== 'undefined') {
            if (isBulk) {
                bulkUpsertBqItems(ALL_BQ_ITEMS);
            } else if (itemToDeleteCode) {
                deleteBqItemFromDb(itemToDeleteCode);
            } else if (itemToUpsert) {
                upsertBqItemToDb(itemToUpsert);
            }
        }
    }

    function renderList() {
        const query = searchInput.value.toLowerCase();
        listBody.innerHTML = '';

        ALL_BQ_ITEMS.filter(it => {
            return (it.code.toLowerCase().includes(query) ||
                it.name.toLowerCase().includes(query) ||
                it.category.toLowerCase().includes(query));
        }).forEach(item => {
            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.style.borderBottom = '1px solid #eee';
            tr.innerHTML = `
                <td style="padding: 8px;"><strong>${item.code}</strong></td>
                <td style="padding: 8px;">${item.name}</td>
                <td style="padding: 8px; color: #666; font-size: 11px;">${item.category}</td>
            `;
            tr.addEventListener('click', () => loadForm(item));

            // Hover effect
            tr.addEventListener('mouseover', () => tr.style.backgroundColor = '#f1f1f1');
            tr.addEventListener('mouseout', () => tr.style.backgroundColor = 'transparent');

            listBody.appendChild(tr);
        });
    }

    searchInput.addEventListener('input', renderList);

    function resetForm(keepCategory = false) {
        currentEditItemCode = null;
        formTitle.textContent = "Tambah Item Baharu";

        if (keepCategory) {
            const tempCat = document.getElementById('bqCategory').value;
            const tempSubCat = document.getElementById('bqSubCategory').value;
            const tempSubSubCat = document.getElementById('bqSubSubCategory').value;
            const tempStage = document.getElementById('bqJkrStage').value;
            form.reset();
            document.getElementById('bqCategory').value = tempCat;
            document.getElementById('bqSubCategory').value = tempSubCat;
            document.getElementById('bqSubSubCategory').value = tempSubSubCat;
            document.getElementById('bqJkrStage').value = tempStage;
        } else {
            form.reset();
        }

        document.getElementById('bqOriginalCode').value = '';
        deleteBtn.style.display = 'none';
        document.getElementById('bqCode').disabled = false;
    }

    addNewBtn.addEventListener('click', () => resetForm(false));

    function loadForm(item) {
        currentEditItemCode = item.code;
        formTitle.textContent = `Sunting Item: ${item.code}`;

        document.getElementById('bqOriginalCode').value = item.code;
        document.getElementById('bqCode').value = item.code;
        document.getElementById('bqCategory').value = item.category;
        document.getElementById('bqSubCategory').value = item.subCategory || '';
        document.getElementById('bqSubSubCategory').value = item.subSubCategory || '';
        document.getElementById('bqJkrStage').value = item.jkrStage || '';
        document.getElementById('bqName').value = item.name || '';
        document.getElementById('bqNameEn').value = item.nameEn || '';
        document.getElementById('bqPrintName').value = item.printName || '';
        document.getElementById('bqPrintNameEn').value = item.printNameEn || '';
        document.getElementById('bqUnit').value = item.unit;
        document.getElementById('bqRate').value = item.defaultRate !== undefined ? item.defaultRate : (item.rate || '');
        document.getElementById('bqDescription').value = item.description || '';

        document.getElementById('bqCode').disabled = true; // Prevent changing code of existing item for safety
        deleteBtn.style.display = 'block';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newItemUpdate = {
            code: document.getElementById('bqCode').value.trim(),
            jkrStage: document.getElementById('bqJkrStage').value,
            category: document.getElementById('bqCategory').value.trim(),
            categoryEn: document.getElementById('bqCategory').value.trim(), // Can be improved later
            subCategory: document.getElementById('bqSubCategory').value.trim(),
            subCategoryEn: document.getElementById('bqSubCategory').value.trim(),
            subSubCategory: document.getElementById('bqSubSubCategory').value.trim(),
            subSubCategoryEn: document.getElementById('bqSubSubCategory').value.trim(),
            name: document.getElementById('bqName').value.trim(),
            nameEn: document.getElementById('bqNameEn').value.trim(),
            printName: document.getElementById('bqPrintName').value.trim(),
            printNameEn: document.getElementById('bqPrintNameEn').value.trim(),
            unit: document.getElementById('bqUnit').value.trim(),
            defaultRate: parseFloat(document.getElementById('bqRate').value),
            description: document.getElementById('bqDescription').value.trim(),
            descriptionEn: document.getElementById('bqDescription').value.trim()
        };

        if (currentEditItemCode) {
            // Edit existing
            const idx = ALL_BQ_ITEMS.findIndex(x => x.code === currentEditItemCode);
            if (idx > -1) {
                // Merge to avoid losing internal flags like isStatutory, applyMultiplier, etc.
                ALL_BQ_ITEMS[idx] = { ...ALL_BQ_ITEMS[idx], ...newItemUpdate };
            }
        } else {
            // Add new
            // Check for duplicate code
            if (ALL_BQ_ITEMS.find(x => x.code.toLowerCase() === newItemUpdate.code.toLowerCase())) {
                alert("Kod Item telah wujud! Sila gunakan kod lain.");
                return;
            }
            ALL_BQ_ITEMS.push({ ...newItemUpdate, section: "C" });
        }

        saveBqToStorage(newItemUpdate, null, false);
        renderList();

        // Show success briefly
        const btn = form.querySelector('button[type="submit"]');
        const origText = btn.textContent;
        btn.textContent = "Disimpan!";
        btn.style.backgroundColor = "#28a745";
        setTimeout(() => {
            btn.textContent = origText;
            btn.style.backgroundColor = "";
            if (!currentEditItemCode) resetForm(true); // Keep category for bulk adding!
        }, 1000);
    });

    deleteBtn.addEventListener('click', () => {
        if (!currentEditItemCode) return;
        if (confirm(`Padam item ${currentEditItemCode}?`)) {
            const idx = ALL_BQ_ITEMS.findIndex(x => x.code === currentEditItemCode);
            if (idx > -1) {
                const codeToDelete = currentEditItemCode;
                ALL_BQ_ITEMS.splice(idx, 1);
                saveBqToStorage(null, codeToDelete, false);
                renderList();
                resetForm();
            }
        }
    });

    resetBtn.addEventListener('click', () => {
        if (confirm("AMARAN: Ini akan memadam semua item BQ tersuai anda dan mengembalikan pangkalan data JKR asal. Anda pasti?")) {
            localStorage.removeItem('LLS_CUSTOM_BQ_ITEMS');
            ALL_BQ_ITEMS = JSON.parse(JSON.stringify(DEFAULT_ALL_BQ_ITEMS));
            renderList();
            resetForm(false);
            saveBqToStorage(null, null, true); // Sync reset to DB
            alert("Pangkalan data BQ telah ditetapkan semula kepada JKR.");
        }
    });

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm("AWAS: Ini akan memadam KESEMUA item dari pangkalan data untuk anda mula dengan borang kosong. Pasti?")) {
                ALL_BQ_ITEMS = [];
                saveBqToStorage(null, null, true); // Sync clear to DB
                renderList();
                resetForm(false);
            }
        });
    }
});
