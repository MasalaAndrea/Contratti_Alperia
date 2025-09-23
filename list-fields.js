const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

(async () => {
  try {
    const pdfPath = path.join(__dirname, 'A-0009-C-0524_PDA_CG_Business.pdf');
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const form = pdfDoc.getForm();
    const fields = form.getFields();

    if (fields.length === 0) {
      console.log("⚠️ Nessun campo modulo rilevato nel PDF!");
    } else {
      console.log("Campi modulo trovati nel PDF:");
      fields.forEach(f => {
        const type = f.constructor.name;
        const name = f.getName();
        console.log(`- ${name} (${type})`);
      });
    }
  } catch (err) {
    console.error("Errore durante la scansione del PDF:", err);
  }
})();