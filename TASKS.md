# Pelan Tindakan & Senarai Tugas Pembangunan (Implementation Tasks)

Berdasarkan garis panduan profesional dalam **[LJT.md](file:///c:/Users/mmazlan1/Personal/quotation-generator/LJT.md)** serta analisis templat sebut harga rasmi kerajaan (*Penanda Aras Sg. Rinching*), berikut ialah senarai tugas terperinci bagi menaiktaraf Sistem Penjana Sebut Harga Ukur Tanah (*Malaysian Licensed Land Surveyor Quotation System*).

---

### Ringkasan Fasa Pembangunan

- [x] **Fasa 1**: Penstrukturan Semula Data & Model Keadaan (*Data Architecture & State Model*)
- [x] **Fasa 2**: Penambahan Parameter & Input Borang (*Form & Metadata UI Inputs*)
- [x] **Fasa 3**: Pembangunan Enjin Pengiraan Skala Fi LJT/PEJUTA & JKR/Perbendaharaan (*Calculation Engine*)
- [x] **Fasa 4**: Modul Pilihan Templat Pantas (*1-Click Project Templates*)
- [x] **Fasa 5**: Penambahbaikan Paparan Dokumen A4 & Jana PDF (*Preview & PDF Layout*)
- [x] **Fasa 6**: Sistem Simpanan Draf, Eksport/Import & Kawalan Semakan (*Persistence & Versioning*)
- [x] **Fasa 7**: Pengesahan, Ujian & Jaminan Kualiti (*Testing & Verification*)

---

## Fasa 1: Penstrukturan Semula Data & Model Keadaan (`app.js`)

- [x] **Tugasan 1.1: Kemaskini Objek `state` dengan Metadata Pentadbiran Tanah**
  - [x] Tambah medan: `state.landState` (Negeri), `state.landDistrict` (Daerah), `state.landMukim` (Mukim/Pekan/Bandar).
  - [x] Tambah medan: `state.lotNo` (No. Lot / No. PT), `state.titleNo` (Jenis & No. Hakmilik cth: GRN / GM / HSD).
  - [x] Tambah medan: `state.landCategory` (Kategori: Pertanian / Bangunan / Industri).
  - [x] Tambah medan: `state.landArea` dan `state.landAreaUnit` (Hektar / Ekar / Meter Persegi / Kaki Persegi).
  - [x] Tambah medan: `state.coordSystem` (Cassini mengikut Negeri / RSO Malayan / GDM2000) dan `state.verticalDatum` (LSD JUPEM / MSL / TBM).

- [x] **Tugasan 1.2: Kemaskini Metadata Pendaftaran Firma & Juruukur LJT**
  - [x] Tambah medan: `state.firmLjtNo` (No. Pendaftaran Firma Ukur LJT cth: `LJT/F/1234`).
  - [x] Tambah medan: `state.surveyorLjtNo` (No. Perakuan Amalan Individu LJT).
  - [x] Tambah medan: `state.practiceYear` (Tahun Sijil Amalan Semasa cth: `2026`).
  - [x] Tambah medan: `state.piiCoverage` (Jumlah Perlindungan Insurans PII cth: `RM 1,000,000`).

- [x] **Tugasan 1.3: Penstrukturan Semula Senarai Master BQ (`ALL_BQ_ITEMS`) Mengikut Dwi-Format**
  - [x] Sokongan **Mod Format JKR / Perbendaharaan** (Berasaskan Penanda Aras Sg. Rinching):
    - *Stage 1: Preliminary Survey* (Preparatory, Mob/Demob mengikut zon jarak, Kawalan Sempadan/Trabas, Aras Biasa/Tepat, Ukur Jalur Koridor, Utiliti Bawah Tanah RM3.50/m², Topografi Kontur & Grid Heighting, Tapak Jambatan & Sounding Sungai <1m/>1m, Dron, Hidrografi, Penandaan Pokok).
    - *Stage 2: Setting Out Reserve Boundaries* (Kawalan Tambahan, Pancangan Rizab <60m dan >60m).
    - *Reimbursables*: Pengambilan Balik Tanah Seksyen 4 & Seksyen 8 KTN 1965, Pelan Pra-Hitungan, Data eKadaster/CP JUPEM, Carian Hakmilik PTD, Perbatuan RM0.50/km, Elaun Sara Hidup RM85/hari, Penginapan Hotel.
  - [x] Sokongan **Mod Format Komersial & Skala Fi LJT/PEJUTA**:
    - *Bahagian A*: Yuran Profesional Ukur (Hakmilik Pecah Sempadan/Bahagian KTN, Strata, Topografi dengan pengganda rupa bumi/tumbuhan).
    - *Bahagian B*: Bayaran Balik Agensi Kerajaan (Carian PTG, Pelan Akui eKadaster, Deposit LJT, Fi Semakan JUPEM - Bebas SST).
    - *Bahagian C*: Perbelanjaan Operasi, Logistik & Risiko Tapak.

- [x] **Tugasan 1.4: Struktur Data Jadual *Daywork* & *Deliverables Matrix***
  - [x] Cipta tatasusunan data `DAYWORK_ITEMS` (Kadar Manpower per Party-Day dan Kadar Sewaan Alat per Hari).
  - [x] Cipta tatasusunan data `DELIVERABLES_OPTIONS` (AutoCAD DWG/DXF, MS 1759, ASCII/CSV, Point Cloud LAS/LAZ, Pelan Bercetak A1/A0, Laporan Penentukuran EDM/GNSS).

---

## Fasa 2: Penambahan Parameter & Input Borang (`index.html`)

- [x] **Tugasan 2.1: Seksyen Borang Maklumat Pentadbiran Tanah**
  - [x] Tambah dropdown Negeri (14 negeri di Malaysia) berserta penentuan automatik kadar Party-Day (Semenanjung RM743 vs Sabah/Sarawak RM966).
  - [x] Tambah medan input teks untuk Daerah, Mukim/Bandar/Pekan, No. Lot/PT, dan No. Hakmilik.
  - [x] Tambah dropdown Kategori Kegunaan Tanah (*Pertanian, Bangunan Kediaman, Bangunan Komersial, Perindustrian*).
  - [x] Tambah input Keluasan Tanah berserta unit keluasan (Hektar / Ekar / Meter Persegi).
  - [x] Tambah pilihan Datum Koordinat (Cassini Negeri berkenaan / RSO Malayan) dan Datum Ketinggian (LSD / MSL).

- [x] **Tugasan 2.2: Seksyen Borang Butiran Firma Ukur LJT**
  - [x] Tambah input No. Pendaftaran Firma LJT dan No. Pendaftaran Juruukur.
  - [x] Tambah pilihan status perlindungan *Professional Indemnity Insurance (PII)*.

- [x] **Tugasan 2.3: Kawalan Faktor Pengali Tapak (Terrain & Vegetation Multipliers)**
  - [x] Tambah dropdown *Faktor Rupa Bumi*:
    - Rata (1.0x), Beralun (1.25x), Berbukit (1.50x), Curam/Pergunungan (1.75x - 2.0x).
  - [x] Tambah dropdown *Faktor Litupan Tumbuhan*:
    - Lapang/Terbuka (1.0x), Tanaman/Sawit Matang (1.2x), Belukar (1.4x), Hutan Tebal/Paya (1.8x - 2.5x).
  - [x] Paparkan jumlah *Combined Multiplier Factor* secara langsung (*live feedback*).

- [x] **Tugasan 2.4: Tab / Seksyen Senarai BQ Baharu**
  - [x] Asingkan jadual input BQ kepada tab/kategori kemas mengikut mod pilihan (Format JKR vs Format Komersial LJT).
  - [x] Sediakan jadual input untuk *Schedule of Daywork Rates* (pilihan untuk dimasukkan ke dalam sebut harga).
  - [x] Sediakan senarai semak (*checklist*) *Deliverables Matrix*.

- [x] **Tugasan 2.5: Seksyen Terma & Syarat Kontrak Diperluas**
  - [x] Tambah pemilih *Milestone Jadual Bayaran* pratetap (30% LOA/Deposit, 40% Kerja Lapangan, 20% Deraf Pelan, 10% Kelulusan JUPEM/Penyerahan).
  - [x] Tambah pilihan klausa perlindungan:
    - *Gantian Tanda Sempadan Hilang (Re-pegging rate per mark)*.
    - *Klausa Pindaan Susunatur Arkitek (Time-cost basis)*.
    - *Klausa Lawatan Terbantut (Abortive site visit charge)*.
    - *Klausa Kelewatan Kelulusan Agensi Kerajaan*.
    - *Klausa Had Tanggungrugi Profesional (PII Limitation of Liability)*.

---

## Fasa 3: Enjin Pengiraan Skala Fi LJT/PEJUTA & JKR/Perbendaharaan (`app.js`)

- [x] **Tugasan 3.1: Enjin Pengiraan Kadar Perbendaharaan (Treasury Rates Engine)**
  - [x] Laksanakan pengiraan automatik: Semenanjung Malaysia (RM743/PD) vs Sabah/Sarawak (RM966/PD).
  - [x] Laksanakan formula produktiviti kerja (cth: `Luas / 2.0 Ha` untuk Flat strip survey, `8 PD * Jarak (km)` untuk keratan rentas sungai).

- [x] **Tugasan 3.2: Logik Pengasingan Kewangan 3-Bahagian (3-Tier Financial Structure)**
  - [x] **Subtotal Bahagian A (Yuran Profesional / Stage 1 + Stage 2)**:
    - Jumlah kasar item perkhidmatan profesional.
    - Tolak diskaun yang dibenarkan (jika ada).
    - Kira SST 8%: `SST = Subtotal A selepas diskaun * 0.08`.
  - [x] **Subtotal Bahagian B (Bayaran Balik Agensi Kerajaan / Disbursements)**:
    - Jumlah item Bahagian B tanpa sebarang SST atau diskaun (caj *pass-through* tulen).
  - [x] **Subtotal Bahagian C (Logistik & Operasi Khas)**:
    - Penginapan, elaun luar, sewa bot, kawalan trafik TMP, permit zon keselamatan.
  - [x] **Jumlah Bersih Sebut Harga (Grand Total)**:
    - `Grand Total = (Subtotal A - Diskaun + SST) + Subtotal B + Subtotal C`.

- [x] **Tugasan 3.3: Perlindungan Pematuhan Akta 458 Terhadap Diskaun Mandatori**
  - [x] Beri amaran/sekatan sekiranya pengguna cuba mengenakan diskaun ke atas item mandatori skala statutori LJT (Ukur Hakmilik Kadaster).

---

## Fasa 4: Modul Pilihan Templat Pantas (1-Click Project Presets)

- [x] **Tugasan 4.1: Cipta Templat Pratetap Mengikut Jenis Projek Standard**
  - [x] **Templat 1: Format JKR - Penggantian Jambatan & Jajaran Jalan (Penanda Aras Sg. Rinching)**
    - Auto-aktifkan: Stage 1 (Preparatory, Strip Survey, Topografi, Tapak Jambatan & Sounding Sungai, Utiliti), Stage 2 (Setting Out Reserve), Reimbursables (PBT Seksyen 4 & Seksyen 8, Carian PTG, Data eKadaster, Pelan Pra-Hitungan).
  - [x] **Templat 2: Pecah Sempadan Tanah Pertanian (Subdivision KTN 135)**
    - Auto-aktifkan: Carian Hakmilik PTG, Deposit LJT, Pelan Akui eKadaster, Trabas Kawalan, Ukur Sempadan Lot Baru, Batu Sempadan Konkrit, Pelan Pra-Hitungan.
  - [x] **Templat 3: Ukur Topografi Tapak Pembangunan (5 Hektar)**
    - Auto-aktifkan: Trabas Kawalan GNSS, Aras Datum LSD, Ukur Butiran Kontur 0.5m, Pelan AutoCAD & PDF.
  - [x] **Templat 4: Ukur As-Built Bangunan & Infrastruktur untuk CCC/CF**
    - Auto-aktifkan: Semakan Sempadan Bangunan/Setback, Ukur Longkang & Retikulasi, Sijil Pengesahan As-Built.
  - [x] **Templat 5: Pemetaan Utiliti Bawah Tanah Koridor (2 km - QL-B)**
    - Auto-aktifkan: Carian Rekod Utiliti (QL-D), Ukur Butiran Permukaan (QL-C), Pengesanan EML & Imbasan GPR (QL-B), Laporan Utiliti PKPUP 1/2006.
  - [x] **Templat 6: Ukur Dron UAV & LiDAR (50 Hektar)**
    - Auto-aktifkan: Permit CAAM/JUPEM, Penanaman GCP GNSS, Fotogrametri Ortofoto, Point Cloud LiDAR, DEM/DTM.

- [x] **Tugasan 4.2: Logik Butang Muat Turun & Tukar Templat**
  - [x] Tambah dropdown/butang "Muat Templat Projek" dalam borang yang mengisi nilai lalai, skop, dan kadar secara automatik.

---

## Fasa 5: Penambahbaikan Paparan Dokumen A4 & Jana PDF

- [x] **Tugasan 5.1: Pengepala & Blok Maklumat Rasmi Firma LJT**
  - [x] Paparkan No. Pendaftaran Firma LJT, No. Perakuan Amalan Juruukur, alamat rasmi, e-mel dan talian telefon.
  - [x] Paparkan Cop Meterai Rasmi (*Official Seal Stamp*) berserta No. LJT Juruukur dan No. Firma LJT.

- [x] **Tugasan 5.2: Blok Butiran Pentadbiran Tanah (Land Information Header)**
  - [x] Paparkan jadual kemas: Negeri, Daerah, Mukim, No. Lot/PT, No. Hakmilik, Keluasan, Kategori Tanah, Datum Koordinat & Aras Ketinggian.

- [x] **Tugasan 5.3: Jadual Senarai Kuantiti Berstruktur (Structured BQ Layout)**
  - [x] Susun jadual mengikut format yang dipilih (Format JKR: Stage 1, Stage 2, Reimbursables / Format Komersial: Bahagian A, B, C).
  - [x] Paparkan ringkasan kewangan yang jelas: Yuran Perunding + SST 8% + Kos Imbuhan Balik / Reimbursables.

- [x] **Tugasan 5.4: Paparan Seksyen Tambahan (Deliverables & Daywork)**
  - [x] Paparkan jadual *Deliverables Matrix* (Format fail & bilangan set pelan).
  - [x] Paparkan *Schedule of Daywork Rates* (jika diaktifkan).
  - [x] Paparkan jadual *Milestone Pembayaran* (30% / 40% / 20% / 10%).
  - [x] Paparkan klausa syarat perkhidmatan yang lengkap (termasuk gantian batu sempadan, lawatan terbantut, kelewatan agensi kerajaan, insurans PII).

- [x] **Tugasan 5.5: Pengendalian PDF Pelbagai Halaman (Multi-page Pagination)**
  - [x] Selaras pemecahan halaman CSS (`page-break-inside: avoid;`, `page-break-before: auto;`).
  - [x] Pastikan pengepala jadual diulang secara kemas sekiranya BQ melebihi 1 muka surat.
  - [x] Pastikan blok tandatangan dan cop LJT sentiasa berada di halaman penutup dengan teratur.

---

## Fasa 6: Sistem Simpanan Draf, Eksport/Import & Kawalan Semakan

- [x] **Tugasan 6.1: Integrasi `localStorage` Pelayar**
  - [x] Auto-simpan draf semasa secara masa nyata (*real-time auto-save*).
  - [x] Butang "Simpan Sebut Harga" dan "Buka Sebut Harga Terdahulu".

- [x] **Tugasan 6.2: Eksport & Import Fail JSON / CSV**
  - [x] Butang eksport fail konfigurasi sebut harga (`.json`).
  - [x] Butang import fail sebut harga sedia ada untuk tujuan kemaskini atau salinan.

- [x] **Tugasan 6.3: Penomboran Rujukan & Kawalan Semakan (Revision Tracking)**
  - [x] Format rujukan automatik: `[KOD FIRMA]/[TAHUN]/Q-[NO SIRI]-Rev[SEMAKAN]` (contoh: `SJK/2026/Q-4102-Rev01`).
  - [x] Rekod tarikh pindaan sebut harga.

---

## Fasa 7: Pengesahan, Ujian & Jaminan Kualiti

- [x] **Tugasan 7.1: Ujian Ketepatan Pengiraan Kewangan**
  - [x] Sahkan pengiraan SST 8% hanya dikenakan ke atas Yuran Profesional / Bahagian A (selepas diskaun).
  - [x] Sahkan Reimbursables / Bahagian B (Disbursements) dikecualikan daripada SST dan diskaun.
  - [x] Sahkan jumlah besar (*Grand Total*) adalah tepat 100% tanpa ralat pembundaran sen.

- [x] **Tugasan 7.2: Ujian Penjanaan PDF & Percetakan**
  - [x] Uji cetakan dokumen 1 halaman (projek kecil).
  - [x] Uji cetakan dokumen 2-3 halaman (projek kompleks dengan senarai BQ panjang).
  - [x] Sahkan logo resolusi tinggi, tandatangan digital, dan cop merah LJT terpapar tajam dalam fail PDF.

- [x] **Tugasan 7.3: Ujian Keserasian Pelayar & Peranti**
  - [x] Sahkan kefungsian borang berjalan lancar pada Chrome, Edge, Firefox, dan Safari.

---

## Fasa Masa Hadapan & Pelan Hala Tuju (Future Roadmap)

- [ ] **Roadmap 1: Borang Penerimaan Sebut Harga (*Client Acceptance Slip / LOA Tear-Off*)**
  - [ ] Ruang tandatangan persetujuan klien, No. KP, jawatan, cop syarikat, dan persetujuan deposit 30% pada halaman akhir dokumen.
- [ ] **Roadmap 2: Metadata Perolehan Agensi Kerajaan (*Procurement & MOF Metadata*)**
  - [ ] Medan Kod Bidang MOF (`330201 - Ukur Tanah/Geomatik`), No. Pendaftaran SSM, status Bumiputera, dan No. Pendaftaran SST JKDM.
- [ ] **Roadmap 3: Klausa Cuaca Buruk & Luar Jangka (*Force Majeure / Monsoon Clause*)**
  - [ ] Klausa perlindungan kelewatan cuaca ekstrem, musim tengkujuh/banjir, dan halangan cerapan optik/GNSS.
- [ ] **Roadmap 4: Pengiraan Automatik Tarikh Luput (*Quotation Expiry Auto-Calculation*)**
  - [ ] Pengiraan automatik tempoh sah laku (60 hari dari tarikh dokumen) berserta klausa semakan harga semula selepas tarikh luput.
- [ ] **Roadmap 5: Ringkasan Pecahan Kos Eksekutif (*Executive Cost Breakdown Summary*)**
  - [ ] Ringkasan visual peratusan kos: Kerja Lapangan (Fieldwork) vs Kerja Pejabat (Data Drafting) vs Bayaran Balik Kerajaan (Pass-Through).
- [ ] **Roadmap 6: Modul Jadual Tempoh Perkhidmatan (24-Month Project Timeline / Gantt Chart)**
  - [ ] Menjana carta garis masa bulanan projek merangkumi: Kerja Lapangan, PBT Seksyen 4, PBT Seksyen 8, Verifikasi Pembinaan, dan Perakuan Muktamad.
