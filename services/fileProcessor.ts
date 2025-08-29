
import * as pdfjs from 'pdfjs-dist';

// Set worker source for pdfjs
// In a real build setup, this would be hosted locally. For this environment, we use a CDN.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

async function extractTextFromTxt(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target?.result as string);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsText(file);
    });
}

async function extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument(arrayBuffer).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
        fullText += pageText + '\n';
    }
    
    return fullText;
}


export async function extractText(file: File): Promise<string> {
    const fileType = file.type;
    
    if (fileType === 'application/pdf') {
        return extractTextFromPdf(file);
    } else if (fileType === 'text/plain') {
        return extractTextFromTxt(file);
    } else {
        throw new Error(`Unsupported file type: ${fileType}. Please upload a PDF or TXT file.`);
    }
}
