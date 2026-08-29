import io
with io.open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'title: "CADANGAN PENGGANTIAN JAMBATAN SUNGAI RINCHING DAN KERJA-KERJA UKUR KEJURUTERAAN SERTA PENGAMBILAN BALIK TANAH (PBT)",',
    'title: "CADANGAN KERJA-KERJA UKUR KEJURUTERAAN DAN PENGAMBILAN TANAH BAGI PROJEK JALAN/JAMBATAN (TENDER JKR)",'
)
content = content.replace(
    'titleEn: "PROPOSED REPLACEMENT OF SG. RINCHING BRIDGE, DETAILED ENGINEERING SURVEY AND LAND ACQUISITION (PBT)",',
    'titleEn: "PROPOSED DETAILED ENGINEERING SURVEY AND LAND ACQUISITION FOR ROAD/BRIDGE PROJECT (JKR TENDER)",'
)
content = content.replace(
    'subtitle: "DI SEPANJANG JALAN KAJANG - SEMENYIH (LALUAN PERSEKUTUAN FT001), DAERAH HULU LANGAT, SELANGOR",',
    'subtitle: "DAERAH [Sila Masukkan Daerah], NEGERI [Sila Masukkan Negeri]",'
)
content = content.replace(
    'subtitleEn: "ALONG KAJANG - SEMENYIH ROAD (FEDERAL ROUTE FT001), DISTRICT OF HULU LANGAT, SELANGOR",',
    'subtitleEn: "DISTRICT OF [Insert District], STATE OF [Insert State]",'
)
content = content.replace(
    'lotNo: "Rizab Jalan FT001 & Jambatan Sg. Rinching",',
    'lotNo: "[Sila Masukkan Nama Jalan / Jambatan]",'
)
content = content.replace(
    'landDistrict: "Hulu Langat",',
    'landDistrict: "[Daerah]",'
)
content = content.replace(
    'landMukim: "Mukim Semenyih",',
    'landMukim: "[Mukim]",'
)

# Also fix the subtitle fallback in defaults if present
content = content.replace(
    'quoteSubtitle: "DI SEPANJANG JALAN KAJANG - SEMENYIH (LALUAN PERSEKUTUAN FT001), DAERAH HULU LANGAT, SELANGOR",',
    'quoteSubtitle: "DAERAH [Sila Masukkan Daerah], NEGERI [Sila Masukkan Negeri]",'
)

with io.open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)
