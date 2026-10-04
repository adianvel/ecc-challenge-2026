import { PathCode, PathInfo, QuizQuestion, BossMission } from '../types';

export const OFFICIAL_PATHS: Record<string, PathInfo> = {
  professional: {
    code: 'professional',
    title: 'Profesional',
    subtitle: 'Keunggulan Korporat & Tata Kelola Strategis',
    description: 'Fokus pada pengembangan kapabilitas kepemimpinan profesional, manajemen pemangku kepentingan, efisiensi operasional, dan integritas industri.',
    themeColor: '#0ea5e9', // Sky blue
    accentBadge: 'Corporate Strategist',
    archetypeRole: 'Ksatria Strategis (Knight)',
    statHighlight: 'Tata Kelola +95, Analisis +90'
  },
  social_impact: {
    code: 'social_impact',
    title: 'Social Impact',
    subtitle: 'Pemberdayaan Masyarakat & Dampak Berkelanjutan',
    description: 'Fokus pada pemecahan akar masalah sosial, advokasi komunitas, inklusivitas, pengukuran dampak sosial (SROI), dan keberlanjutan program.',
    themeColor: '#10b981', // Emerald green
    accentBadge: 'Community Catalyst',
    archetypeRole: 'Mistikus Dampak (Mage)',
    statHighlight: 'Sensitivitas Sosial +98, Kolaborasi +92'
  },
  business: {
    code: 'business',
    title: 'Bisnis',
    subtitle: 'Inovasi Pasar & Pertumbuhan Wirausaha',
    description: 'Fokus pada validasi model bisnis, monetisasi terukur, diferensiasi produk, kepemilikan risiko wirausaha, dan kesiapan investasi.',
    themeColor: '#f59e0b', // Amber gold
    accentBadge: 'Market Entrepreneur',
    archetypeRole: 'Assassin Lincah (Assassin)',
    statHighlight: 'Validasi Pasar +96, Eksekusi +94'
  }
};

export const STAGE_CONFIGS = [
  {
    ordinal: 1,
    title: 'Tahap 1: Discover & Empathize',
    theme: 'Eksplorasi Lapangan & Validasi Masalah',
    quotaTarget: '100 → 50 Peserta',
    enemyCount: 3,
    dates: '15 Okt 2026',
    objective: 'Identifikasi akar persoalan mendasar dan lakukan wawancara mendalam bersama narasumber relevan.'
  },
  {
    ordinal: 2,
    title: 'Tahap 2: Define, Ideate & Prototype',
    theme: 'Konseptualisasi Solusi & Pengujian Awal',
    quotaTarget: '50 → 25 Peserta',
    enemyCount: 3,
    dates: '22 Okt 2026',
    objective: 'Ubah wawasan masalah menjadi prototipe solusi nyata dan kumpulkan feedback dari calon pengguna.'
  },
  {
    ordinal: 3,
    title: 'Tahap 3: Test, Refine & Pitch',
    theme: 'Validasi Hasil & Kesiapan Presentasi',
    quotaTarget: '25 → 9 Finalis (3 per Path)',
    enemyCount: 3,
    dates: '29 Okt 2026',
    objective: 'Sempurnakan prototipe, susun metrik keberhasilan, dan siapkan pitch deck final untuk Jakarta.'
  },
  {
    ordinal: 4,
    title: 'Tahap 4: Impact & Celebration',
    theme: 'Kelulusan, Komitmen & Altar Dampak',
    quotaTarget: 'Finalis Terpilih',
    enemyCount: 3,
    dates: '05 Nov 2026',
    objective: 'Rayakan pencapaian, rumuskan komitmen keberlanjutan dampak, dan resmikan kelulusan ekspedisi.'
  },
];

import type { StageOrdinal } from './participantStages';

export const TRACK_STAGE_FOCUS: Record<PathCode, Record<StageOrdinal, string>> = {
  professional: {
    1: 'Validasi tantangan nyata di tempat kerja atau organisasi melalui bukti langsung.',
    2: 'Rancang prototipe perbaikan praktis dan uji dengan penggunanya.',
    3: 'Presentasikan solusi yang telah diuji, model operasional, dan rencana 90 hari.',
    4: 'Rayakan kepemimpinan profesional dan komitmen dampak jangka panjang di industri.'
  },
  social_impact: {
    1: 'Validasi kebutuhan komunitas bersama warga yang mengalaminya.',
    2: 'Rancang respons yang inklusif dan uji bersama komunitas.',
    3: 'Presentasikan bukti, dampak berkelanjutan, dan rencana 90 hari.',
    4: 'Rayakan pencapaian advokasi sosial dan manifesto keberlanjutan dampak komunitas.'
  },
  business: {
    1: 'Validasi masalah pelanggan melalui bukti langsung dari pasar.',
    2: 'Rancang solusi pasar dan uji manfaatnya bersama pelanggan.',
    3: 'Presentasikan traksi, model bisnis, dan rencana 90 hari.',
    4: 'Rayakan validasi wirausaha, komitmen pertumbuhan pasar, dan investasi masa depan.'
  }
};

export const STAGE_QUIZZES: QuizQuestion[] = [
  // Stage 1
  {
    id: 'quiz-s1-e1',
    stageOrdinal: 1,
    enemyId: 'enemy-s1-1',
    enemyName: 'Challenger Asumsi',
    title: 'Validasi Masalah Nyata vs Asumsi Pribadi',
    scenario: 'Dalam riset awal, Anda menduga target pengguna membutuhkan aplikasi mobile rumit. Namun saat wawancara 5 responden pertama di lapangan, mereka mengeluhkan konektivitas internet yang buruk dan literasi digital rendah.',
    question: 'Tindakan metodologis apa yang paling tepat untuk membuktikan validitas masalah ini?',
    options: [
      {
        id: 'opt-a',
        text: 'Mengabaikan keluhan 5 orang pertama dan mencari responden lain yang melek teknologi.',
        isCorrect: false,
        explanation: 'Memilih responden yang hanya setuju dengan asumsi pribadi melanggar prinsip empati riset.'
      },
      {
        id: 'opt-b',
        text: 'Mendokumentasikan pain point nyata, memvalidasi kendala koneksi pada segmen lebih luas, dan menyesuaikan hipotesis solusi.',
        isCorrect: true,
        explanation: 'Discover & Empathize mengharuskan kita berorientasi pada fakta lapangan dan kebutuhan autentik pengguna.'
      },
      {
        id: 'opt-c',
        text: 'Langsung membuat aplikasi versi desktop tanpa menguji masalah lebih lanjut.',
        isCorrect: false,
        explanation: 'Solusi langsung tanpa memahami akar kendala berisiko menghasilkan produk yang tidak terpakai.'
      }
    ],
    xpReward: 60
  },
  {
    id: 'quiz-s1-e2', stageOrdinal: 1, enemyId: 'enemy-s1-2', enemyName: 'Pengintai Sungai',
    title: 'Wawancara Tanpa Mengarahkan Jawaban',
    scenario: 'Anda ingin memahami mengapa peserta kesulitan menyelesaikan pelatihan daring. Seorang rekan menyarankan bertanya, "Aplikasi kami terlalu rumit, bukan?" kepada semua responden.',
    question: 'Pertanyaan mana yang paling membantu Anda menemukan pengalaman responden tanpa menggiring jawabannya?',
    options: [
      { id: 'opt-a', text: 'Ceritakan langkah terakhir saat Anda mencoba menyelesaikan pelatihan. Di bagian mana Anda berhenti?', isCorrect: true, explanation: 'Pertanyaan terbuka tentang kejadian nyata memberi ruang bagi responden menjelaskan hambatan dengan bahasanya sendiri.' },
      { id: 'opt-b', text: 'Anda setuju bahwa tampilan aplikasi kami terlalu rumit, kan?', isCorrect: false, explanation: 'Pertanyaan ini memasukkan dugaan pewawancara ke dalam jawaban responden.' },
      { id: 'opt-c', text: 'Jika aplikasinya lebih menarik, Anda pasti akan menyelesaikan pelatihan?', isCorrect: false, explanation: 'Pertanyaan hipotetis tidak menjelaskan hambatan yang benar-benar terjadi.' },
    ], xpReward: 10,
  },
  {
    id: 'quiz-s1-e3', stageOrdinal: 1, enemyId: 'enemy-s1-3', enemyName: 'Bayangan Asumsi',
    title: 'Memeriksa Masalah dari Berbagai Sumber',
    scenario: 'Tiga peserta menyebut biaya internet sebagai hambatan utama, tetapi catatan kehadiran menunjukkan banyak peserta berhenti pada tugas praktik kedua.',
    question: 'Apa langkah validasi berikutnya sebelum menetapkan akar masalah?',
    options: [
      { id: 'opt-a', text: 'Bandingkan wawancara, catatan penggunaan, dan pengamatan tugas; lalu tanyakan penyebab berhenti pada titik tersebut.', isCorrect: true, explanation: 'Triangulasi bukti membantu membedakan dugaan, hambatan yang dilaporkan, dan perilaku nyata.' },
      { id: 'opt-b', text: 'Pilih biaya internet sebagai akar masalah karena disebut paling sering dalam wawancara awal.', isCorrect: false, explanation: 'Sampel kecil dan satu sumber belum cukup untuk menyimpulkan akar masalah.' },
      { id: 'opt-c', text: 'Abaikan wawancara karena data kehadiran selalu lebih akurat.', isCorrect: false, explanation: 'Data perilaku menunjukkan titik berhenti, tetapi belum menjelaskan alasannya.' },
    ], xpReward: 10,
  },

  // Stage 2
  {
    id: 'quiz-s2-e1',
    stageOrdinal: 2,
    enemyId: 'enemy-s2-1',
    enemyName: 'Naga Penjaga Ide',
    title: 'Divergensi Ide & Problem Statement HMW',
    scenario: 'Setelah menganalisis sintesis empati, tim Anda merumuskan "How Might We (HMW)" untuk menjawab kesenjangan keterampilan kerja pada lulusan baru.',
    question: 'Karakteristik formula HMW yang efektif untuk memicu ideasi bermutu tinggi adalah:',
    options: [
      {
        id: 'opt-a',
        text: 'Cukup luas untuk memberi ruang eksplorasi solusi beragam, namun cukup spesifik untuk tetap berpijak pada akar masalah.',
        isCorrect: true,
        explanation: 'Rumusan HMW yang seimbang membuka berbagai alternatif ide brilian tanpa keluar dari konteks problem.'
      },
      {
        id: 'opt-b',
        text: 'Menyebutkan teknologi spesifik (seperti AI Blockchain) langsung dalam rumusan pertanyaan.',
        isCorrect: false,
        explanation: 'Menyebut teknologi terlalu dini membatasi ideasi dan memaksakan solusi sebelum waktunya.'
      },
      {
        id: 'opt-c',
        text: 'Sangat umum sehingga bisa mencakup seluruh masalah ekonomi nasional.',
        isCorrect: false,
        explanation: 'Rumusan yang terlalu luas akan membingungkan eksekusi dan pengujian prototipe.'
      }
    ],
    xpReward: 70
  },
  {
    id: 'quiz-s2-e2',
    stageOrdinal: 2,
    enemyId: 'enemy-s2-2',
    enemyName: 'Prototype Tester',
    title: 'Tingkat Ketelitian Prototipe (Fidelity vs Speed)',
    scenario: 'Untuk menguji alur onboarding program pelatihan, tim Anda berdebat apakah perlu coding aplikasi lengkap selama 3 minggu atau membuat clickable wireframe dalam 2 hari.',
    question: 'Berdasarkan kaidah Design Thinking pada tahap awal pengujian pengguna:',
    options: [
      {
        id: 'opt-a',
        text: 'Gunakan prototipe low-to-mid fidelity cepat untuk memvalidasi interaksi dan kejelasan konsep dengan biaya kegagalan serendah mungkin.',
        isCorrect: true,
        explanation: 'Prototipe cepat memungkinkan iterasi berulang tanpa menghabiskan sumber daya besar sebelum konsep terbukti.'
      },
      {
        id: 'opt-b',
        text: 'Wajib membangun sistem backend database penuh sebelum menunjukkan kepada calon pengguna pertama.',
        isCorrect: false,
        explanation: 'Membangun backend penuh sebelum validasi fungsional adalah pemborosan besar jika ide berubah.'
      }
    ],
    xpReward: 80
  },
  {
    id: 'quiz-s2-e3', stageOrdinal: 2, enemyId: 'enemy-s2-3', enemyName: 'Penjaga Bengkel',
    title: 'Mengukur Uji Prototipe Kecil',
    scenario: 'Lima calon pengguna mencoba prototipe pendaftaran. Empat orang memerlukan bantuan untuk menemukan tombol lanjut, tetapi semuanya mengatakan tampilannya menarik.',
    question: 'Perbaikan apa yang paling tepat untuk iterasi berikutnya?',
    options: [
      { id: 'opt-a', text: 'Perjelas jalur menuju tombol lanjut, lalu uji kembali apakah pengguna dapat menyelesaikan tugas tanpa bantuan.', isCorrect: true, explanation: 'Keberhasilan tugas tanpa bantuan adalah bukti yang lebih berguna daripada pujian umum terhadap tampilan.' },
      { id: 'opt-b', text: 'Pertahankan alur karena semua pengguna menyukai tampilannya.', isCorrect: false, explanation: 'Pujian tidak menghapus hambatan yang terlihat saat pengguna mencoba tugas.' },
      { id: 'opt-c', text: 'Tambahkan lebih banyak fitur sebelum menguji alur pendaftaran lagi.', isCorrect: false, explanation: 'Fitur baru belum menjawab hambatan yang sudah teramati.' },
    ], xpReward: 10,
  },

  // Stage 3
  {
    id: 'quiz-s3-e1',
    stageOrdinal: 3,
    enemyId: 'enemy-s3-1',
    enemyName: 'Market Evaluator',
    title: 'Validasi Daya Tarik & Metrik Keberhasilan',
    scenario: 'Dalam pengujian prototipe jalur Anda, 20 dari 25 partisipan menyatakan tertarik, namun hanya 3 yang bersedia berkomitmen mengisi survei tindak lanjut atau mendaftar pilot project.',
    question: 'Apa kesimpulan analitis yang harus diambil dari perbedaan data verbal vs tindakan nyata ini?',
    options: [
      {
        id: 'opt-a',
        text: 'Pernyataan verbal sering kali bias kesopanan; tindakan komitmen riil (skin in the game) adalah indikator validasi yang sesungguhnya.',
        isCorrect: true,
        explanation: 'Traction riil diukur dari tindakan nyata pengguna, bukan sekadar ucapan manis saat wawancara.'
      },
      {
        id: 'opt-b',
        text: 'Tingkat kepuasan sudah 80% sehingga tim dapat langsung bersiap peluncuran massal tanpa revisi penawaran.',
        isCorrect: false,
        explanation: 'Mengabaikan rendahnya konversi riil adalah kesalahan fatal dalam kesiapan produk/inisiatif.'
      }
    ],
    xpReward: 90
  },
  {
    id: 'quiz-s3-e2',
    stageOrdinal: 3,
    enemyId: 'enemy-s3-2',
    enemyName: 'Risk Sentinel',
    title: 'Mitigasi Risiko Regulasi & Keberlanjutan',
    scenario: 'Solusi yang Anda rancang melibatkan pengumpulan data riwayat kerja dan kontak pribadi peserta secara daring.',
    question: 'Langkah kepatuhan wajib apa yang harus disiapkan dalam rancangan operasional?',
    options: [
      {
        id: 'opt-a',
        text: 'Menyimpan semua data di spreadsheet publik agar juri mudah memeriksa kapan saja.',
        isCorrect: false,
        explanation: 'Membuka data pribadi tanpa kontrol akses melanggar etika dan hukum pelindungan data pribadi (UU PDP).'
      },
      {
        id: 'opt-b',
        text: 'Protokol persetujuan eksplisit (consent), enkripsi penyimpanan data, dan klausul kerahasiaan sesuai regulasi PDP.',
        isCorrect: true,
        explanation: 'Keamanan data dan kepatuhan hukum merupakan pondasi fundamental profesionalisme proyek berdampak.'
      }
    ],
    xpReward: 95
  },
  {
    id: 'quiz-s3-e3',
    stageOrdinal: 3,
    enemyId: 'enemy-s3-3',
    enemyName: 'Pitch Critic',
    title: 'Struktur Storytelling Pitching Eksekutif',
    scenario: 'Anda memiliki waktu 3 menit di hadapan dewan juri seleksi ECC untuk menyampaikan usulan inisiatif masa depan.',
    question: 'Urutan narasi pitch deck yang paling meyakinkan dewan juri adalah:',
    options: [
      {
        id: 'opt-a',
        text: 'Konteks Masalah mendesak → Validasi Pengguna → Solusi & Bukti Prototipe → Dampak/Model Berkelanjutan → Kesiapan Tim & Rencana 90 Hari.',
        isCorrect: true,
        explanation: 'Struktur ini memberikan bukti logis mulai dari keabsahan masalah hingga kelayakan eksekusi tim.'
      },
      {
        id: 'opt-b',
        text: 'Profil riwayat hidup presenter selama 2 menit, lalu menampilkan screenshot prototipe di 1 menit terakhir.',
        isCorrect: false,
        explanation: 'Alokasi waktu yang buruk gagal meyakinkan juri mengenai substansi nilai inovasi yang ditawarkan.'
      }
    ],
    xpReward: 100
  },

  // Stage 4 — provisional demo content until ECC supplies official material.
  {
    id: 'quiz-s4-e1', stageOrdinal: 4, enemyId: 'enemy-s4-1', enemyName: 'Penanda Dampak',
    title: 'Membedakan Kegiatan dan Dampak',
    scenario: 'Program Anda melatih 100 peserta. Tim ingin mengklaim bahwa kesejahteraan mereka meningkat, tetapi hanya memiliki daftar hadir.',
    question: 'Bukti tambahan apa yang diperlukan agar klaim dampak lebih kuat?',
    options: [
      { id: 'opt-a', text: 'Tetapkan kondisi awal, ukur perubahan hasil yang relevan setelah pelatihan, dan periksa faktor lain yang mungkin memengaruhinya.', isCorrect: true, explanation: 'Jumlah peserta menunjukkan keluaran kegiatan, sedangkan dampak memerlukan bukti perubahan hasil.' },
      { id: 'opt-b', text: 'Gunakan jumlah kehadiran sebagai bukti bahwa kesejahteraan semua peserta meningkat.', isCorrect: false, explanation: 'Kehadiran saja tidak menunjukkan perubahan kesejahteraan.' },
      { id: 'opt-c', text: 'Minta satu testimoni positif dan anggap mewakili semua peserta.', isCorrect: false, explanation: 'Satu kisah tidak cukup untuk mendukung klaim bagi seluruh peserta.' },
    ], xpReward: 10,
  },
  {
    id: 'quiz-s4-e2', stageOrdinal: 4, enemyId: 'enemy-s4-2', enemyName: 'Penjaga Keberlanjutan',
    title: 'Menjaga Manfaat Setelah Program Selesai',
    scenario: 'Uji coba solusi Anda berhasil, tetapi tim pelaksana sementara akan selesai bertugas bulan depan.',
    question: 'Langkah mana yang paling membantu manfaat solusi bertahan?',
    options: [
      { id: 'opt-a', text: 'Sepakati penanggung jawab lokal, sumber daya yang tersedia, ukuran hasil, dan jadwal evaluasi setelah serah terima.', isCorrect: true, explanation: 'Keberlanjutan memerlukan kepemilikan, sumber daya, dan cara memeriksa hasil setelah tim awal pergi.' },
      { id: 'opt-b', text: 'Umumkan keberhasilan tanpa menetapkan siapa yang menjalankan solusi berikutnya.', isCorrect: false, explanation: 'Tanpa pemilik operasional, manfaat mudah berhenti bersama tim awal.' },
      { id: 'opt-c', text: 'Perluas program ke semua wilayah sebelum mengetahui biaya pemeliharaannya.', isCorrect: false, explanation: 'Skala tanpa rencana operasional dapat melemahkan hasil uji coba.' },
    ], xpReward: 10,
  },
  {
    id: 'quiz-s4-e3', stageOrdinal: 4, enemyId: 'enemy-s4-3', enemyName: 'Gerbang Masa Depan',
    title: 'Komitmen Dampak 90 Hari',
    scenario: 'Anda menyelesaikan perjalanan Future Quest dan ingin memastikan hasilnya berlanjut setelah kelulusan.',
    question: 'Rencana 90 hari mana yang paling dapat dijalankan dan dievaluasi?',
    options: [
      { id: 'opt-a', text: 'Tetapkan satu hasil terukur, penanggung jawab, langkah bulanan, sumber daya, dan waktu meninjau bukti kemajuan.', isCorrect: true, explanation: 'Rencana konkret memiliki hasil, pemilik, langkah, sumber daya, dan titik evaluasi.' },
      { id: 'opt-b', text: 'Berjanji menciptakan dampak sebesar mungkin tanpa tanggal atau ukuran keberhasilan.', isCorrect: false, explanation: 'Komitmen tanpa ukuran dan waktu sulit dijalankan maupun dinilai.' },
      { id: 'opt-c', text: 'Menunggu peluang datang sebelum menentukan tindakan pertama.', isCorrect: false, explanation: 'Rencana 90 hari perlu tindakan awal yang berada dalam kendali peserta.' },
    ], xpReward: 10,
  }
];

export const STAGE_BOSS_MISSIONS: Record<number, BossMission> = {
  1: {
    id: 'boss-mission-s1',
    stageOrdinal: 1,
    bossName: 'The Empathy Titan',
    bossTitle: 'Penjaga Validitas Masalah Lapangan',
    title: 'Pengumpulan Bukti Wawancara & Analisis Temuan Lapangan',
    instructions: 'Unggah laporan ringkas temuan wawancara narasumber (minimal 3 responden) serta dokumentasi bukti autentik. Jelaskan masalah inti yang Anda temukan serta refleksi mengapa masalah ini mendesak untuk diselesaikan.',
    deliverables: [
      'File PDF / Dokumen catatan wawancara & dokumentasi foto/rekaman bukti',
      'Ringkasan masalah utama dalam 3-5 kalimat tegas',
      'Refleksi pembelajaran mandiri terhadap asumsi awal vs realitas'
    ],
    maxFiles: 3,
    allowedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'],
    rubricCriteria: [
      { key: 'problem_clarity', label: 'Kejelasan Perumusan Akar Masalah', maxScore: 40 },
      { key: 'evidence_quality', label: 'Kualitas & Keaslian Bukti Wawancara', maxScore: 40 },
      { key: 'reflection_depth', label: 'Kedalaman Refleksi Pembelajaran', maxScore: 20 }
    ]
  },
  2: {
    id: 'boss-mission-s2',
    stageOrdinal: 2,
    bossName: 'The Feasibility Behemoth',
    bossTitle: 'Penjaga Kelayakan Prototipe & Solusi',
    title: 'Pengumpulan Dokumentasi Prototipe & Umpan Balik Pengguna',
    instructions: 'Kirimkan rancangan prototipe awal solusi Anda (bisa berupa mockup wireframe, dokumen alur kerja program, atau demonstrasi model solusi), dilengkapi hasil uji coba dan masukan langsung dari pengguna.',
    deliverables: [
      'File dokumen prototipe (PDF / Presentasi PPTX / Tangkapan layar)',
      'Tautan prototipe interaktif (jika tersedia)',
      'Ringkasan iterasi perbaikan berdasarkan masukan pengguna'
    ],
    maxFiles: 4,
    allowedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg'],
    rubricCriteria: [
      { key: 'solution_fit', label: 'Kesesuaian Solusi dengan Masalah Tahap 1', maxScore: 35 },
      { key: 'prototype_execution', label: 'Kelayakan & Ketuntasan Prototipe', maxScore: 35 },
      { key: 'evidence_quality', label: 'Kualitas Bukti Uji Pengguna', maxScore: 10 },
      { key: 'user_feedback_action', label: 'Respon Perbaikan atas Masukan Pengguna', maxScore: 20 }
    ]
  },
  3: {
    id: 'boss-mission-s3',
    stageOrdinal: 3,
    bossName: 'The Pitch Overlord',
    bossTitle: 'Penjaga Gerbang Menuju 9 Kursi Finalis Jakarta',
    title: 'Pengumpulan Pitch Deck Final & Rencana Eksekusi 90 Hari',
    instructions: 'Unggah file pitch deck komprehensif maksimal 10 slide yang merangkum masalah, solusi teruji, traksi/respons pasar, model keberlanjutan, serta roadmap eksekusi 90 hari pasca seleksi.',
    deliverables: [
      'File Pitch Deck Final (PDF atau PPTX maksimum 20MB)',
      'Tautan rekaman video pitch singkat (durasi 2-3 menit opsional)',
      'Rencana target capaian 90 hari ke depan (Future Base)'
    ],
    maxFiles: 2,
    allowedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    rubricCriteria: [
      { key: 'strategic_impact', label: 'Dampak Strategis & Diferensiasi Nilai', maxScore: 30 },
      { key: 'evidence_quality', label: 'Kualitas Bukti Validasi & Traction', maxScore: 10 },
      { key: 'execution_readiness', label: 'Kesiapan Eksekusi & Roadmap 90 Hari', maxScore: 35 },
      { key: 'deck_professionalism', label: 'Kualitas Penyampaian & Ketajaman Data', maxScore: 25 }
    ]
  },
  4: {
    id: 'boss-mission-s4',
    stageOrdinal: 4,
    bossName: 'The Celestial Herald',
    bossTitle: 'Penjaga Dampak & Gerbang Kelulusan',
    title: 'Deklarasi Dampak Akhir & Komitmen Masa Depan',
    instructions: 'Kirimkan deklarasi dampak akhir dan manifesto komitmen masa depan Anda. Rayakan pencapaian seluruh perjalanan bootcamp Anda di Altar Kayangan.',
    deliverables: [
      'Manifesto Dampak & Visi Masa Depan',
      'Refleksi Komprehensif Perjalanan Ekspedisi',
      'Rencana Kolaborasi & Dampak Berkelanjutan'
    ],
    maxFiles: 2,
    allowedFormats: ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    rubricCriteria: [
      { key: 'impact_declaration', label: 'Kebermaknaan Dampak & Visi', maxScore: 50 },
      { key: 'commitment_depth', label: 'Kedalaman Komitmen & Eksekusi', maxScore: 50 }
    ]
  }
};
