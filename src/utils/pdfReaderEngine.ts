import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
  } catch (e) {
    console.warn('PDF Worker initialization note:', e);
  }
}

export interface PdfDocumentInfo {
  numPages: number;
  title?: string;
  author?: string;
}

class PdfReaderEngine {
  private docCache = new Map<string, pdfjsLib.PDFDocumentProxy>();

  /**
   * Load PDF document by path, URL, or TypedArray
   */
  public async loadPdf(source: string | Uint8Array | ArrayBuffer): Promise<pdfjsLib.PDFDocumentProxy> {
    const cacheKey = typeof source === 'string' ? source : 'buffer_' + source.byteLength;
    if (this.docCache.has(cacheKey)) {
      return this.docCache.get(cacheKey)!;
    }

    const docParams = typeof source === 'string' 
      ? { url: source } 
      : { data: source instanceof Uint8Array ? source : new Uint8Array(source) };

    const loadingTask = pdfjsLib.getDocument(docParams);
    const pdfDoc = await loadingTask.promise;
    this.docCache.set(cacheKey, pdfDoc);
    return pdfDoc;
  }

  /**
   * Render a specific page to an HTML Canvas with high-DPI crisp scaling
   */
  public async renderPageToCanvas(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    scale = 1.5
  ): Promise<{ width: number; height: number }> {
    if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
      throw new Error(`Page ${pageNumber} out of range (1 - ${pdfDoc.numPages})`);
    }

    const page = await pdfDoc.getPage(pageNumber);
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const viewport = page.getViewport({ scale: scale * dpr });

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Could not obtain 2D rendering context from canvas');
    }

    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    canvas.style.width = `${Math.floor(viewport.width / dpr)}px`;
    canvas.style.height = `${Math.floor(viewport.height / dpr)}px`;

    const renderParameters: any = {
      canvasContext: context,
      viewport,
      canvas,
      intent: 'display',
    };

    await page.render(renderParameters).promise;
    return { width: viewport.width / dpr, height: viewport.height / dpr };
  }

  /**
   * Extract text content from a page (for searching or custom typography)
   */
  public async extractPageText(pdfDoc: pdfjsLib.PDFDocumentProxy, pageNumber: number): Promise<string> {
    try {
      const page = await pdfDoc.getPage(pageNumber);
      const textContent = await page.getTextContent();
      return textContent.items
        .map((item: any) => (item.str ? item.str : ''))
        .join(' ')
        .trim();
    } catch {
      return '';
    }
  }

  /**
   * Automatically render and extract Page 1 of a PDF as a crisp Base64 PNG image (Auto Cover Matching)
   */
  public async extractCoverImageFromPdf(
    source: string | Uint8Array | ArrayBuffer,
    scale = 1.6
  ): Promise<{ coverBase64: string; numPages: number; title?: string; author?: string }> {
    const pdfDoc = await this.loadPdf(source);
    const page = await pdfDoc.getPage(1);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Canvas 2D context error');
    }

    const renderParameters: any = {
      canvasContext: context,
      viewport,
      canvas,
      intent: 'display',
    };

    await page.render(renderParameters).promise;
    const coverBase64 = canvas.toDataURL('image/png', 0.95);

    let title: string | undefined;
    let author: string | undefined;
    try {
      const meta = await pdfDoc.getMetadata();
      if (meta && meta.info) {
        const infoObj = meta.info as any;
        if (infoObj.Title && typeof infoObj.Title === 'string' && infoObj.Title.trim()) {
          title = infoObj.Title.trim();
        }
        if (infoObj.Author && typeof infoObj.Author === 'string' && infoObj.Author.trim()) {
          author = infoObj.Author.trim();
        }
      }
    } catch {
      // ignore metadata errors
    }

    return {
      coverBase64,
      numPages: pdfDoc.numPages,
      title,
      author,
    };
  }

  /**
   * Clear cached documents
   */
  public clearCache() {
    this.docCache.clear();
  }
}

export const pdfReaderEngine = new PdfReaderEngine();
