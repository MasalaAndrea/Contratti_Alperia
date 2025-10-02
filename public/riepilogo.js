document.addEventListener('DOMContentLoaded', async () => {
    // Nuovi container per le card
    const cardCliente = document.getElementById('riepilogo-card-cliente');
    const cardTecnici = document.getElementById('riepilogo-card-tecnici');
    const cardConsensi = document.getElementById('riepilogo-card-consensi');
    const generaPdfBtn = document.getElementById('genera-pdf-btn');
    const avvisoDocumenti = document.getElementById('avviso-documenti');
    const avvisoOkBtn = document.getElementById('avviso-ok-btn');
    // Pulsante condividi PDF
    const condividiPdfBtn = document.getElementById('condividi-pdf-btn');
    const condividiPdfMsg = document.getElementById('condividi-pdf-msg');
    // Variabile globale per il PDF generato
    let pdfBlob = null;

    const customerData = JSON.parse(sessionStorage.getItem('customerData'));
    const technicalData = JSON.parse(sessionStorage.getItem('technicalData'));
    const paymentData = JSON.parse(sessionStorage.getItem('paymentData'));

    function formattaData(data) {
        if (!data) return '';
        const parti = data.split(/[-\/]/);
        if (parti.length === 3) {
            return `${parti[2]}/${parti[1]}/${parti[0]}`;
        }
        return data;
    }

    function campo(nome, valore) {
        return `
            <div class="riepilogo-campo">
                <span class="campo-nome">${nome}</span>
                <span class="campo-valore">${valore}</span>
            </div>
        `;
    }
    function titoloCard(testo) {
        return `<div class="card-title">${testo}</div>`;
    }

    // Funzione per ottenere il nome offerta dal codice offerta e dalla categoria, dal file offerte
    async function getNomeOfferta(codiceOfferta, categoria) {
        try {
            const offerte = await fetch('/offerte_residenziali.json').then(r => r.json());
            const trovato = offerte.find(o =>
                (o.codice_offerta === codiceOfferta || o.Codice === codiceOfferta) &&
                ((o.categoria && o.categoria.toLowerCase() === categoria) ||
                 (o.Categoria && o.Categoria.toLowerCase() === categoria))
            );
            return trovato ? (trovato.nome_offerta || trovato['Nome Offerta'] || '') : '';
        } catch {
            return '';
        }
    }

    // --- CARD DATI CLIENTE ---
    function renderCardCliente() {
        if (!cardCliente) return;
        let html = titoloCard('Dati Cliente');
        if (customerData) {
            html += campo('Cognome:', customerData.cognome || '');
            html += campo('Nome:', customerData.nome || '');
            html += campo('Codice Fiscale:', customerData.cf || '');
            html += campo('Indirizzo Residenza:', `${customerData.indirizzo_residenza || ''}, ${customerData.n_residenza || ''}, ${customerData.cap_residenza || ''}, ${customerData.comune_residenza || ''}, ${customerData.provincia_residenza || ''}`);
            html += campo('Cellulare:', customerData.cellulare || '');
            html += campo('Mail:', customerData.mail || '');
            html += campo('Residente presso la fornitura:', customerData.residente_fornitura === 'si' ? 'SI' : 'NO');
            if (customerData.fornitura_diversa) {
                html += campo('Indirizzo Fornitura:', `${customerData.indirizzo_fornitura || ''}, ${customerData.n_fornitura || ''}, ${customerData.cap_fornitura || ''}, ${customerData.comune_fornitura || ''}, ${customerData.provincia_fornitura || ''}`);
            }
        }
        cardCliente.innerHTML = html;
    }

    // --- CARD DATI TECNICI ---
    async function renderCardTecnici() {
    if (!cardTecnici) return;
    let html = titoloCard('Dati Tecnici di Fornitura');
    if (technicalData) {
        if (technicalData.richiesta_elettrica && technicalData.dati_elettrici) {
            const nomeOffertaEE = await getNomeOfferta(technicalData.dati_elettrici.codice_offerta, "energia");
            html += `<div style="margin-bottom: 12px; font-weight:bold; color:#115890;">Energia Elettrica</div>`;
            const officialOptions = ['switch', 'subentro', 'voltura', 'nuova_attivazione'];
            let tipoRichiestaEE = technicalData.dati_elettrici.tipo_richiesta || '';
            if (!officialOptions.includes(tipoRichiestaEE)) {
                tipoRichiestaEE = "Nessuna selezione";
            }
            // MODIFICA: visualizza sempre il valore normalizzato (virgola > punto)
            let potenzaImpegnata = technicalData.dati_elettrici.potenza_impegnata || '';
            potenzaImpegnata = typeof potenzaImpegnata === "string" ? potenzaImpegnata.replace(',', '.') : potenzaImpegnata;
            html += campo('Tipo Richiesta:', tipoRichiestaEE);
            html += campo('Data Attivazione:', formattaData(technicalData.dati_elettrici.data_attivazione) || '');
            html += campo('Codice POD:', [technicalData.dati_elettrici.codice_pod_1, technicalData.dati_elettrici.codice_pod_2].filter(Boolean).join(' ') || '');
            html += campo('Fornitore Uscente:', technicalData.dati_elettrici.fornitore_uscente || '');
            html += campo('Consumo annuo (kWh):', technicalData.dati_elettrici.consumo_annuo_kwh || '');
            html += campo('Potenza Impegnata (kW):', potenzaImpegnata);
            html += campo('Tipologia Uso:', technicalData.dati_elettrici.tipologia_uso || '');
            html += campo('Nome Offerta:', nomeOffertaEE || technicalData.dati_elettrici.nome_offerta || '');
            html += campo('Codice Offerta:', technicalData.dati_elettrici.codice_offerta || '');
        }
        if (technicalData.richiesta_gas && technicalData.dati_gas) {
            const nomeOffertaGas = await getNomeOfferta(technicalData.dati_gas.codice_offerta, "gas");
            html += `<div style="margin-bottom: 12px; font-weight:bold; color:#c45a13;">Gas Naturale</div>`;
            const officialOptions = ['switch', 'subentro', 'voltura', 'nuova_attivazione'];
            let tipoRichiestaGas = technicalData.dati_gas.tipo_richiesta || '';
            if (!officialOptions.includes(tipoRichiestaGas)) {
                tipoRichiestaGas = "Nessuna selezione";
            }
            html += campo('Tipo Richiesta:', tipoRichiestaGas);
            html += campo('Data Attivazione:', formattaData(technicalData.dati_gas.data_attivazione) || '');
            html += campo('Codice PDR:', technicalData.dati_gas.codice_pdr || '');
            html += campo('Fornitore Uscente:', technicalData.dati_gas.fornitore_uscente || '');
            html += campo('Consumo annuo (smc):', technicalData.dati_gas.consumo_annuo_smc || '');
            html += campo('REMI:', technicalData.dati_gas.remi || '');
            html += campo('Categoria Uso:', (technicalData.dati_gas.categoria_uso && technicalData.dati_gas.categoria_uso.join(', ')) || '');
            html += campo('Nome Offerta:', nomeOffertaGas || technicalData.dati_gas.nome_offerta || '');
            html += campo('Codice Offerta:', technicalData.dati_gas.codice_offerta || '');
        }
    }
    cardTecnici.innerHTML = html;
}

    // --- CARD PAGAMENTO E CONSENSI ---
    function renderCardConsensi() {
        if (!cardConsensi) return;
        let html = titoloCard('Pagamento e Consensi');
        if (paymentData) {
            if (paymentData.autorizzazione_sdd) {
                html += `<div style="color:#c45a13; font-weight:500; margin-bottom:8px;">Autorizzazione Addebito Diretto (SDD)</div>`;
                html += campo('Cognome e Nome debitore:', paymentData.sdd_dati?.cognome_nome || '');
                html += campo('Indirizzo debitore:', paymentData.sdd_dati?.indirizzo_debitore || '');
                html += campo('Codice Fiscale debitore:', paymentData.sdd_dati?.cf_debitore || '');
                html += campo('IBAN:', paymentData.sdd_dati?.iban || '');
            }
            html += `<div style="margin-top:10px;"></div>`;
            html += campo('Presa Visione e Consenso:', paymentData.consenso_obbligatorio ? 'Sì' : 'No');
            html += campo('Consensi Commerciali:', `Promozione: ${paymentData.consensi_commerciali.promozione ? 'Sì' : 'No'}, Profilazione: ${paymentData.consensi_commerciali.profilazione ? 'Sì' : 'No'}, Terzi: ${paymentData.consensi_commerciali.terzi ? 'Sì' : 'No'}`);
            html += campo('Dichiarazione Sostitutiva:', paymentData.dichiarazione_notorieta ? 'Proprietario' : 'Affitto/Locazione');
            html += campo('Documento d\'Identità:', (paymentData.documento_identita && paymentData.documento_identita.join(', ')) || '');
            html += campo('Data firma:', formattaData(paymentData.data_firma) || '');
            if (paymentData.firma) {
                html += `
                    <div class="riepilogo-campo">
                        <span class="campo-nome">Firma:</span>
                        <span class="campo-valore"><img src="${paymentData.firma}" alt="Firma del cliente" style="border: 1px solid #ccc; max-width: 100%; height: auto;"></span>
                    </div>
                `;
            }
        }
        cardConsensi.innerHTML = html;
    }

    // Rende tutte le card
    async function renderAllCards() {
        renderCardCliente();
        await renderCardTecnici();
        renderCardConsensi();
    }

    // -------- SALVATAGGIO BOZZA --------
    const salvaBozzaBtn = document.getElementById('salva-bozza-btn');
    if (salvaBozzaBtn) {
        salvaBozzaBtn.addEventListener('click', function() {
            const nomeBozzaInput = document.getElementById('nome_bozza');
            const nome = nomeBozzaInput ? nomeBozzaInput.value.trim() : '';
            if (!nome) {
                alert('Inserisci un nome per la bozza!');
                if (nomeBozzaInput) nomeBozzaInput.focus();
                return;
            }
            // Costruisci oggetto bozza
            const bozzaData = {
                customerData,
                technicalData,
                paymentData
            };
            try {
                localStorage.setItem('bozza_' + nome, JSON.stringify(bozzaData));
                alert('Compilazione salvata come bozza!');
            } catch (e) {
                alert('Errore nel salvataggio della bozza: ' + e.message);
            }
        });
    }

    // ----- FUNZIONE AGGIUNTA: invia il PDF generato al backend -----
    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    async function inviaPDFAlBackend(pdfBytes, nomeFile, dati) {
        try {
            if (isIOS()) {
                // Converti il pdfBytes (Uint8Array o ArrayBuffer) in base64
                let binary = '';
                const bytes = new Uint8Array(pdfBytes);
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64PDF = btoa(binary);

                const payload = {
                    pdf_base64: base64PDF,
                    filename: nomeFile,
                    dati: dati,
                    mail_collaboratore: localStorage.getItem('mail_collaboratore') || '',
                    mail_cliente: localStorage.getItem('mail_cliente') || '',
                };

                const response = await fetch('https://contratti-alperia.onrender.com/generate-pdf-base64', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    throw new Error('Errore invio PDF base64 al backend');
                }
                alert('PDF (base64) inviato al server!');
            } else {
                // Metodo classico per Android/desktop
                const formData = new FormData();
                formData.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }), nomeFile);
                formData.append('dati', JSON.stringify(dati));
                formData.append('mail_collaboratore', localStorage.getItem('mail_collaboratore') || '');
                formData.append('mail_cliente', localStorage.getItem('mail_cliente') || '');

                const API_BASE_URL = location.hostname === "localhost"
                  ? "http://localhost:3000"
                  : "https://contratti-alperia.onrender.com"

                const response = await fetch(API_BASE_URL + '/generate-pdf', {
                     method: 'POST',
                     body: formData
          });
                if (!response.ok) {
                    throw new Error('Errore invio PDF al backend');
                }
                alert('PDF inviato al server!');
            }
        } catch (error) {
            alert('Errore invio PDF al backend: ' + error.message);
        }
    }

    // ----------- PDF UNIFICATO CON FIRMA E DATA FORMATTATA -----------
    async function generaPDFUnificato() {
        if (typeof window.PDFLib === 'undefined') {
            alert('La libreria PDF-Lib non è caricata! Controlla il tag <script> nell\'HTML.');
            console.error('PDFLib non disponibile!');
            return;
        }
        const { PDFDocument } = window.PDFLib;
        try {
            const mainPdfUrl = '/A-0018-C-0524_PDA_CG_Retail.pdf';
            const resContratto = await fetch(mainPdfUrl);
            if (!resContratto.ok) {
                alert('Non trovo il file contratto: ' + mainPdfUrl);
                throw new Error('File PDF contratto non trovato!');
            }
            const contrattoPdfBytes = await resContratto.arrayBuffer();
            const contrattoDoc = await PDFDocument.load(contrattoPdfBytes);
            const formContratto = contrattoDoc.getForm();

            // --- Compilazione campi contratto ---
            formContratto.getTextField('Cognome').setText(customerData.cognome || '');
            formContratto.getTextField('Nome').setText(customerData.nome || '');
            formContratto.getTextField('Codice Fiscale').setText(customerData.cf || '');
            formContratto.getTextField('Indirizzo di residenza').setText(customerData.indirizzo_residenza || '');
            formContratto.getTextField('N Residenza').setText(customerData.n_residenza || '');
            formContratto.getTextField('CAP').setText(customerData.cap_residenza || '');
            formContratto.getTextField('Comune').setText(customerData.comune_residenza || '');
            formContratto.getTextField('Prov').setText(customerData.provincia_residenza || '');
            formContratto.getTextField('Cellulare').setText(customerData.cellulare || '');
            formContratto.getTextField('E-mail').setText(customerData.mail || '');
            if (customerData.residente_fornitura === 'si') {
                formContratto.getCheckBox('Residente presso la fornitura_SI').check();
             } else {
                 formContratto.getCheckBox('Residente presso la fornitura_NO').check();
          }

            if (customerData.fornitura_diversa) {
                formContratto.getTextField('Indirizzo').setText(customerData.indirizzo_fornitura || '');
                formContratto.getTextField('n_2').setText(customerData.n_fornitura || '');
                formContratto.getTextField('comune_2').setText(customerData.comune_fornitura || '');
                formContratto.getTextField('cap_2').setText(customerData.cap_fornitura || '');
                formContratto.getTextField('provincia_2').setText(customerData.provincia_fornitura || '');
            }

            // --- ENERGIA ELETTRICA ---
            if (technicalData.richiesta_elettrica) {
                switch (technicalData.dati_elettrici.tipo_richiesta) {
                    case 'switch':
                        formContratto.getCheckBox('dati_elettrici_switch').check();
                        break;
                    case 'subentro':
                        formContratto.getCheckBox('dati_elettrici_subentro').check();
                        break;
                    case 'voltura':
                        formContratto.getCheckBox('dati_elettrici_voltura').check();
                        break;
                    case 'nuova_attivazione':
                        formContratto.getCheckBox('dati_elettrici_Nuova Attivazione').check();
                        break;
                }

                formContratto.getTextField('Data Attivazione').setText(formattaData(technicalData.dati_elettrici.data_attivazione) || '');
                formContratto.getTextField('codice_pod_1').setText(technicalData.dati_elettrici.codice_pod_1 || '');
                formContratto.getTextField('codice_pod_2').setText(technicalData.dati_elettrici.codice_pod_2 || '');
                formContratto.getTextField('Fornitore Uscente_ee').setText(technicalData.dati_elettrici.fornitore_uscente || '');
                formContratto.getTextField('Consumo annuo (kWh)').setText(technicalData.dati_elettrici.consumo_annuo_kwh || '');
                formContratto.getTextField('Potenza impegnata (kW)').setText(technicalData.dati_elettrici.potenza_impegnata || '');

                if (technicalData.richiesta_elettrica && technicalData.dati_elettrici.tipologia_uso) {
                    try { formContratto.getCheckBox(technicalData.dati_elettrici.tipologia_uso).check(); } catch(e) { console.error('Tipologia uso energia:', technicalData.dati_elettrici.tipologia_uso, e); }
                }
                // Usa il nome offerta calcolato
                const offerte = await fetch('/offerte_residenziali.json').then(r => r.json()).catch(() => []);
                const nomeOffertaEE = await getNomeOfferta(technicalData.dati_elettrici.codice_offerta, "energia");
                formContratto.getTextField('Nome Offerta sottoscritta').setText(nomeOffertaEE || technicalData.dati_elettrici.nome_offerta || '');
                formContratto.getTextField('Codice offerta').setText(technicalData.dati_elettrici.codice_offerta || '');
            }

            // --- GAS NATURALE ---
            if (technicalData.richiesta_gas) {
                switch (technicalData.dati_gas.tipo_richiesta) {
                    case 'switch':
                        formContratto.getCheckBox('dati_gas_Switch_2').check();
                        break;
                    case 'subentro':
                        formContratto.getCheckBox('dati_gas_Subentro_2').check();
                        break;
                    case 'voltura':
                        formContratto.getCheckBox('dati_gas_Voltura_2').check();
                        break;
                    case 'nuova_attivazione':
                        formContratto.getCheckBox('dati_gas_Nuova Attivazione_2').check();
                        break;
                }
                formContratto.getTextField('Data Attivazione_2').setText(formattaData(technicalData.dati_gas.data_attivazione) || '');
                formContratto.getTextField('Codice PDR').setText(technicalData.dati_gas.codice_pdr || '');
                formContratto.getTextField('Fornitore Uscente_2').setText(technicalData.dati_gas.fornitore_uscente || '');
                formContratto.getTextField('Consumo annuo (smc)').setText(technicalData.dati_gas.consumo_annuo_smc || '');
                formContratto.getTextField('REMI').setText(technicalData.dati_gas.remi || '');
                const gasMap = {
                    'riscaldamento': 'Riscaldamento',
                    'cottura_cibi': 'Cottura cibi',
                    'produzione_acqua_calda': 'Produzione acqua calda sanitaria'
                };
                let categoriaGas = technicalData.dati_gas.categoria_uso;
                if (Array.isArray(categoriaGas)) {
                    categoriaGas.forEach(cat => {
                        if (gasMap[cat]) {
                            try { formContratto.getCheckBox(gasMap[cat]).check(); } catch(e) {console.error('Errore gas:', gasMap[cat], e);}
                        }
                    });
                } else if (typeof categoriaGas === 'string' && categoriaGas.length > 0) {
                    if (gasMap[categoriaGas]) {
                        try { formContratto.getCheckBox(gasMap[categoriaGas]).check(); } catch(e) {console.error('Errore gas:', gasMap[categoriaGas], e);}
                    }
                }
                // Usa il nome offerta calcolato
                const offerte = await fetch('/offerte_residenziali.json').then(r => r.json()).catch(() => []);
                const nomeOffertaGas = await getNomeOfferta(technicalData.dati_gas.codice_offerta, "gas");
                formContratto.getTextField('Nome Offerta sottoscritta_2').setText(nomeOffertaGas || technicalData.dati_gas.nome_offerta || '');
                formContratto.getTextField('Codice offerta_2').setText(technicalData.dati_gas.codice_offerta || '');
            }

            if (paymentData) {
                formContratto.getTextField('DATA').setText(formattaData(paymentData.data_firma) || '');
                formContratto.getTextField('Cognome Nome del Debitore').setText(paymentData.sdd_dati?.cognome_nome || '');
                formContratto.getTextField('Indirizzo (Via Piazza CAP E COMUNE)').setText(paymentData.sdd_dati?.indirizzo_debitore || '');
                formContratto.getTextField('Codice Fiscale/Partita IVA del titolare del Conto Corrente').setText(paymentData.sdd_dati?.cf_debitore || '');
                formContratto.getTextField('IBAN di addebito').setText(paymentData.sdd_dati?.iban || '');

                if (paymentData.dichiarazione_notorieta) {
                    formContratto.getRadioGroup('dichiarazione_notorieta').select(paymentData.dichiarazione_notorieta);
                }
                if (Array.isArray(paymentData.documento_identita) && paymentData.documento_identita.length) {
                    formContratto.getRadioGroup('documento_identita').select(paymentData.documento_identita[0]);
                }

                if (paymentData.consenso_obbligatorio) formContratto.getCheckBox('Presa Visione Informativa').check();

                if (paymentData.consensi_commerciali?.promozione === true) {
                    formContratto.getCheckBox('Consenso_Promozione').check();
                } else if (paymentData.consensi_commerciali?.promozione === false) {
                    formContratto.getCheckBox('Consenso_Promozione_no').check();
                }
                if (paymentData.consensi_commerciali?.profilazione === true) {
                    formContratto.getCheckBox('Consenso_Profilazione').check();
                } else if (paymentData.consensi_commerciali?.profilazione === false) {
                    formContratto.getCheckBox('Consenso_Profilazione_no').check();
                }
                if (paymentData.consensi_commerciali?.terzi === true) {
                    formContratto.getCheckBox('Consenso_Terzi').check();
                } else if (paymentData.consensi_commerciali?.terzi === false) {
                    formContratto.getCheckBox('Consenso_Terzi_no').check();
                }

                if (paymentData.firma) {
                    const signatureImage = await contrattoDoc.embedPng(paymentData.firma);
                    const pages = contrattoDoc.getPages();
                    const firstPage = pages[0];
                    const secondPage = pages[1];
                    const width = 136.06;
                    const height = 25.51;
                
                    firstPage.drawImage(signatureImage, {
                        x: 325.8,
                        y: 453.54,
                        width: width,
                        height: height,
                    });

                    if (paymentData.autorizzazione_sdd) {
                        firstPage.drawImage(signatureImage, {
                            x: 351.57,
                            y: 70.87,
                            width: width,
                            height: height,
                        });
                    }
                    
                    secondPage.drawImage(signatureImage, {
                        x: 334.33,
                        y: 578.82,
                        width: width,
                        height: height,
                    });
                    secondPage.drawImage(signatureImage, {
                        x: 382.68,
                        y: 493.15,
                        width: width,
                        height: height,
                    });
                    secondPage.drawImage(signatureImage, {
                        x: 334.33,
                        y: 277.8,
                        width: width,
                        height: height,
                    });
                    secondPage.drawImage(signatureImage, {
                        x: 334.33,
                        y: 189.92,
                        width: width,
                        height: height,
                    });
                }
            }

            formContratto.flatten();

            // --- Cerca le CTE ENERGIA e GAS se richieste ---
            const offerteCTE = await fetch('/offerte_residenziali.json').then(r => r.json());
            let cteDocs = [];
            // ENERGIA
            if (technicalData.richiesta_elettrica && technicalData.dati_elettrici && technicalData.dati_elettrici.codice_offerta) {
                const offertaEnergia = offerteCTE.find(o => (o.codice_offerta === technicalData.dati_elettrici.codice_offerta || o.Codice === technicalData.dati_elettrici.codice_offerta) && (o.categoria?.toLowerCase() === "energia" || o.Categoria?.toLowerCase() === "energia"));
                if (!offertaEnergia || !offertaEnergia.PDF_CTE) {
                    alert('CTE energia non trovata per offerta: ' + technicalData.dati_elettrici.codice_offerta);
                    throw new Error('CTE energia non trovata!');
                }
                const ctePdfUrlEnergia = '/cte_energia/' + offertaEnergia.PDF_CTE;
                const resCTEEnergia = await fetch(ctePdfUrlEnergia);
                if (!resCTEEnergia.ok) {
                    alert('Non trovo il file CTE energia: ' + ctePdfUrlEnergia);
                    throw new Error('File PDF CTE energia non trovato!');
                }
                const ctePdfBytesEnergia = await resCTEEnergia.arrayBuffer();
                const cteDocEnergia = await PDFDocument.load(ctePdfBytesEnergia);
                const formCTEEnergia = cteDocEnergia.getForm();
                
                formCTEEnergia.getTextField('DATA').setText(formattaData(paymentData.data_firma) || '');
                if (paymentData.firma) {
                    const signatureImageCTEE = await cteDocEnergia.embedPng(paymentData.firma);
                    const ctePagesEE = cteDocEnergia.getPages();
                    const cteFirstPageEE = ctePagesEE[0];
                    cteFirstPageEE.drawImage(signatureImageCTEE, {
                        x: 380.68,
                        y: 95.15,
                        width: 136.06,
                        height: 25.51,
                    });
                }
                formCTEEnergia.flatten();
                cteDocs.push(cteDocEnergia);
            }
            // GAS
            if (technicalData.richiesta_gas && technicalData.dati_gas && technicalData.dati_gas.codice_offerta) {
                const offertaGas = offerteCTE.find(o => (o.codice_offerta === technicalData.dati_gas.codice_offerta || o.Codice === technicalData.dati_gas.codice_offerta) && (o.categoria?.toLowerCase() === "gas" || o.Categoria?.toLowerCase() === "gas"));
                if (!offertaGas || !offertaGas.PDF_CTE) {
                    alert('CTE gas non trovata per offerta: ' + technicalData.dati_gas.codice_offerta);
                    throw new Error('CTE gas non trovata!');
                }
                const ctePdfUrlGas = '/cte_gas/' + offertaGas.PDF_CTE;
                const resCTEGas = await fetch(ctePdfUrlGas);
                if (!resCTEGas.ok) {
                    alert('Non trovo il file CTE gas: ' + ctePdfUrlGas);
                    throw new Error('File PDF CTE gas non trovato!');
                }
                const ctePdfBytesGas = await resCTEGas.arrayBuffer();
                const cteDocGas = await PDFDocument.load(ctePdfBytesGas);
                const formCTEGas = cteDocGas.getForm();
                formCTEGas.getTextField('DATA').setText(formattaData(paymentData.data_firma) || '');
                if (paymentData.firma) {
                    const signatureImageCTEG = await cteDocGas.embedPng(paymentData.firma);
                    const ctePagesGas = cteDocGas.getPages();
                    const cteFirstPageGas = ctePagesGas[0];
                    cteFirstPageGas.drawImage(signatureImageCTEG, {
                        x: 380.68,
                        y: 95.15,
                        width: 136.06,
                        height: 25.51,
                    });
                }
                formCTEGas.flatten();
                cteDocs.push(cteDocGas);
            }

            // --- UNISCI CONTRATTO + CTE ENERGIA + CTE GAS (se presenti) ---
            const finalPdfDoc = await PDFDocument.create();
            const contrattoPages = await finalPdfDoc.copyPages(contrattoDoc, contrattoDoc.getPageIndices());
            contrattoPages.forEach(page => finalPdfDoc.addPage(page));
            for (const cteDoc of cteDocs) {
                const ctePages = await finalPdfDoc.copyPages(cteDoc, cteDoc.getPageIndices());
                ctePages.forEach(page => finalPdfDoc.addPage(page));
            }

            const pdfBytes = await finalPdfDoc.save();
            pdfBlob = new Blob([pdfBytes], { type: "application/pdf" }); // SALVA PER CONDIVISIONE

            // Download del PDF
            const nomeFileInput = document.getElementById('nome_file_pdf');
            let nomeFile = "Contratto_e_CTE_Unificato.pdf";
            if (nomeFileInput && nomeFileInput.value.trim() !== "") {
                nomeFile = nomeFileInput.value.trim() + ".pdf";
            }
            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlob);
            link.download = nomeFile;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log('PDF unico scaricato come Contratto_e_CTE_Unificato.pdf');

            // -------- INVIO PDF AL BACKEND --------
            await inviaPDFAlBackend(pdfBytes, nomeFile, customerData);

            // -------- MOSTRA IL PULSANTE CONDIVIDI PDF --------
            if (condividiPdfBtn) {
                condividiPdfBtn.style.display = 'inline-block';
                if (condividiPdfMsg) condividiPdfMsg.style.display = 'none';
            }

            if (avvisoDocumenti) {
                avvisoDocumenti.style.display = 'block';
            }
        } catch (error) {
            console.error("Errore durante la generazione del PDF unico:", error);
            alert("Errore nella generazione del PDF unico! Controlla la console.");
        }
    }

    // Funzione per condividere PDF (Web Share API)
    if (condividiPdfBtn) {
        condividiPdfBtn.addEventListener('click', async function() {
            if (!pdfBlob) {
                alert("Genera prima il PDF!");
                return;
            }
            const nomeFileInput = document.getElementById('nome_file_pdf');
            let nomeFile = "Contratto_e_CTE_Unificato.pdf";
            if (nomeFileInput && nomeFileInput.value.trim() !== "") {
                nomeFile = nomeFileInput.value.trim() + ".pdf";
            }
            const file = new File([pdfBlob], nomeFile, { type: "application/pdf" });

            if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
                alert("La condivisione file non è supportata da questo browser/dispositivo!");
                return;
            }
            try {
                await navigator.share({
                    title: "Contratto PDF",
                    text: "Ecco il contratto PDF generato.",
                    files: [file]
                });
                if (condividiPdfMsg) {
                    condividiPdfMsg.textContent = "PDF condiviso con successo!";
                    condividiPdfMsg.style.display = 'inline-block';
                }
            } catch (err) {
                if (condividiPdfMsg) {
                    condividiPdfMsg.textContent = "Condivisione annullata o errore: " + err;
                    condividiPdfMsg.style.display = 'inline-block';
                }
            }
        });
    }

    // Render cards all'avvio
    await renderAllCards();

    if (generaPdfBtn) {
        generaPdfBtn.addEventListener('click', generaPDFUnificato);
    }
    if (avvisoOkBtn) {
        avvisoOkBtn.addEventListener('click', function() {
            if (avvisoDocumenti) {
                avvisoDocumenti.style.display = 'none';
            }
        });
    }
});