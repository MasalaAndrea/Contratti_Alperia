document.addEventListener('DOMContentLoaded', () => {
    // --- Pagina 3: Pagamento e Consensi ---
    const autorizzazioneSddCheckbox = document.getElementById('autorizzazione_sdd');
    const sezioneSdd = document.getElementById('sezione-sdd');
    const paymentForm = document.getElementById('paymentForm');

    // Mostra/nascondi la sezione SDD
    if (autorizzazioneSddCheckbox) {
        autorizzazioneSddCheckbox.addEventListener('change', function() {
            sezioneSdd.style.display = this.checked ? 'block' : 'none';
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', (event) => {
            event.preventDefault();

            // Validazione campi obbligatori
            if (autorizzazioneSddCheckbox.checked) {
                const cognomeNome = document.getElementById('cognome_nome').value;
                const indirizzoDebitore = document.getElementById('indirizzo_debitore').value;
                const cfDebitore = document.getElementById('cf_debitore').value;
                const iban = document.getElementById('iban').value;

                if (!cognomeNome || !indirizzoDebitore || cfDebitore.length !== 16 || iban.length !== 27) {
                    alert('Compila tutti i campi obbligatori della sezione SDD.');
                    return;
                }
            }
            
            // Validazione consenso obbligatorio
            const consensoObbligatorio = document.getElementById('consenso_obbligatorio');
            if (!consensoObbligatorio.checked) {
                alert('Devi accettare il trattamento dei dati personali per generare il PDF.');
                return;
            }

            // Validazione firma
            const canvas = document.getElementById('firma-pad');
            const dataURL = canvas.toDataURL('image/png');
            if (isCanvasBlank(canvas)) {
                alert('La firma è obbligatoria.');
                return;
            }

            // Raccolta dati
            const customerData = JSON.parse(sessionStorage.getItem('customerData'));
            const technicalData = JSON.parse(sessionStorage.getItem('technicalData'));
            const paymentData = {
                autorizzazione_sdd: autorizzazioneSddCheckbox.checked,
                sdd_dati: autorizzazioneSddCheckbox.checked ? {
                    cognome_nome: document.getElementById('cognome_nome').value,
                    indirizzo_debitore: document.getElementById('indirizzo_debitore').value,
                    cf_debitore: document.getElementById('cf_debitore').value,
                    iban: document.getElementById('iban').value
                } : {},
                consenso_obbligatorio: consensoObbligatorio.checked,
                consensi_commerciali: {
                    promozione: document.getElementById('consenso_promozione').checked,
                    profilazione: document.getElementById('consenso_profilazione').checked,
                    terzi: document.getElementById('consenso_terzi').checked,
                },
                dichiarazione_notorieta: Array.from(document.querySelectorAll('input[name="dichiarazione_notorieta"]:checked')).map(cb => cb.value),
                documento_identita: Array.from(document.querySelectorAll('input[name="documento_identita"]:checked')).map(cb => cb.value),
                data_firma: document.getElementById('data_firma').value,
                firma: dataURL
            };

            sessionStorage.setItem('paymentData', JSON.stringify(paymentData));

            // Reindirizza alla pagina di riepilogo
            window.location.href = 'riepilogo.html';
        });
    }
});

// Funzione per controllare se il canvas è vuoto
function isCanvasBlank(canvas) {
  const blank = document.createElement('canvas');
  blank.width = canvas.width;
  blank.height = canvas.height;
  return canvas.toDataURL() === blank.toDataURL();
}