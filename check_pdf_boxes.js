const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const folder = 'C:/Users/andre/Downloads/WebAppPDFGen/public/cte_energia';

async function printPdfBoxes() {
  const files = fs.readdirSync(folder).filter(f => f.toLowerCase().endsWith('.pdf'));

  if (files.length === 0) {
    console.log('Nessun PDF trovato nella cartella:', folder);
    return;
  }

  for (const file of files) {
    const pdfPath = path.join(folder, file);
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const page = pdfDoc.getPage(0); // Se vuoi controllare solo la prima pagina
    const mediaBox = page.node.MediaBox();
    const cropBox = page.node.CropBox ? page.node.CropBox() : mediaBox;

    console.log(`\n${file}:`);
    console.log('  MediaBox:', mediaBox);
    console.log('  CropBox: ', cropBox);
  }
}

printPdfBoxes();