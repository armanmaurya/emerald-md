import html2pdf from 'html2pdf.js';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { openPath } from '@tauri-apps/plugin-opener';

export interface PDFExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  image?: { type: 'jpeg' | 'png' | 'webp'; quality: number };
  html2canvas?: { scale: number; useCORS: boolean };
  jsPDF?: { unit: string; format: string; orientation: 'portrait' | 'landscape' };
}

/**
 * Export HTML content to PDF using Tauri's native save dialog
 * @param htmlContent - The HTML string to export
 * @param options - PDF export options
 * @returns The file path if saved, null if canceled
 */
export const exportToPDF = async (
  htmlContent: string,
  options: PDFExportOptions = {}
): Promise<string | null> => {
  try {
    // Create a temporary container for the content
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    
    // Apply styling to match the editor's appearance exactly
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    container.style.fontSize = '16px';
    container.style.lineHeight = '1.6';
    container.style.color = '#1f1f1f';
    container.style.padding = '12px';
    container.style.backgroundColor = '#ffffff';

    // Apply exact editor styling from App.css
    const style = document.createElement('style');
    style.textContent = `
      /* Paragraphs - compact like editor */
      p { margin-top: 0.4em; margin-bottom: 0.4em; line-height: 1.6; }
      
      /* Headings - compact, editor-friendly */
      h1 { font-size: 2.25em; font-weight: 800; margin-top: 0.3em; margin-bottom: 0.2em; line-height: 1.1111111; }
      h2 { font-size: 1.5em; font-weight: 700; margin-top: 0.25em; margin-bottom: 0.1em; line-height: 1.3333333; }
      h3 { font-size: 1.25rem; font-weight: 600; margin-top: 0.2em; margin-bottom: 0.1em; line-height: 1.35; }
      h4, h5, h6 { font-weight: 600; margin-top: 0.15em; margin-bottom: 0.08em; line-height: 1.5; }
      
      /* Lists */
      ul, ol { padding-left: 1.625em; line-height: 1.6; }
      
      /* Task Lists */
      ul[data-type="taskList"] { list-style: none; padding: 0; line-height: 1.6; }
      ul[data-type="taskList"] li { display: flex; align-items: center; line-height: 1.6; }
      ul[data-type="taskList"] li div { padding-right: 8px; padding-left: 8px; line-height: 1.6; }
      li[data-checked="true"] > div { text-decoration: line-through; opacity: 0.6; line-height: 1.6; }
      
      /* Blockquote */
      blockquote { font-style: italic; border-left: 0.25rem solid #e5e7eb; padding-left: 1em; line-height: 1.6; }
      
      /* Code */
      code { background-color: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25rem; font-size: 0.875em; font-family: 'Courier New', monospace; line-height: 1.5; }
      pre { background-color: #f3f4f6; padding: 1em; border-radius: 0.375rem; overflow-x: auto; line-height: 1.5; }
      pre code { background-color: transparent; padding: 0; font-size: 0.875em; line-height: 1.5; }
      
      /* Links */
      a { color: #2563eb; text-decoration: underline; line-height: 1.6; }
      
      /* Text styles */
      strong { font-weight: 600; line-height: 1.6; }
      em { font-style: italic; line-height: 1.6; }
      
      /* Images */
      img { max-width: 100%; height: auto; margin-top: 1rem; margin-bottom: 1rem; line-height: 1.6; }
      
      /* Tables */
      table { width: 100%; border-collapse: collapse; line-height: 1.6; }
      th { font-weight: 600; border-bottom: 1px solid #e5e7eb; padding: 0.5714286em; text-align: left; line-height: 1.6; }
      td { border-bottom: 1px solid #e5e7eb; padding: 0.5714286em; line-height: 1.6; }
      
      /* HR */
      hr { border: 0; border-top: 1px solid #e5e7eb; margin-top: 1rem; margin-bottom: 1rem; line-height: 1.6; }
      
      /* Checkboxes */
      input[type="checkbox"] { margin-right: 0.5em; margin-top: 0.3em; line-height: 1.6; }
    `;
    container.appendChild(style);

    // Default options
    const defaultOptions = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    // Merge with user options
    const mergedOptions = {
      margin: options.margin || defaultOptions.margin,
      image: { ...defaultOptions.image, ...options.image },
      html2canvas: { ...defaultOptions.html2canvas, ...options.html2canvas },
      jsPDF: { ...defaultOptions.jsPDF, ...options.jsPDF }
    };

    // Create PDF worker and get ArrayBuffer
    const worker = html2pdf()
      .set(mergedOptions)
      .from(container)
      .toPdf();

    // Get the PDF as an ArrayBuffer
    const pdfBuffer = await worker.output('arraybuffer');

    // Open the Native Save Dialog
    const filePath = await save({
      title: 'Export PDF',
      defaultPath: options.filename || 'document.pdf',
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    // Write file only if user didn't cancel
    if (filePath) {
      await writeFile(filePath, new Uint8Array(pdfBuffer));
      
      // Open the PDF file
      await openPath(filePath);
    }
    
    // Cleanup - remove from DOM
    document.body.removeChild(container);
    
    return filePath;
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw new Error('Failed to export PDF. Please try again.');
  }
};

/**
 * Export markdown content directly to PDF
 * Note: This is a placeholder - use exportToPDF with HTML content instead
 */
export const exportMarkdownToPDF = async (
  _markdown: string,
  _options: PDFExportOptions = {}
): Promise<void> => {
  throw new Error('Use exportToPDF with HTML content instead');
};
