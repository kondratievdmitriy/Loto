const rows = 5;
const cols = 5;
const numbers = Array.from({ length: rows * cols }, (_, i) => i + 1);
let table = document.getElementById('lottoTable');
let drawnNumbers = new Set();
let currentAudio = null;
const soundFolder = 'sounds/';  // Папка со звуковыми файлами
const documentFolder = 'documents/';  // Папка с текстовыми документами
let useDocuments = false;

function createTable() {
    let index = 0;
    for (let i = 0; i < rows; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            let td = document.createElement('td');
            td.textContent = numbers[index++];
            td.addEventListener('click', () => {
                if (!td.classList.contains('drawn')) {
                    const number = td.textContent;
                    td.classList.add('drawn');
                    td.textContent = '';
                    if (useDocuments) {
                        loadDocument(number);
                    } else {
                        playMelody(number);
                    }
                }
            });
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

function drawNumber() {
    if (drawnNumbers.size === numbers.length) {
        document.getElementById('drawnNumber').textContent = 'Все числа вытянуты!';
        return;
    }
    let number;
    do {
        number = Math.floor(Math.random() * numbers.length) + 1;
    } while (drawnNumbers.has(number));
    drawnNumbers.add(number);
    document.getElementById('drawnNumber').textContent = `Вытянутое число: ${number}`;
    highlightNumber(number);
    if (useDocuments) {
        loadDocument(number);
    } else {
        playMelody(number);
    }
}

function highlightNumber(number) {
    let cells = table.getElementsByTagName('td');
    for (let cell of cells) {
        if (cell.textContent == number) {
            cell.classList.add('drawn');
            cell.textContent = '';
        }
    }
}

function playMelody(number) {
    if (currentAudio) {
        currentAudio.pause();
    }
    currentAudio = new Audio(`${soundFolder}${number}.mp3`);
    currentAudio.play();
}

function loadDocument(number) {
    if (currentAudio) {
        currentAudio.pause();
    }
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    fetch(`${documentFolder}${number}.txt`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка загрузки документа: ' + response.statusText);
            }
            return response.text();
        })
        .then(data => {
            const formattedData = data.replace(/\n/g, '<br>');
            modalContent.innerHTML += `<p>${formattedData}</p>`;
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        })
        .catch(error => {
            console.error('Ошибка при загрузке документа:', error);
            modalContent.innerHTML += `<p>Ошибка загрузки документа.</p>`;
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        });

    modal.onclick = (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
    document.body.appendChild(modal);
}

function toggleMode() {
    useDocuments = !useDocuments;
    const modeText = useDocuments ? 'Документы' : 'Мелодии';
    alert(`Переключено на режим: ${modeText}`);
}

// Функция для загрузки документов через перетаскивание
function setupFileDrop() {
    const dropArea = document.getElementById('drop-area');

    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        const files = event.dataTransfer.files;
        for (let file of files) {
            if (file.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    const number = extractNumberFromFilename(file.name);
                    if (number) {
                        saveDocumentToLocalStorage(number, content);
                    } else {
                        alert('Имя файла должно содержать число.');
                    }
                };
                reader.readAsText(file);
            } else {
                alert('Пожалуйста, загружайте только текстовые файлы (.txt).');
            }
        }
    });
}

// Извлечение числа из имени файла
function extractNumberFromFilename(filename) {
    const match = filename.match(/(\d+)/);
    return match ? match[0] : null;
}

// Сохранение документа в локальное хранилище
function saveDocumentToLocalStorage(number, content) {
    localStorage.setItem(`document_${number}`, content);
    alert(`Документ ${number} успешно загружен!`);
}

// Загрузка документа из локального хранилища
function loadDocument(number) {
    if (currentAudio) {
        currentAudio.pause();
    }
    const modal = document.createElement('div');
    modal.classList.add('modal');
    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');

    const content = localStorage.getItem(`document_${number}`);
    if (content) {
        const formattedData = content.replace(/\n/g, '<br>');
        modalContent.innerHTML += `<p>${formattedData}</p>`;
    } else {
        modalContent.innerHTML += `<p>Документ не найден.</p>`;
    }
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    modal.onclick = (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    };
    document.body.appendChild(modal);
}

// Очистка локального хранилища
function clearLocalStorage() {
    localStorage.clear();
    alert('Локальное хранилище очищено!');
}

window.onload = () => {
    createTable();
    setupFileDrop();  // Настраиваем область перетаскивания
};
