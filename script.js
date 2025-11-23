const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const statusArea = document.getElementById('statusArea');
const fileName = document.getElementById('fileName');
const removeBtn = document.getElementById('removeBtn');
const convertBtn = document.getElementById('convertBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.querySelector('.progress-fill');
const statusText = document.getElementById('statusText');

let currentFile = null;

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
});

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

function handleFile(file) {
    if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
    }
    currentFile = file;
    fileName.textContent = file.name;
    dropZone.style.display = 'none';
    statusArea.style.display = 'block';
    resetStatus();
}

removeBtn.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    dropZone.style.display = 'block';
    statusArea.style.display = 'none';
});

function resetStatus() {
    convertBtn.disabled = false;
    convertBtn.textContent = 'Convert to Word';
    progressBar.style.display = 'none';
    progressFill.style.width = '0%';
    statusText.textContent = '';
}

convertBtn.addEventListener('click', async () => {
    if (!currentFile) return;

    convertBtn.disabled = true;
    convertBtn.textContent = 'Converting...';
    progressBar.style.display = 'block';
    statusText.textContent = 'Uploading and processing...';

    // Simulate progress for better UX
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        if (progress > 90) clearInterval(interval);
        progressFill.style.width = `${progress}%`;
    }, 200);

    const formData = new FormData();
    formData.append('file', currentFile);

    try {
        const response = await fetch('http://localhost:8000/convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Conversion failed');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFile.name.replace('.pdf', '.docx');
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        clearInterval(interval);
        progressFill.style.width = '100%';
        statusText.textContent = 'Conversion complete! Downloading...';
        convertBtn.textContent = 'Converted';

        setTimeout(() => {
            resetStatus();
        }, 3000);

    } catch (error) {
        clearInterval(interval);
        statusText.textContent = 'Error: ' + error.message;
        statusText.style.color = '#ef4444';
        convertBtn.disabled = false;
        convertBtn.textContent = 'Try Again';
    }
});
