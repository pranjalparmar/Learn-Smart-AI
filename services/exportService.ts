import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Flashcard, QA } from '../types';

type StudyItem = (Flashcard | QA) & { type: string };

const triggerDownload = (uri: string, filename: string) => {
    const link = document.createElement('a');
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// This function is for VISUAL components like the progress chart.
// It is INTENTIONALLY image-based. DO NOT use for text-based exports.
export const exportToPDF = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        return;
    }

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
};


// --- PDF Export Configuration ---
const FONT_SIZES = {
    TITLE: 18,
    H1: 16,
    H2: 12,
    BODY: 10,
};
const LINE_HEIGHT_FACTOR = 1.5;
const MARGIN = 15; // mm
const FONT = 'helvetica';

const addPageIfNeeded = (doc: jsPDF, y: number, requiredHeight: number): number => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + requiredHeight > pageHeight - MARGIN) {
        doc.addPage();
        return MARGIN;
    }
    return y;
};

/**
 * Renders a single styled card for a flashcard or Q&A item.
 * This function draws a card with a shadow, border, and color-coded sections for the question and answer.
 * @returns The new Y-coordinate for the next element.
 */
const renderStyledCard = (doc: jsPDF, currentY: number, options: {
    item: Flashcard | QA;
    questionHeader: string;
    pageWidth: number;
}): number => {
    // --- Layout & Color Constants ---
    const USABLE_WIDTH = options.pageWidth - MARGIN * 2;
    const CARD_PADDING = 5;
    const INTERNAL_PADDING = 4;
    const HEADER_TO_BODY_SPACING = 4; // Increased vertical space between header and body text to prevent overlap.
    const CORNER_RADIUS = 3;
    const SHADOW_OFFSET = 1.5;
    const SHADOW_COLOR = '#E0E0E0';
    const BORDER_COLOR = '#BDBDBD';
    const QUESTION_BG_COLOR = '#E3F2FD'; // Pale Blue
    const ANSWER_BG_COLOR = '#E8F5E9';   // Pale Green
    const QUESTION_HEADER_COLOR = '#1565C0'; // Darker Blue
    const ANSWER_HEADER_COLOR = '#2E7D32'; // Darker Green
    const BODY_TEXT_COLOR = '#212121';

    let y = currentY;

    // --- Calculate dynamic heights based on text content ---
    const availableTextWidth = USABLE_WIDTH - (CARD_PADDING * 2) - (INTERNAL_PADDING * 2);
    
    // --- Calculate Question box height ---
    doc.setFont(FONT, 'bold');
    doc.setFontSize(FONT_SIZES.H2);
    const qHeaderHeight = doc.getTextDimensions(options.questionHeader).h;
    
    doc.setFont(FONT, 'normal');
    doc.setFontSize(FONT_SIZES.BODY);
    const qBodyLines = doc.splitTextToSize(options.item.question, availableTextWidth);
    const fontSizeInMM = doc.getFontSize() / doc.internal.scaleFactor;
    // Accurately calculate the rendered height of the body text block
    const qBodyHeight = qBodyLines.length > 0 
        ? fontSizeInMM * (qBodyLines.length * LINE_HEIGHT_FACTOR - LINE_HEIGHT_FACTOR + 1.15)
        : 0;
    const questionBoxHeight = qHeaderHeight + HEADER_TO_BODY_SPACING + qBodyHeight + (INTERNAL_PADDING * 2);

    // --- Calculate Answer box height ---
    doc.setFont(FONT, 'bold');
    doc.setFontSize(FONT_SIZES.H2);
    const aHeaderHeight = doc.getTextDimensions('A').h;
    
    doc.setFont(FONT, 'normal');
    doc.setFontSize(FONT_SIZES.BODY);
    const aBodyLines = doc.splitTextToSize(options.item.answer, availableTextWidth);
    const aBodyHeight = aBodyLines.length > 0
        ? fontSizeInMM * (aBodyLines.length * LINE_HEIGHT_FACTOR - LINE_HEIGHT_FACTOR + 1.15)
        : 0;
    const answerBoxHeight = aHeaderHeight + HEADER_TO_BODY_SPACING + aBodyHeight + (INTERNAL_PADDING * 2);
    
    const totalCardHeight = questionBoxHeight + answerBoxHeight + (CARD_PADDING * 2) + CARD_PADDING; // Space between boxes

    // --- Add a new page if the card won't fit ---
    y = addPageIfNeeded(doc, y, totalCardHeight + SHADOW_OFFSET);

    // --- Render Card Elements ---
    // 1. Shadow
    doc.setFillColor(SHADOW_COLOR);
    doc.roundedRect(MARGIN + SHADOW_OFFSET, y + SHADOW_OFFSET, USABLE_WIDTH, totalCardHeight, CORNER_RADIUS, CORNER_RADIUS, 'F');
    
    // 2. Main card border and white background
    doc.setDrawColor(BORDER_COLOR);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(MARGIN, y, USABLE_WIDTH, totalCardHeight, CORNER_RADIUS, CORNER_RADIUS, 'FD');

    let internalY = y + CARD_PADDING;
    const internalX = MARGIN + CARD_PADDING;
    const internalWidth = USABLE_WIDTH - CARD_PADDING * 2;

    // 3. Question Box (Pale Blue)
    doc.setFillColor(QUESTION_BG_COLOR);
    doc.roundedRect(internalX, internalY, internalWidth, questionBoxHeight, CORNER_RADIUS, CORNER_RADIUS, 'F');
    
    // Position header baseline
    let textY = internalY + INTERNAL_PADDING + qHeaderHeight;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(FONT_SIZES.H2);
    doc.setTextColor(QUESTION_HEADER_COLOR);
    doc.text(options.questionHeader, internalX + INTERNAL_PADDING, textY);
    
    // Position body text baseline, spaced down from header baseline
    textY += HEADER_TO_BODY_SPACING;
    doc.setFont(FONT, 'normal');
    doc.setFontSize(FONT_SIZES.BODY);
    doc.setTextColor(BODY_TEXT_COLOR);
    doc.text(qBodyLines, internalX + INTERNAL_PADDING, textY, { lineHeightFactor: LINE_HEIGHT_FACTOR, align: 'left' });

    // 4. Answer Box (Pale Green)
    internalY += questionBoxHeight + CARD_PADDING;
    doc.setFillColor(ANSWER_BG_COLOR);
    doc.roundedRect(internalX, internalY, internalWidth, answerBoxHeight, CORNER_RADIUS, CORNER_RADIUS, 'F');

    // Position header baseline
    textY = internalY + INTERNAL_PADDING + aHeaderHeight;
    doc.setFont(FONT, 'bold');
    doc.setFontSize(FONT_SIZES.H2);
    doc.setTextColor(ANSWER_HEADER_COLOR);
    doc.text('Answer:', internalX + INTERNAL_PADDING, textY);
    
    // Position body text baseline, spaced down from header baseline
    textY += HEADER_TO_BODY_SPACING;
    doc.setFont(FONT, 'normal');
    doc.setFontSize(FONT_SIZES.BODY);
    doc.setTextColor(BODY_TEXT_COLOR);
    doc.text(aBodyLines, internalX + INTERNAL_PADDING, textY, { lineHeightFactor: LINE_HEIGHT_FACTOR, align: 'left' });

    // Return the new Y position for the next card, including spacing
    return y + totalCardHeight + 10;
};


// Generates a clean, card-based PDF for Flashcards.
export const exportFlashcardsToPDF = (flashcards: Flashcard[]) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = MARGIN;

    // --- Title ---
    doc.setFont(FONT, 'bold');
    doc.setFontSize(FONT_SIZES.TITLE);
    doc.text('Learn Smart AI - Flashcards', pageWidth / 2, y, { align: 'center' });
    y += 15;

    flashcards.forEach((card) => {
        y = renderStyledCard(doc, y, {
            item: card,
            questionHeader: 'Question:',
            pageWidth: pageWidth,
        });
    });

    doc.save('LearnSmart-Flashcards.pdf');
};


// Generates a clean, card-based PDF for Q&A, grouped by type.
export const exportQAToPDF = (knowledgeQA: QA[], scenarioQA: QA[]) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = MARGIN;

    // --- Title ---
    doc.setFont(FONT, 'bold');
    doc.setFontSize(FONT_SIZES.TITLE);
    doc.text('Learn Smart AI - Q&A', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Helper to render a list of Q&A items under a title
    const renderQAList = (title: string, items: QA[]) => {
        if (items.length === 0) return;

        y = addPageIfNeeded(doc, y, 20); // Space for header
        doc.setFont(FONT, 'bold');
        doc.setFontSize(FONT_SIZES.H1);
        doc.text(title, MARGIN, y);
        y += 12;

        items.forEach((item, index) => {
            y = renderStyledCard(doc, y, {
                item: item,
                questionHeader: `Question ${index + 1}:`,
                pageWidth: pageWidth,
            });
        });
        
        y += 10; // Extra space after the whole section
    };

    // Render both lists
    renderQAList('Knowledge Questions', knowledgeQA);
    
    if (knowledgeQA.length > 0 && scenarioQA.length > 0) {
        y = addPageIfNeeded(doc, y, 15);
        doc.setDrawColor(180, 180, 180);
        doc.line(MARGIN, y - 5, pageWidth - MARGIN, y - 5);
    }
    
    renderQAList('Scenario-Based Questions', scenarioQA);

    doc.save('LearnSmart-QA.pdf');
};


export const exportToImage = async (elementId: string, filename: string) => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        return;
    }
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const dataUrl = canvas.toDataURL('image/png');
    triggerDownload(dataUrl, `${filename}.png`);
};

// Converts an array of objects to a CSV string with robust quote handling.
const convertToCSV = (data: any[], headers: { label: string, key: string }[]): string => {
    const headerRow = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');

    const rows = data.map(row => 
        headers.map(header => {
            const value = row[header.key] || '';
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
        }).join(',')
    );
    return [headerRow, ...rows].join('\n');
};

export const exportFlashcardsToCSV = (flashcards: Flashcard[]) => {
    const csvContent = convertToCSV(flashcards, [
        { label: 'Question', key: 'question' },
        { label: 'Answer', key: 'answer' }
    ]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'LearnSmart-Flashcards.csv');
};

export const exportQAToCSV = (knowledgeQA: QA[], scenarioQA: QA[]) => {
    const data = [
        ...knowledgeQA.map(item => ({ type: 'Knowledge', ...item })),
        ...scenarioQA.map(item => ({ type: 'Scenario', ...item }))
    ];
    const csvContent = convertToCSV(data, [
        { label: 'Type', key: 'type' },
        { label: 'Question', key: 'question' },
        { label: 'Answer', key: 'answer' }
    ]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'LearnSmart-QA.csv');
};

export const exportProgressToCSV = (strongTopics: StudyItem[], weakTopics: StudyItem[]) => {
    const data = [
        ...strongTopics.map(item => ({ classification: 'Strong', ...item})),
        ...weakTopics.map(item => ({ classification: 'Weak', ...item})),
    ];
    const csvContent = convertToCSV(data, [
        { label: 'Classification', key: 'classification' },
        { label: 'Type', key: 'type' },
        { label: 'Question', key: 'question' },
        { label: 'Answer', key: 'answer' }
    ]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    triggerDownload(url, 'LearnSmart-Progress.csv');
}