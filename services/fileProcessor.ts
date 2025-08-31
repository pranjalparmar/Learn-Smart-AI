// Note: All parsing libraries are imported dynamically within their respective functions 
// to prevent app load failures if a CDN is unavailable.

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
    const pdfjs = await import('pdfjs-dist');
    
    // Set worker source only when needed, and only once.
    if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }

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

async function extractTextFromDocx(file: File): Promise<string> {
    const mammoth = await import('mammoth-browser');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

async function extractTextFromPptx(file: File): Promise<string> {
    const Pptx2js = await import('pptx2js');
    
    // The UMD module's constructor is often the default export, which we access from the namespace.
    const PptxParser = (Pptx2js as any).default || Pptx2js;
    const pptx = new PptxParser();
    const result = await pptx.parse(file);
    let fullText = '';
    
    if (result && result.slides) {
        result.slides.forEach(slide => {
            if (slide.shapes) {
                slide.shapes.forEach(shape => {
                    if (shape.text) {
                        fullText += shape.text + '\n';
                    }
                });
            }
        });
    }
    return fullText;
}

export async function extractText(file: File): Promise<string> {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return extractTextFromPdf(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return extractTextFromTxt(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
        return extractTextFromDocx(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileName.endsWith('.pptx')) {
        return extractTextFromPptx(file);
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.ppt')) {
        throw new Error(`Unsupported legacy file format (${fileName.split('.').pop()}). Please convert it to .docx or .pptx for best results.`);
    } else {
        throw new Error(`Unsupported file type: ${file.name}. Please upload a PDF, TXT, DOCX, or PPTX file.`);
    }
}