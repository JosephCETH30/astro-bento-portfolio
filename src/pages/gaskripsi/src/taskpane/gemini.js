// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyDb8tmBQTX0a2YrCj_3xBoErBxnQiBhyIo';
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Gemini API Client
class GeminiClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async generateContent(prompt) {
        try {
            const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response format from API');
            }
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw error;
        }
    }

    async paraphraseText(text) {
        const prompt = `Parafrase teks berikut dengan gaya akademis yang formal dan profesional, pertahankan makna aslinya. Berikan hasil dalam bahasa Indonesia: ${text}`;
        return this.generateContent(prompt);
    }

    async improveText(text) {
        const prompt = `Perbaiki dan tingkatkan kualitas teks berikut untuk skripsi akademis, fokus pada kejelasan, formalitas, dan profesionalisme. Berikan hasil dalam bahasa Indonesia: ${text}`;
        return this.generateContent(prompt);
    }

    async askQuestion(question) {
        const prompt = `Jawab pertanyaan berikut dengan gaya akademis yang formal dan profesional. Berikan jawaban dalam bahasa Indonesia: ${question}`;
        return this.generateContent(prompt);
    }
}

// Initialize Gemini client
const geminiClient = new GeminiClient(GEMINI_API_KEY);

// Export functions for use in taskpane.html
window.askAI = async function() {
    const input = document.getElementById('aiInput');
    const button = document.querySelector('.ms-ai-button');
    const responseContainer = document.getElementById('aiResponse');
    const responseContent = document.getElementById('aiResponseContent');
    const originalText = button.innerHTML;
    
    if (!input.value.trim()) {
        showNotification('Mohon masukkan pertanyaan atau teks', 'error');
        return;
    }

    try {
        // Show loading state
        button.innerHTML = '<i class="ms-Icon ms-Icon--Sync"></i>';
        button.disabled = true;
        responseContainer.classList.add('loading');
        responseContainer.classList.add('visible');
        responseContent.innerHTML = '';
        
        const response = await geminiClient.askQuestion(input.value);
        
        // Display response
        responseContainer.classList.remove('loading');
        responseContent.innerHTML = formatResponse(response);
        
        showNotification('Jawaban berhasil ditampilkan', 'success');
        input.value = ''; // Clear input
    } catch (error) {
        responseContainer.classList.remove('loading');
        responseContent.innerHTML = '<p class="ms-ai-error">Terjadi kesalahan saat memproses permintaan. Silakan coba lagi.</p>';
        showNotification('Terjadi kesalahan saat memproses permintaan', 'error');
        console.error('Error:', error);
    } finally {
        // Reset button state
        button.innerHTML = originalText;
        button.disabled = false;
    }
};

window.paraphraseText = async function() {
    const responseContainer = document.getElementById('aiResponse');
    const responseContent = document.getElementById('aiResponseContent');
    
    try {
        const selection = await Office.context.document.getSelectedDataAsync(Office.CoercionType.Text);
        if (selection.status === Office.AsyncResultStatus.Succeeded) {
            responseContainer.classList.add('loading');
            responseContainer.classList.add('visible');
            responseContent.innerHTML = '';
            
            const paraphrasedText = await geminiClient.paraphraseText(selection.value);
            
            responseContainer.classList.remove('loading');
            responseContent.innerHTML = formatResponse(paraphrasedText);
            showNotification('Teks berhasil diparafrase', 'success');
        }
    } catch (error) {
        responseContainer.classList.remove('loading');
        responseContent.innerHTML = '<p class="ms-ai-error">Terjadi kesalahan saat memparafrase teks. Silakan coba lagi.</p>';
        showNotification('Terjadi kesalahan saat memparafrase teks', 'error');
        console.error('Error:', error);
    }
};

window.improveText = async function() {
    const responseContainer = document.getElementById('aiResponse');
    const responseContent = document.getElementById('aiResponseContent');
    
    try {
        const selection = await Office.context.document.getSelectedDataAsync(Office.CoercionType.Text);
        if (selection.status === Office.AsyncResultStatus.Succeeded) {
            responseContainer.classList.add('loading');
            responseContainer.classList.add('visible');
            responseContent.innerHTML = '';
            
            const improvedText = await geminiClient.improveText(selection.value);
            
            responseContainer.classList.remove('loading');
            responseContent.innerHTML = formatResponse(improvedText);
            showNotification('Teks berhasil ditingkatkan', 'success');
        }
    } catch (error) {
        responseContainer.classList.remove('loading');
        responseContent.innerHTML = '<p class="ms-ai-error">Terjadi kesalahan saat meningkatkan teks. Silakan coba lagi.</p>';
        showNotification('Terjadi kesalahan saat meningkatkan teks', 'error');
        console.error('Error:', error);
    }
};

// Helper function to format response
function formatResponse(text) {
    // Split text into paragraphs
    const paragraphs = text.split('\n\n');
    
    // Format each paragraph
    return paragraphs.map(paragraph => {
        if (paragraph.trim()) {
            return `<p>${paragraph}</p>`;
        }
        return '';
    }).join('');
}

// Copy response to clipboard
window.copyResponse = async function() {
    const responseContent = document.getElementById('aiResponseContent');
    const text = responseContent.innerText;
    
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Jawaban berhasil disalin', 'success');
    } catch (error) {
        showNotification('Gagal menyalin jawaban', 'error');
        console.error('Error:', error);
    }
};

// Notification helper function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `ms-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 