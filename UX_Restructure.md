# Cadangan Penstrukturan Semula UX / UI (UX Restructure)

Dokumen ini merekodkan maklum balas dan cadangan daripada pihak Juruukur (Surveyor) berkenaan dengan reka bentuk antaramuka (UX) sistem. Ia "diparkir" di sini untuk perancangan pembangunan akan datang (Future Enhancements).

## 1. Latar Belakang & Cabaran Semasa

Berdasarkan maklum balas dari lapangan (realiti amalan firma juruukur di Malaysia), reka bentuk borang yang menyenaraikan semua 40+ item BQ secara serentak berisiko menjadi terlalu rumit (*overly complicated*) dan membebankan pengguna.

**Realiti Lapangan (Prinsip Pareto 80/20):**
*   **80% Kerja Harian (Komersial/Swasta):** Hanya memerlukan 4 hingga 7 baris item sahaja (contoh: Trabas kawalan, ukur butiran, pelan AutoCAD, carian PTG, dan SST). Dokumen sebut harga kebiasaannya ringkas (1-2 muka surat).
*   **20% Projek Khas / Tender (JKR/JPS):** Melibatkan projek berskala besar seperti Sg. Rinching yang memerlukan pemecahan berpuluh-puluh item BQ secara terperinci (Preliminary Survey, Setting Out, dll).

## 2. Falsafah Reka Bentuk Baharu: "Simple by Default, Deep on Demand"

Bagi menyelesaikan isu lambakan maklumat (*information overload*), sistem dicadangkan untuk menggunakan pendekatan **3-Tier UX Architecture**.

### 2.1. Tiga (3) Mod Borang Pemilihan (3-Tier UX)

Pengguna boleh memilih mod borang sebelum mula membina sebut harga:

1.  **Mode A: Ringkas / Komersial (Simple Mode)**
    *   **Sasaran:** Kerja-kerja swasta biasa (Topografi, Pecah Sempadan ringkas).
    *   **Antaramuka:** Hanya memaparkan 10 item yang paling kerap digunakan secara lalai.
    *   **Hasil:** Pantas dan tidak memeningkan untuk kerja harian.
2.  **Mode B: Kadaster (Cadastral Mode)**
    *   **Sasaran:** Pengukuran hakmilik tanah berskala sederhana hingga besar.
    *   **Antaramuka:** Fokus kepada keperluan Kanun Tanah Negara, bayaran ukur berkanun (LJT), penyediaan Pelan Akui (PA), dan bayaran Pejabat Tanah (PTG).
3.  **Mode C: Tender Kerajaan (Komprehensif / JKR)**
    *   **Sasaran:** Projek Tender JKR, JPS, dan Lebuhraya.
    *   **Antaramuka:** Memaparkan keseluruhan hierarki 40+ item BQ mengikut fasa (Stage 1, Stage 2, Reimbursables) seperti penanda aras Sg. Rinching.

### 2.2. Penambahan Fungsi Dinamik (QoL Improvements)

Bagi menyokong seni bina UX di atas, fungsi sokongan berikut perlu dibangunkan:

*   **Live Search BQ Items:** Bar carian (Search Bar) untuk membolehkan pengguna menaip kata kunci (cth: "SST", "Ukur Tanah", "Batu Sempadan") dan memilih item tanpa perlu skrol panjang.
*   **Custom Line Items ("Tambah Item Bebas"):** Membolehkan pengguna menambah barisan item secara manual jika skop kerja atau terma tersebut tidak wujud dalam senarai piawai. Pengguna boleh menetapkan nama, kuantiti, dan kadar harga sendiri.

## 3. Rumusan BA / QA

Pendekatan ini akan menyeimbangkan keperluan pengguna untuk kerja-kerja yang pantas dan mudah dengan kemampuan sistem untuk mengendalikan dokumentasi tender kerajaan yang sangat terperinci. 

*Nota: Keperluan ini akan dipertimbangkan dan dimasukkan ke dalam jadual perancangan selepas fasa-fasa teras (Core Phases) selesai diuji dan disahkan stabil.*
