let matkulList = [];

const ipkAwalEl = document.getElementById('ipkAwal');
const sksAwalEl = document.getElementById('sksAwal');
const bobotAwalText = document.getElementById('bobotAwalText');

const nilaiSelect = document.getElementById('matkulNilai');
const customField = document.getElementById('customBobotField');
const customInput = document.getElementById('matkulNilaiCustom');

const themeToggleEl = document.getElementById('themeToggle');
const themeIconEl = document.getElementById('themeIcon');

ipkAwalEl.value = localStorage.getItem('ipkAwal') || '';
sksAwalEl.value = localStorage.getItem('sksAwal') || '';
try {
  matkulList = JSON.parse(localStorage.getItem('matkulList')) || [];
} catch (e) {
  matkulList = [];
}

function saveData() {
  localStorage.setItem('ipkAwal', ipkAwalEl.value);
  localStorage.setItem('sksAwal', sksAwalEl.value);
  localStorage.setItem('matkulList', JSON.stringify(matkulList));
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    themeIconEl.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
  } else {
    document.body.classList.remove('light-theme');
    themeIconEl.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
  }
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

themeToggleEl.addEventListener('click', () => {
  const currentTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
  applyTheme(currentTheme);
});

nilaiSelect.addEventListener('change', () => {
  customField.style.display = nilaiSelect.value === 'custom' ? 'flex' : 'none';
});

document.getElementById('addBtn').addEventListener('click', () => {
  const nama = document.getElementById('matkulNama').value.trim() || 'Mata Kuliah';
  const sks = parseFloat(document.getElementById('matkulSks').value);
  let bobot;
  if (nilaiSelect.value === 'custom') {
    bobot = parseFloat(customInput.value);
  } else {
    bobot = parseFloat(nilaiSelect.value);
  }

  if (isNaN(sks) || sks <= 0) { alert('Masukkan jumlah SKS yang valid (lebih dari 0).'); return; }
  if (isNaN(bobot) || bobot < 0 || bobot > 4) { alert('Pilih nilai huruf atau masukkan bobot custom yang valid (0 - 4).'); return; }

  matkulList.push({ nama, sks, bobot });
  document.getElementById('matkulNama').value = '';
  document.getElementById('matkulSks').value = '';
  nilaiSelect.value = '';
  customInput.value = '';
  customField.style.display = 'none';
  saveData();
  render();
});

function hapusMatkul(index) {
  matkulList.splice(index, 1);
  saveData();
  render();
}

function gradeLabel(bobot) {
  const map = [
    [4, 'A'], [3.5, 'AB'], [3, 'B'],
    [2.5, 'BC'], [2, 'C'], [1, 'D'], [0, 'E']
  ];
  const found = map.find(([v]) => Math.abs(v - bobot) < 0.001);
  return found ? found[1] : bobot.toFixed(2);
}

function render() {
  const body = document.getElementById('matkulBody');
  const emptyNote = document.getElementById('emptyNote');
  body.innerHTML = '';

  if (matkulList.length === 0) {
    emptyNote.style.display = 'block';
  } else {
    emptyNote.style.display = 'none';
    matkulList.forEach((m, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${m.nama}</td>
        <td class="num">${m.sks}</td>
        <td class="num">${gradeLabel(m.bobot)} (${m.bobot.toFixed(2)})</td>
        <td class="num">${(m.sks * m.bobot).toFixed(2)}</td>
        <td><button class="del-btn" onclick="hapusMatkul(${i})">Hapus</button></td>
      `;
      body.appendChild(tr);
    });
  }

  hitung();
}

function hitung() {
  const ipkAwal = parseFloat(ipkAwalEl.value) || 0;
  const sksAwal = parseFloat(sksAwalEl.value) || 0;
  const bobotAwal = ipkAwal * sksAwal;

  bobotAwalText.textContent = bobotAwal.toFixed(2);

  let sksBaru = 0;
  let bobotBaru = 0;
  matkulList.forEach(m => {
    sksBaru += m.sks;
    bobotBaru += m.sks * m.bobot;
  });

  const ips = sksBaru > 0 ? (bobotBaru / sksBaru) : 0;

  const sksTotal = sksAwal + sksBaru;
  const bobotTotal = bobotAwal + bobotBaru;
  const ipkKumulatif = sksTotal > 0 ? (bobotTotal / sksTotal) : 0;

  document.getElementById('sksBaruTotal').textContent = sksBaru;
  document.getElementById('ipsSemester').textContent = ips.toFixed(3);
  document.getElementById('sksKumulatif').textContent = sksTotal;
  document.getElementById('ipkKumulatif').textContent = ipkKumulatif.toFixed(3);
}

ipkAwalEl.addEventListener('input', () => {
  saveData();
  hitung();
});
sksAwalEl.addEventListener('input', () => {
  saveData();
  hitung();
});

window.hapusMatkul = hapusMatkul;

render();
