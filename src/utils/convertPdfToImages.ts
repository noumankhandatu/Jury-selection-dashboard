/**
 * Converts a PDF file to an array of base64-encoded PNG images (one per page).
 * Uses PDF.js loaded from CDN.
 */
export async function convertPDFToImages(file: File): Promise<string[]> {
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as ArrayBuffer);
    fr.onerror = () => reject(new Error("Failed to read PDF file"));
    fr.readAsArrayBuffer(file);
  });

  async function runWithPdfJs() {
    const pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const typedArray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjsLib.getDocument(typedArray).promise;
    const images: string[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        const b64 = canvas.toDataURL("image/png").split(",")[1];
        if (b64) images.push(b64);
      }
    }
    return images;
  }

  if ((window as any).pdfjsLib) {
    return runWithPdfJs();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => runWithPdfJs().then(resolve).catch(reject);
    script.onerror = () => reject(new Error("Failed to load PDF.js library"));
    document.head.appendChild(script);
  });
}
