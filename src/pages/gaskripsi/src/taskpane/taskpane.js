/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office, Word */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
    document.getElementById("run").onclick = run;
  }
});

export async function run() {
  return Word.run(async (context) => {
    /**
     * Insert your Word code here
     */

    // insert a paragraph at the end of the document.
    const paragraph = context.document.body.insertParagraph("Hello World", Word.InsertLocation.end);

    // change the paragraph color to blue.
    paragraph.font.color = "blue";

    await context.sync();
  });
}

// AI Assistant Functions
function initializeAI() {
    const aiInput = document.getElementById('aiInput');
    const askButton = document.getElementById('askButton');
    const paraphraseButton = document.getElementById('paraphraseButton');
    const improveButton = document.getElementById('improveButton');
    const responseContainer = document.querySelector('.ms-ai-response');
    const responseContent = document.querySelector('.ms-ai-response-content');

    // Click to copy functionality
    document.addEventListener('selectionchange', () => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            aiInput.value = selectedText;
            aiInput.focus();
        }
    });

    // Function to handle button click animation
    function animateButton(button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 300);
    }

    // Function to set input value with animation
    function setInputValue(value) {
        aiInput.value = value;
        aiInput.focus();
        aiInput.setSelectionRange(0, value.length);
    }

    // Ask button click handler
    askButton.addEventListener('click', () => {
        const question = aiInput.value.trim();
        if (!question) return;

        animateButton(askButton);
        responseContainer.classList.add('visible', 'loading');
        responseContent.innerHTML = '<div class="ms-ai-loading"><i class="ms-Icon ms-Icon--Sync"></i> Memproses...</div>';

        // Call your AI service here
        // For now, we'll just show a placeholder response
        setTimeout(() => {
            responseContainer.classList.remove('loading');
            responseContent.innerHTML = 'Jawaban akan muncul di sini...';
        }, 1000);
    });

    // Paraphrase button click handler
    paraphraseButton.addEventListener('click', () => {
        const text = aiInput.value.trim();
        if (!text) return;

        animateButton(paraphraseButton);
        const prompt = "Parafrasekan teks akademik berikut dengan gaya bahasa natural seperti tulisan mahasiswa S1 dalam skripsi. Gunakan struktur kalimat bervariasi, kosakata baku namun tidak terlalu kaku, dan hindari pola kalimat yang terlalu mirip dengan aslinya. Pastikan makna tetap utuh, relevan secara konteks ilmiah, dan hasilnya tidak terdeteksi sebagai AI-generated atau plagiat. Gunakan bahasa Indonesia formal akademik tingkat mahasiswa, bukan gaya jurnal ilmiah atau artikel populer.";
        
        setInputValue(prompt + "\n\n" + text);
        askButton.click();
    });

    // Improve button click handler (now for finding journals)
    improveButton.addEventListener('click', () => {
        animateButton(improveButton);
        const prompt = "Carikan [jumlah] jurnal [nasional/internasional, sebutkan database: Scopus/Sinta/IEEE/ScienceDirect/Google Scholar] yang terbit [dalam rentang tahun, misal: 2020–2024], relevan dengan topik \"[topik skripsi kamu]\", fokus pada [fokus pembahasan/metodologi/variabel], lengkap dengan: judul jurnal, nama penulis, tahun terbit, ringkasan isi 2–3 kalimat, dan link DOI atau sumber aslinya.";
        
        setInputValue(prompt);
        askButton.click();
    });

    // Add keyboard shortcut for Enter key
    aiInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            askButton.click();
        }
    });
}

// Initialize when the page loads
Office.onReady(() => {
    initializeAI();
});
