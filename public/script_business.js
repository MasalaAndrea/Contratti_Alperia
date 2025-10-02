document.addEventListener('DOMContentLoaded', async () => {
    // Uppercase conversion for text fields
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea').forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    });

    const riepilogoContainer = document.getElementById('riepilogo-dati-business');
    const aziendaData = JSON.parse(sessionStorage.getItem('aziendaData')) || {};
    const technicalData = JSON.parse(sessionStorage.getItem('technicalData')) || {};
    const paymentData = JSON.parse(sessionStorage.getItem('paymentData')) || {};
    const generaPdfBtn = document.getElementById('genera-pdf-btn');
    const avvisoDocumenti = document.getElementById('avviso-documenti');
    const avvisoOkBtn = document.getElementById('avviso-ok-btn');
    // Pulsante condividi PDF business
    const condividiPdfBtn = document.getElementById('condividi-pdf-btn');
    const condividiPdfMsg = document.getElementById('condividi-pdf-msg');
    // Variabile globale per il PDF generato
    let pdfBlobBusiness = null;

    // ---- FUNZIONE UTILITY ----
    function formattaData(data) {
        if (!data) return '';
        const parti = data.split(/[-\/]/);
        if (parti.length === 3) {
            return `${parti[2]}/${parti[1]}/${parti[0]}`;
        }
        return data;
    }

    // ---- RECUPERO NOME OFFERTA DA CODICE E CATEGORIA ----
    function getNomeOffertaBusiness(codiceOfferta, categoria, offerte) {
        if (!codiceOfferta || !offerte) return '';
        const trovato = offerte.find(o =>
            (o.Codice === codiceOfferta || o.codice_offerta === codiceOfferta) &&
            o.Categoria && o.Categoria.toLowerCase() === categoria
        );
        return trovato ? (trovato["Nome Offerta"] || trovato.nome_offerta || '') : '';
    }

    // ---- RIEPILOGO HTML BUSINESS AGGIORNATO ----
    async function generaRiepilogoHTML() {
        if (!riepilogoContainer) return;
        let htmlContent = '<h3>Dati Azienda / Cliente Business</h3>';
        // ENERGIA
        if (technicalData.richiesta_elettrica && technicalData.dati_elettrici) {
            const nomeOffertaEE = getNomeOffertaBusiness(technicalData.dati_elettrici.codice_offerta, "energia", offerteBusiness);
            const officialOptions = ['switch', 'subentro', 'voltura', 'nuova_attivazione'];
            let tipoRichiestaEE = technicalData.dati_elettrici.tipo_richiesta || '';
            if (!officialOptions.includes(tipoRichiestaEE)) {
                tipoRichiestaEE = "Nessuna selezione";
            }
            // MODIFICA: normalizza la virgola in punto
            let potenzaImpegnata = technicalData.dati_elettrici.potenza_impegnata || '';
            potenzaImpegnata = typeof potenzaImpegnata === "string" ? potenzaImpegnata.replace(',', '.') : potenzaImpegnata;
            htmlContent += `
                <h4>Energia Elettrica</h4>
                <p><strong>Tipo Richiesta:</strong> ${technicalData.dati_elettrici.tipo_richiesta || ''}</p>
                <p><strong>Data Attivazione:</strong> ${formattaData(technicalData.dati_elettrici.data_attivazione) || ''}</p>
                <p><strong>Codice POD:</strong> IT${technicalData.dati_elettrici.codice_pod_1 || ''}E${technicalData.dati_elettrici.codice_pod_2 || ''}</p>
                <p><strong>Fornitore Uscente:</strong> ${technicalData.dati_elettrici.fornitore_uscente || ''}</p>
                <p><strong>Consumo Annuo (kWh):</strong> ${technicalData.dati_elettrici.consumo_annuo_kwh || ''}</p>
                <p><strong>Potenza Impegnata (kW):</strong> ${potenzaImpegnata}</p>
                <p><strong>Tipologia Uso:</strong> ${technicalData.dati_elettrici.tipologia_uso || ''}</p>
                <p><strong>Tensione:</strong> ${technicalData.dati_elettrici.tensione || ''}</p>
                <p><strong>Nome Offerta:</strong> ${nomeOffertaEE || technicalData.dati_elettrici.nome_offerta || ''}</p>
                <p><strong>Codice Offerta:</strong> ${technicalData.dati_elettrici.codice_offerta || ''}</p>
            `;
        }
        htmlContent += `
            <h4>Sede di Fornitura</h4>
            ${aziendaData.sede_fornitura === 'diversa'
                ? `<p><strong>Indirizzo:</strong> ${aziendaData.indirizzo_fornitura || ''}, N. ${aziendaData.n_fornitura || ''}, CAP: ${aziendaData.cap_fornitura || ''}, Comune: ${aziendaData.comune_fornitura || ''}, Provincia: ${aziendaData.provincia_fornitura || ''}</p>`
                : `<p><strong>Sede fornitura uguale a sede legale</strong></p>`}
        `;

        // Carica offerte business per nome offerta leggibile
        let offerteBusiness = [];
        try { offerteBusiness = await fetch('/public/offerte_business.json').then(r => r.json()); } catch (e) { offerteBusiness = []; }

        htmlContent += '<h3>Dati Tecnici di Fornitura</h3>';

        // ENERGIA
        if (technicalData.richiesta_elettrica && technicalData.dati_elettrici) {
            const nomeOffertaEE = getNomeOffertaBusiness(technicalData.dati_elettrici.codice_offerta, "energia", offerteBusiness);
            const officialOptions = ['switch', 'subentro', 'voltura', 'nuova_attivazione'];
            let tipoRichiestaEE = technicalData.dati_elettrici.tipo_richiesta || '';
            if (!officialOptions.includes(tipoRichiestaEE)) {
                tipoRichiestaEE = "Nessuna selezione";
            }
            htmlContent += `
                <h4>Energia Elettrica</h4>
                <p><strong>Tipo Richiesta:</strong> ${technicalData.dati_elettrici.tipo_richiesta || ''}</p>
                <p><strong>Data Attivazione:</strong> ${formattaData(technicalData.dati_elettrici.data_attivazione) || ''}</p>
                <p><strong>Codice POD:</strong> IT${technicalData.dati_elettrici.codice_pod_1 || ''}E${technicalData.dati_elettrici.codice_pod_2 || ''}</p>
                <p><strong>Fornitore Uscente:</strong> ${technicalData.dati_elettrici.fornitore_uscente || ''}</p>
                <p><strong>Consumo Annuo (kWh):</strong> ${technicalData.dati_elettrici.consumo_annuo_kwh || ''}</p>
                <p><strong>Potenza Impegnata (kW):</strong> ${technicalData.dati_elettrici.potenza_impegnata || ''}</p>
                <p><strong>Tipologia Uso:</strong> ${technicalData.dati_elettrici.tipologia_uso || ''}</p>
                <p><strong>Tensione:</strong> ${technicalData.dati_elettrici.tensione || ''}</p>
                <p><strong>Nome Offerta:</strong> ${nomeOffertaEE || technicalData.dati_elettrici.nome_offerta || ''}</p>
                <p><strong>Codice Offerta:</strong> ${technicalData.dati_elettrici.codice_offerta || ''}</p>
            `;
        }

        // GAS
        if (technicalData.richiesta_gas && technicalData.dati_gas) {
            const nomeOffertaGas = getNomeOffertaBusiness(technicalData.dati_gas.codice_offerta, "gas", offerteBusiness);
             const officialOptionsGas = ['switch', 'subentro', 'voltura', 'nuova_attivazione'];
            let tipoRichiestaGas = technicalData.dati_gas.tipo_richiesta || '';
            if (!officialOptionsGas.includes(tipoRichiestaGas)) {
                tipoRichiestaGas = "Nessuna selezione";
            }
            htmlContent += `
                <h4>Gas Naturale</h4>
                <p><strong>Tipo Richiesta:</strong> ${technicalData.dati_gas.tipo_richiesta || ''}</p>
                <p><strong>Data Attivazione:</strong> ${formattaData(technicalData.dati_gas.data_attivazione) || ''}</p>
                <p><strong>Codice PDR:</strong> ${technicalData.dati_gas.codice_pdr || ''}</p>
                <p><strong>Fornitore Uscente:</strong> ${technicalData.dati_gas.fornitore_uscente || ''}</p>
                <p><strong>Consumo Annuo (kWh):</strong> ${technicalData.dati_gas.consumo_annuo_gas || ''}</p>
                <p><strong>REMI:</strong> ${technicalData.dati_gas.remi || ''}</p>
                <p><strong>Categoria uso:</strong> ${(technicalData.dati_gas.categoria_uso && technicalData.dati_gas.categoria_uso.join(', ')) || ''}</p>
                <p><strong>Nome Offerta:</strong> ${nomeOffertaGas || technicalData.dati_gas.nome_offerta || ''}</p>
                <p><strong>Codice Offerta:</strong> ${technicalData.dati_gas.codice_offerta || ''}</p>
            `;
        }

        htmlContent += '<h3>Pagamento e Consensi</h3>';
        if (paymentData.autorizzazione_sdd) {
            htmlContent += `
                <h4>Autorizzazione Addebito Diretto (SDD)</h4>
                <p><strong>Cognome e Nome debitore:</strong> ${paymentData.sdd_dati?.cognome_nome || ''}</p>
                <p><strong>Indirizzo debitore:</strong> ${paymentData.sdd_dati?.indirizzo_debitore || ''}</p>
                <p><strong>Codice Fiscale/Partita IVA debitore:</strong> ${paymentData.sdd_dati?.cf_debitore || ''}</p>
                <p><strong>IBAN:</strong> ${paymentData.sdd_dati?.iban || ''}</p>
            `;
        }
        htmlContent += `
            <h4>Consensi</h4>
            <p><strong>Presa Visione e Consenso:</strong> ${paymentData.consenso_obbligatorio ? 'Sì' : 'No'}</p>
            <p><strong>Consensi Commerciali:</strong>
                Promozione: ${(paymentData.consensi_commerciali && paymentData.consensi_commerciali.promozione ? 'Sì' : 'No')},
                Profilazione: ${(paymentData.consensi_commerciali && paymentData.consensi_commerciali.profilazione ? 'Sì' : 'No')},
                Terzi: ${(paymentData.consensi_commerciali && paymentData.consensi_commerciali.terzi ? 'Sì' : 'No')}
            </p>
            <p><strong>Dichiarazione Sostitutiva:</strong> ${paymentData.dichiarazione_notorieta || ''}</p>
            <p><strong>Documento d'Identità:</strong> ${(paymentData.documento_identita && paymentData.documento_identita.join(', ')) || ''}</p>
            <h4>Firma e Data</h4>
            <p><strong>Data:</strong> ${formattaData(paymentData.data_firma) || ''}</p>
        `;
        if (paymentData.firma) {
            htmlContent += `<p><strong>Firma:</strong></p><img src="${paymentData.firma}" alt="Firma del cliente" style="border: 1px solid #ccc; max-width: 100%; height: auto;">`;
        }
        riepilogoContainer.innerHTML = htmlContent;
    }

    // --- SALVA BOZZA BUSINESS ---
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
            const bozzaData = {
                aziendaData,
                technicalData,
                paymentData
            };
            try {
                localStorage.setItem('bozza_' + nome, JSON.stringify(bozzaData));
                alert('Compilazione BUSINESS salvata come bozza!');
            } catch (e) {
                alert('Errore nel salvataggio della bozza business: ' + e.message);
            }
        });
    }

    // ----- FUNZIONE AGGIUNTA: invia il PDF generato al backend -----
    async function inviaPDFAlBackendBusiness(pdfBytes, nomeFile, datiAzienda) {
        try {
            const formData = new FormData();
            formData.append('pdf', new Blob([pdfBytes], { type: 'application/pdf' }), nomeFile);
            formData.append('dati', JSON.stringify(datiAzienda));
            formData.append('mail_collaboratore', localStorage.getItem('mail_collaboratore') || '');
            formData.append('mail_cliente', localStorage.getItem('mail_cliente') || '');

            // PATCH: uso variabile per ambiente locale/remoto
            const API_BASE_URL = location.hostname === "localhost"
                ? "http://localhost:3000"
                : "https://contratti-alperia.onrender.com";

            const response = await fetch(API_BASE_URL + '/generate-pdf-business', {
                method: 'POST',
                body: formData
            });
            console.log('Status fetch:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error('Errore invio PDF business al backend');
            }
            const resData = await response.json();
            console.log('Risposta dal backend business:', resData);
            alert('PDF BUSINESS inviato al server e email inviata!');
        } catch (error) {
            console.error('Errore invio PDF business al backend:', error);
            alert('Errore nell\'invio del PDF BUSINESS al server!');
        }
    }

    // ----------- PDF BUSINESS UNIFICATO COME IL RESIDENZIALE -----------
    async function generaPDFBusinessUnificato() {
        if (typeof window.PDFLib === 'undefined') {
            alert('La libreria PDF-Lib non è caricata!');
            console.error('PDFLib non disponibile!');
            return;
        }
        const { PDFDocument } = window.PDFLib;
        try {
            // --- CONTRATTO PRINCIPALE BUSINESS ---
            const mainPdfUrl = '/A-0009-C-0524_PDA_CG_Business.pdf';
            const busContratto = await fetch(mainPdfUrl);
            if (!busContratto.ok) {
                alert('Non trovo il file contratto business: ' + mainPdfUrl);
                throw new Error('File PDF contratto business non trovato!');
            }
            const contrattoPdfBytes = await busContratto.arrayBuffer();
            const contrattoDoc = await PDFDocument.load(contrattoPdfBytes);
            const formContratto = contrattoDoc.getForm();

            // [Qui compila tutti i campi come nel tuo codice...]

            // --- Compilazione campi contratto business ---
            formContratto.getTextField('Ragione_sociale').setText(aziendaData.ragione_sociale || '');
            formContratto.getTextField('partita_iva').setText(aziendaData.partita_iva || '');
            formContratto.getTextField('codice_fiscale').setText(aziendaData.codice_fiscale_azienda || '');
            formContratto.getTextField('Codice_SDI').setText(aziendaData.codice_sdi || '');
            formContratto.getTextField('Indirizzo_sede_legale').setText(aziendaData.indirizzo_sede || '');
            formContratto.getTextField('Comune').setText(aziendaData.comune_sede || '');
            formContratto.getTextField('Cap').setText(aziendaData.cap_sede || '');
            formContratto.getTextField('Prov').setText(aziendaData.provincia_sede || '');
            formContratto.getTextField('Telefono').setText(aziendaData.telefono || '');
            formContratto.getTextField('Email').setText(aziendaData.email_azienda || '');
            formContratto.getTextField('Pec').setText(aziendaData.pec || '');
            formContratto.getTextField('Cell').setText(aziendaData.cell || '');

            // Dati rappresentante
            formContratto.getTextField('Cognome').setText(aziendaData.rapp_cognome || '');
            formContratto.getTextField('Nome').setText(aziendaData.rapp_nome || '');
            formContratto.getTextField('codice_f_f_2').setText(aziendaData.rapp_codice_fiscale || '');

            // Sede fornitura
            formContratto.getTextField('Indirizzo_f').setText(aziendaData.indirizzo_fornitura || '');
            formContratto.getTextField('Comune_f').setText(aziendaData.comune_fornitura || '');
            formContratto.getTextField('N_f').setText(aziendaData.n_fornitura || '');
            formContratto.getTextField('Cap_').setText(aziendaData.cap_fornitura || '');
            formContratto.getTextField('Prov_f').setText(aziendaData.provincia_fornitura || '');

            // --- Compilazione dati tecnici energia e gas ---
            if (technicalData.richiesta_elettrica && technicalData.dati_elettrici) {
                if (technicalData.dati_elettrici.tipo_richiesta === 'switch') formContratto.getCheckBox('Switch').check();
                if (technicalData.dati_elettrici.tipo_richiesta === 'subentro') formContratto.getCheckBox('Subentro').check();
                if (technicalData.dati_elettrici.tipo_richiesta === 'voltura') formContratto.getCheckBox('Voltura').check();
                if (technicalData.dati_elettrici.tipo_richiesta === 'nuova_attivazione') formContratto.getCheckBox('Nuova Attivazione').check();

                formContratto.getTextField('Pod_1').setText(technicalData.dati_elettrici.codice_pod_1 || '');
                formContratto.getTextField('Pod_2').setText(technicalData.dati_elettrici.codice_pod_2 || '');
                formContratto.getTextField('Consumo_annuo_kwh').setText(technicalData.dati_elettrici.consumo_annuo_kwh || '');
                formContratto.getTextField('Nome_Offerta_sottoscritta_ee').setText(technicalData.dati_elettrici.nome_offerta || '');
                formContratto.getTextField('Codice_offerta_ee').setText(technicalData.dati_elettrici.codice_offerta || '');
                formContratto.getTextField('Fornitore_uscente_ee').setText(technicalData.dati_elettrici.fornitore_uscente || '');
                formContratto.getTextField('Pot_kW').setText(technicalData.dati_elettrici.potenza_impegnata || '');

                if (technicalData.dati_elettrici.tipologia_uso) {
                    try {
                        formContratto.getCheckBox('Tipologia uso.' + technicalData.dati_elettrici.tipologia_uso).check();
                    } catch (e) { }
                }
                if (technicalData.dati_elettrici.tensione) {
                    try {
                        formContratto.getCheckBox('Tensione.' + technicalData.dati_elettrici.tensione).check();
                    } catch (e) { }
                }
            }

            if (technicalData.richiesta_gas && technicalData.dati_gas) {
                if (technicalData.dati_gas.tipo_richiesta === 'switch') formContratto.getCheckBox('Switch_gas').check();
                if (technicalData.dati_gas.tipo_richiesta === 'subentro') formContratto.getCheckBox('Subentro_gas').check();
                if (technicalData.dati_gas.tipo_richiesta === 'voltura') formContratto.getCheckBox('Voltura_gas').check();
                if (technicalData.dati_gas.tipo_richiesta === 'nuova_attivazione') formContratto.getCheckBox('Nuova Attivazione_gas').check();

                formContratto.getTextField('PDR').setText(technicalData.dati_gas.codice_pdr || '');
                formContratto.getTextField('Nome_Offerta_sottoscritta_gas').setText(technicalData.dati_gas.nome_offerta || '');
                formContratto.getTextField('Codice_offerta_gas').setText(technicalData.dati_gas.codice_offerta || '');
                formContratto.getTextField('Fornitore_uscente_gas').setText(technicalData.dati_gas.fornitore_uscente || '');
                formContratto.getTextField('Consumo_annuo_smc').setText(technicalData.dati_gas.consumo_annuo_gas || '');
                formContratto.getTextField('REMI').setText(technicalData.dati_gas.remi || '');

                if (technicalData.dati_gas.categoria_uso && technicalData.dati_gas.categoria_uso.length > 0) {
                    technicalData.dati_gas.categoria_uso.forEach(categoria => {
                        try {
                            formContratto.getCheckBox('Categoria uso.' + categoria).check();
                        } catch (e) { }
                    });
                }
            }
            

            // --- Compilazione pagamenti e consensi ---
            if (paymentData.autorizzazione_sdd) {
                formContratto.getTextField('Ragione_sociale_debitore').setText(paymentData.sdd_dati?.cognome_nome || '');
                formContratto.getTextField('Indirizzo_debitore').setText(paymentData.sdd_dati?.indirizzo_debitore || '');
                formContratto.getTextField('Iban').setText(paymentData.sdd_dati?.iban || '');
                formContratto.getTextField('Codice_fiscale_debitore').setText(paymentData.sdd_dati?.cf_debitore || '');
            }
            const gruppoRadioDichiarazione = formContratto.getRadioGroup('dichiarazione_notorieta');
            if (paymentData.dichiarazione_notorieta === 'Proprietario') {
                gruppoRadioDichiarazione.select('Proprietà/Usufrutto');
            } else if (paymentData.dichiarazione_notorieta === 'Affitto') {
                gruppoRadioDichiarazione.select('Locazione/Affitto');
            }

            if (paymentData.documento_identita && paymentData.documento_identita.length > 0) {
                const gruppoDocumenti = formContratto.getRadioGroup('documento_identita');
                if (paymentData.documento_identita.includes("Carta d'identità")) gruppoDocumenti.select('Carta d\'identità');
                if (paymentData.documento_identita.includes('Patente')) gruppoDocumenti.select('Patente');
                if (paymentData.documento_identita.includes('Passaporto')) gruppoDocumenti.select('Passaporto');
            }
                if (paymentData.consenso_obbligatorio) formContratto.getCheckBox('Presa Visione Informativa').check();
                
            if (paymentData.consensi_commerciali) {
                if (paymentData.consensi_commerciali.promozione) {
                    formContratto.getCheckBox('Consenso_Promozione').check();
                } else {
                    formContratto.getCheckBox('Consenso_Promozione_no').check();
                }
                if (paymentData.consensi_commerciali.profilazione) {
                    formContratto.getCheckBox('Consenso_Profilazione').check();
                } else {
                    formContratto.getCheckBox('Consenso_Profilazione_no').check();
                }
                if (paymentData.consensi_commerciali.terzi) {
                    formContratto.getCheckBox('Consenso_Terzi').check();
                } else {
                    formContratto.getCheckBox('Consenso_Terzi_no').check();
                }
            }
            formContratto.getTextField('DATA').setText(formattaData(paymentData.data_firma) || '');

            // --- Firma cliente inserita come richiesto ---
            if (paymentData.firma) {
                const signatureImage = await contrattoDoc.embedPng(paymentData.firma);
                const pages = contrattoDoc.getPages();
                const firstPage = pages[0];
                const secondPage = pages[1];
                const width = 136.06;
                const height = 25.51;
                
                firstPage.drawImage(signatureImage, {
                    x: 390.8,
                    y: 355.54,
                    width: width,
                    height: height,
                });

                if (paymentData.autorizzazione_sdd) {
                    secondPage.drawImage(signatureImage, {
                        x: 390.57,
                        y: 570.87,
                        width: width,
                        height: height,
                    });
                }
                
                secondPage.drawImage(signatureImage, {
                    x: 340.68,
                    y: 335.15,
                    width: width,
                    height: height,
                });
                secondPage.drawImage(signatureImage, {
                    x: 334.33,
                    y: 130.8,
                    width: width,
                    height: height,
                });
                secondPage.drawImage(signatureImage, {
                    x: 345.33,
                    y: 72.92,
                    width: width,
                    height: height,
                });
            }

            formContratto.flatten();

            // --- Cerca le CTE ENERGIA e GAS se richieste ---
            const offerte = await fetch('/offerte_business.json').then(r => r.json());
            let cteDocs = [];
            // ENERGIA
            if (technicalData.richiesta_elettrica && technicalData.dati_elettrici && technicalData.dati_elettrici.nome_offerta) {
                const offertaEnergia = offerte.find(o => o['Nome Offerta'] === technicalData.dati_elettrici.nome_offerta && o['Categoria'] === 'Energia');
                if (!offertaEnergia || !offertaEnergia.PDF_CTE) {
                    alert('CTE energia non trovata per offerta: ' + technicalData.dati_elettrici.nome_offerta);
                    throw new Error('CTE energia non trovata!');
                }
                const ctePdfUrlEnergia = '/cte_energia/' + offertaEnergia.PDF_CTE;
                const busCTEEnergia = await fetch(ctePdfUrlEnergia);
                if (!busCTEEnergia.ok) {
                    alert('Non trovo il file CTE energia: ' + ctePdfUrlEnergia);
                    throw new Error('File PDF CTE energia non trovato!');
                }
                const ctePdfBytesEnergia = await busCTEEnergia.arrayBuffer();
                const cteDocEnergia = await PDFDocument.load(ctePdfBytesEnergia);
                const formCTEEnergia = cteDocEnergia.getForm();

                formCTEEnergia.getTextField('DATA').setText(formattaData(paymentData.data_firma) || '');
                if (paymentData.firma) {
                    const signatureImageCTEE = await cteDocEnergia.embedPng(paymentData.firma);
                    const ctePagesEE = cteDocEnergia.getPages();
                    const cteFirstPageEE = ctePagesEE[0];
                    cteFirstPageEE.drawImage(signatureImageCTEE, {
                        x: 380.68,
                        y: 70.15,
                        width: 136.06,
                        height: 25.51,
                    });
                }
                formCTEEnergia.flatten();
                cteDocs.push(cteDocEnergia);
            }
            // GAS
            if (technicalData.richiesta_gas && technicalData.dati_gas && technicalData.dati_gas.nome_offerta) {
                const offertaGas = offerte.find(o => o['Nome Offerta'] === technicalData.dati_gas.nome_offerta && o['Categoria'] === 'Gas');
                if (!offertaGas || !offertaGas.PDF_CTE) {
                    alert('CTE gas non trovata per offerta: ' + technicalData.dati_gas.nome_offerta);
                    throw new Error('CTE gas non trovata!');
                }
                const ctePdfUrlGas = '/cte_gas/' + offertaGas.PDF_CTE;
                const busCTEGas = await fetch(ctePdfUrlGas);
                if (!busCTEGas.ok) {
                    alert('Non trovo il file CTE gas: ' + ctePdfUrlGas);
                    throw new Error('File PDF CTE gas non trovato!');
                }
                const ctePdfBytesGas = await busCTEGas.arrayBuffer();
                const cteDocGas = await PDFDocument.load(ctePdfBytesGas);
                const formCTEGas = cteDocGas.getForm();

                formCTEGas.getTextField('DATA').setText(formattaData(paymentData.data_firma) || '');
                if (paymentData.firma) {
                    const signatureImageCTEG = await cteDocGas.embedPng(paymentData.firma);
                    const ctePagesGas = cteDocGas.getPages();
                    const cteFirstPageGas = cteDocGas.getPages()[0];
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

            // --- Unisci contratto + CTE energia + CTE gas ---
            const finalPdfDoc = await PDFDocument.create();
            const contrattoPages = await finalPdfDoc.copyPages(contrattoDoc, contrattoDoc.getPageIndices());
            contrattoPages.forEach(page => finalPdfDoc.addPage(page));
            for (const cteDoc of cteDocs) {
                const ctePages = await finalPdfDoc.copyPages(cteDoc, cteDoc.getPageIndices());
                ctePages.forEach(page => finalPdfDoc.addPage(page));
            }

            // Download PDF unico
            const pdfBytes = await finalPdfDoc.save();
            pdfBlobBusiness = new Blob([pdfBytes], { type: 'application/pdf' }); // Per condivisione

            const link = document.createElement('a');
            link.href = URL.createObjectURL(pdfBlobBusiness);

            // --- NOME FILE DINAMICO ---
            const nomeFileInput = document.getElementById('nome_file_pdf');
            let nomeFile = 'Business_Contratto_e_CTE_Unificato.pdf';
            if (nomeFileInput && nomeFileInput.value.trim() !== '') {
                let val = nomeFileInput.value.trim();
                val = val.replace(/[\/\\?%*:|"<>]/g, '_');
                if (!val.toLowerCase().endsWith('.pdf')) val += '.pdf';
                nomeFile = val;
            }
            link.download = nomeFile;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // INVIO PDF BUSINESS AL BACKEND
            await inviaPDFAlBackendBusiness(pdfBytes, nomeFile, aziendaData);

            // Mostra il pulsante condividi PDF business
            if (condividiPdfBtn) {
                condividiPdfBtn.style.display = 'inline-block';
                if (condividiPdfMsg) condividiPdfMsg.style.display = 'none';
            }

            if (avvisoDocumenti) avvisoDocumenti.style.display = 'block';

        } catch (error) {
            console.error('Errore PDF business:', error);
            alert('Errore nella generazione PDF business!');
        }
    }

    // Funzione per condividere PDF business (Web Share API)
    if (condividiPdfBtn) {
        condividiPdfBtn.addEventListener('click', async function() {
            if (!pdfBlobBusiness) {
                alert("Genera prima il PDF!");
                return;
            }
            const nomeFileInput = document.getElementById('nome_file_pdf');
            let nomeFile = 'Business_Contratto_e_CTE_Unificato.pdf';
            if (nomeFileInput && nomeFileInput.value.trim() !== '') {
                let val = nomeFileInput.value.trim();
                val = val.replace(/[\/\\?%*:|"<>]/g, '_');
                if (!val.toLowerCase().endsWith('.pdf')) val += '.pdf';
                nomeFile = val;
            }
            const file = new File([pdfBlobBusiness], nomeFile, { type: "application/pdf" });

            if (!navigator.canShare || !navigator.canShare({ files: [file] })) {
                alert("La condivisione file non è supportata da questo browser/dispositivo!");
                return;
            }
            try {
                await navigator.share({
                    title: "Contratto PDF Business",
                    text: "Ecco il contratto PDF business generato.",
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

    generaRiepilogoHTML();

    if (generaPdfBtn) generaPdfBtn.addEventListener('click', generaPDFBusinessUnificato);
    if (avvisoOkBtn) avvisoOkBtn.addEventListener('click', () => {
        if (avvisoDocumenti) avvisoDocumenti.style.display = 'none';
    });
});