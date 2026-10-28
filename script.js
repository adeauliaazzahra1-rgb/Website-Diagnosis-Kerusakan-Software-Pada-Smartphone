// 1. Data Gejala (G01-G12)
const dataGejala = {
    G01: "Smartphone terkadang mengalami slow respond (lambat)",
    G02: "Aplikasi sering force close (tertutup paksa)",
    G03: "Tidak dapat memasuki menu aplikasi",
    G04: "Wi-Fi tidak muncul / Kamera tidak dapat digunakan",
    G05: "Hanya menampilkan logo animasi di layar utama",
    G06: "Aplikasi berhenti secara tiba-tiba (Not Responding)",
    G07: "Stuck di logo merek pabrikan",
    G08: "Hanya menampilkan animasi pada layar utama (restart berulang)",
    G09: "Smartphone mati total",
    G10: "Smartphone restart sistem secara berulang-ulang",
    G11: "Sistem terasa aneh / Not responding tiba-tiba",
    G12: "Aplikasi tidak dapat ditutup saat digunakan"
};

// 2. Tabel CF Pakar (Berdasarkan Jurnal)
const cfPakar = {
    G01: { JK01: 1.0 },
    G02: { JK01: 1.0, JK06: 0.2 },
    G03: { JK02: 0.8 },
    G04: { JK02: 0.8, JK06: 1.0 },
    G05: { JK03: 1.0 },
    G06: { JK06: 1.0 },
    G07: { JK04: 1.0 },
    G08: { JK03: 0.4, JK04: 1.0, JK05: 0.8 },
    G09: { JK04: 0.8, JK05: 1.0 },
    G10: { JK01: 1.0, JK06: 1.0 },
    G11: { JK02: 0.6, JK03: 0.2 },
    G12: { JK02: 0.8, JK06: 1.0 }
};

// Data Penyakit & Solusi
const dataKerusakan = {
    JK01: { nama: "Light Bootloop", solusi: "1. Melakukan pembaruan aplikasi<br>2. Melakukan pembaruan sistem<br>3. Melakukan restart smartphone" },
    JK02: { nama: "Medium Bootloop", solusi: "1. Melakukan flashing dengan firmware yang sama<br>2. Melakukan factory reset / reset pabrik" },
    JK03: { nama: "Hard Bootloop", solusi: "1. Melakukan pengecekan hardware dari power hingga data memory processor" },
    JK04: { nama: "Softbrick", solusi: "1. Masuk ke dalam recovery mode<br>2. Install menggunakan SPI flash tool" },
    JK05: { nama: "Hardbrick", solusi: "1. Pengecekan pada hardware<br>2. Memperbaiki menggunakan JTAG" },
    JK06: { nama: "Freeze", solusi: "1. Menyesuaikan penggunaan dengan spesifikasi smartphone<br>2. Membersihkan RAM<br>3. Tidak menggunakan smartphone secara berlebihan" }
};

// Nilai CF User berdasarkan pilihan dropdown
const cfUserValue = {
    "1.0": 1.0,  // Pasti Ya
    "0.8": 0.8,  // Hampir Pasti Ya
    "0.6": 0.6,  // Mungkin Ya
    "0.4": 0.4,  // Mungkin Tidak
    "0.2": 0.2,  // Hampir Pasti Tidak
    "0": 0       // Pasti Tidak
};

// 3. Generate UI Form saat halaman dimuat
window.onload = function() {
    const container = document.getElementById('daftarGejala');
    for (const [kode, teks] of Object.entries(dataGejala)) {
        let div = document.createElement('div');
        div.className = 'gejala-item';
        div.innerHTML = `
            <div class="gejala-info">
                <strong>${kode}</strong> - ${teks}
            </div>
            <select id="cf_${kode}">
                <option value="0">Pasti Tidak (0)</option>
                <option value="0.2">Hampir Pasti Tidak (0.2)</option>
                <option value="0.4">Mungkin Tidak (0.4)</option>
                <option value="0.6">Mungkin Ya (0.6)</option>
                <option value="0.8">Hampir Pasti Ya (0.8)</option>
                <option value="1.0">Pasti Ya (1.0)</option>
            </select>
        `;
        container.appendChild(div);
    }
};

// 4. Fungsi Utama Diagnosis
function prosesDiagnosis() {
    let hasilAkhir = {};
    let adaGejalaDipilih = false;

    // Loop semua gejala
    for (const kodeGejala in dataGejala) {
        let nilaiUserStr = document.getElementById(`cf_${kodeGejala}`).value;
        let nilaiUser = cfUserValue[nilaiUserStr];

        // Jika user memilih keyakinan > 0 (gejala dialami)
        if (nilaiUser > 0) {
            adaGejalaDipilih = true;
            
            // Cek apakah gejala ini ada di basis aturan pakar
            if (cfPakar[kodeGejala]) {
                // Loop ke semua kerusakan yang terkait gejala tersebut
                for (const kodeKerusakan in cfPakar[kodeGejala]) {
                    let cfPakarVal = cfPakar[kodeGejala][kodeKerusakan];
                    
                    // Persamaan 2: CF(H,E) = CF(H) * CF(E)
                    let cfKali = cfPakarVal * nilaiUser;

                    // Persamaan 3: Kombinasi CF
                    if (!hasilAkhir[kodeKerusakan]) {
                        hasilAkhir[kodeKerusakan] = cfKali; // Jika data pertama
                    } else {
                        let cfLama = hasilAkhir[kodeKerusakan];
                        hasilAkhir[kodeKerusakan] = cfLama + cfKali * (1 - cfLama);
                    }
                }
            }
        }
    }

    // Validasi jika tidak ada gejala yang dipilih
    if (!adaGejalaDipilih) {
        alert("Silakan pilih minimal satu gejala yang dialami!");
        return;
    }

    tampilkanHasil(hasilAkhir);
}

// 5. Fungsi Menampilkan Hasil ke Layar
function tampilkanHasil(hasil) {
    let konten = document.getElementById('kontenHasil');
    konten.innerHTML = ""; // Bersihkan konten sebelumnya

    // Ubah objek hasil menjadi array dan urutkan dari persentase terbesar
    let hasilArray = Object.keys(hasil).map(key => {
        return { kode: key, nilai: hasil[key] };
    }).sort((a, b) => b.nilai - a.nilai); // Urutkan Descending

    // Ambil hasil tertinggi
    let maxHasil = hasilArray[0];
    
    // Jika hasil tertinggi 0 (aneh, tapi untuk jaga-jaga)
    if (maxHasil.nilai === 0) {
        konten.innerHTML = "<p>Gejala yang dipilih tidak cocok dengan basis aturan pakar.</p>";
    } else {
        let persentase = (maxHasil.nilai * 100).toFixed(2);
        let infoKerusakan = dataKerusakan[maxHasil.kode];

        let htmlHasil = `
            <div class="hasil-card">
                <h3>Kerusakan Terdeteksi: ${infoKerusakan.nama} (${maxHasil.kode})</h3>
                <p>Tingkat Keyakinan Sistem: <strong>${persentase}%</strong></p>
                <hr>
                <h4>Solusi Penanganan:</h4>
                <p class="solusi">${infoKerusakan.solusi}</p>
            </div>
        `;

        // (Opsional) Tampilkan kemungkinan lain jika nilainya > 10% (agar tidak spam)
        let kemungkinanLain = hasilArray.slice(1).filter(item => item.nilai > 0.1);
        if (kemungkinanLain.length > 0) {
            htmlHasil += `<h4>Kemungkinan Kerusakan Lain:</h4>`;
            kemungkinanLain.forEach(item => {
                let persenLain = (item.nilai * 100).toFixed(2);
                htmlHasil += `<li>${dataKerusakan[item.kode].nama} (${persenLain}%)</li>`;
            });
        }

        konten.innerHTML = htmlHasil;
    }

    // Sembunyikan form, tampilkan hasil
    document.getElementById('formDiagnosis').classList.add('hidden');
    document.getElementById('hasilDiagnosis').classList.remove('hidden');
}

// 6. Fungsi Reset (Diagnosis Ulang)
function resetForm() {
    // Reset semua dropdown ke nilai awal (0)
    document.querySelectorAll('select').forEach(select => select.value = "0");
    
    // Tampilkan form, sembunyikan hasil
    document.getElementById('formDiagnosis').classList.remove('hidden');
    document.getElementById('hasilDiagnosis').classList.add('hidden');
}