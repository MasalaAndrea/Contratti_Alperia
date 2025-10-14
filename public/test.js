// Assicurati che PDFLib sia già caricato nella pagina (tramite <script src="...pdf-lib.min.js"></script>)
const { PDFDocument } = window.PDFLib;
const url = "public/test.pdf"; // Percorso del tuo PDF di test
fetch(url)
  .then(res => res.arrayBuffer())
  .then(async (bytes) => {
    const pdfDoc = await PDFDocument.load(bytes);
    const form = pdfDoc.getForm();
    form.getTextField("Agente").setText("COPILOT TEST");
    // Debug: stampa tutti i campi testo e il loro valore
    form.getFields().forEach(f => {
      if (f.constructor.name === "PDFTextField") {
        console.log('Campo:', f.getName(), '=>', f.getText());
      }
    });
    const newBytes = await pdfDoc.save();
    const blob = new Blob([newBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "test_output.pdf";
    link.click();
  });