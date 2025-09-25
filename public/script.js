document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea').forEach(input => {
        input.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    });

    // --- ATTENZIONE: NON gestire il submit del form 'startForm' qui ---
    // La logica per il submit del form iniziale (pagina index) è gestita SOLO in index.html!
    // Se vuoi gestire il submit per 'customerForm', 'technicalForm', 'paymentForm', fallo qui sotto.

    // --- Pagina 1: Dati Cliente Residenziale ---
    const fornituraCheckbox = document.getElementById('fornitura_diversa');
    const datiFornituraSection = document.getElementById('dati-fornitura');
    const cfInput = document.getElementById('cf');
    const cfError = document.getElementById('cf-error');
    const customerForm = document.getElementById('customerForm');
    const fornituraFields = document.querySelectorAll('.fornitura-obbligatoria');

    function aggiornaRequiredFornitura() {
        if (fornituraCheckbox && datiFornituraSection) {
            if (fornituraCheckbox.checked) {
                datiFornituraSection.style.display = 'block';
                fornituraFields.forEach(field => field.setAttribute('required', 'required'));
            } else {
                datiFornituraSection.style.display = 'none';
                fornituraFields.forEach(field => field.removeAttribute('required'));
            }
        }
    }

    if (fornituraCheckbox) {
        aggiornaRequiredFornitura();
        fornituraCheckbox.addEventListener('change', aggiornaRequiredFornitura);
    }

    if (cfInput) {
        cfInput.addEventListener('input', function() {
            cfError.textContent = (this.value.length !== 16 && this.value.length > 0) ? 'Il Codice Fiscale deve essere di 16 caratteri.' : '';
        });
    }

    if (customerForm) {
        customerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            if (cfInput.value.length !== 16) {
                cfError.textContent = 'Il Codice Fiscale deve essere di 16 caratteri.';
                return;
            }

            if (fornituraCheckbox && fornituraCheckbox.checked) {
                let errore = false;
                fornituraFields.forEach(field => {
                    if (!field.value.trim()) {
                        errore = true;
                        field.classList.add('error-border');
                    } else {
                        field.classList.remove('error-border');
                    }
                });
                if (errore) {
                    alert('Compila tutti i campi obbligatori della sezione Dati di Fornitura.');
                    return;
                }
            }

            const formData = {
                cognome: document.getElementById('cognome') ? document.getElementById('cognome').value : "",
                nome: document.getElementById('nome') ? document.getElementById('nome').value : "",
                cf: cfInput.value,
                indirizzo_residenza: document.getElementById('indirizzo_residenza') ? document.getElementById('indirizzo_residenza').value : "",
                n_residenza: document.getElementById('n_residenza') ? document.getElementById('n_residenza').value : "",
                cap_residenza: document.getElementById('cap_residenza') ? document.getElementById('cap_residenza').value : "",
                comune_residenza: document.getElementById('comune_residenza') ? document.getElementById('comune_residenza').value : "",
                provincia_residenza: document.getElementById('provincia_residenza') ? document.getElementById('provincia_residenza').value : "",
                cellulare: document.getElementById('cellulare') ? document.getElementById('cellulare').value : "",
                mail: document.getElementById('mail') ? document.getElementById('mail').value : "",
                residente_fornitura: document.querySelector('input[name="residente_fornitura"]:checked') ? document.querySelector('input[name="residente_fornitura"]:checked').value : "",
           };
            
            if (fornituraCheckbox && fornituraCheckbox.checked) {
                formData.fornitura_diversa = true;
                formData.indirizzo_fornitura = document.getElementById('indirizzo_fornitura') ? document.getElementById('indirizzo_fornitura').value : "";
                formData.n_fornitura = document.getElementById('n_fornitura') ? document.getElementById('n_fornitura').value : "";
                formData.cap_fornitura = document.getElementById('cap_fornitura') ? document.getElementById('cap_fornitura').value : "";
                formData.comune_fornitura = document.getElementById('comune_fornitura') ? document.getElementById('comune_fornitura').value : "";
                formData.provincia_fornitura = document.getElementById('provincia_fornitura') ? document.getElementById('provincia_fornitura').value : "";
            } else {
                formData.fornitura_diversa = false;
            }

            sessionStorage.setItem('customerData', JSON.stringify(formData));
            window.location.href = 'pagina2.html';
        });
    }

    // --- Pagina 2: Dati Tecnici ---
    const richiestaElettricaCheckbox = document.getElementById('richiesta_elettrica');
    const sezioneElettrica = document.getElementById('sezione-elettrica');
    const richiestaGasCheckbox = document.getElementById('richiesta_gas');
    const sezioneGas = document.getElementById('sezione-gas');
    const technicalForm = document.getElementById('technicalForm');

    const energiaFields = document.querySelectorAll('.energia-obbligatoria');
    const gasFields = document.querySelectorAll('.gas-obbligatoria');

    function aggiornaRequiredEnergiaGas() {
        if (richiestaElettricaCheckbox && sezioneElettrica) {
            if (richiestaElettricaCheckbox.checked) {
                sezioneElettrica.style.display = 'block';
                energiaFields.forEach(f => f.setAttribute('required','required'));
            } else {
                sezioneElettrica.style.display = 'none';
                energiaFields.forEach(f => f.removeAttribute('required'));
            }
        }
        if (richiestaGasCheckbox && sezioneGas) {
            if (richiestaGasCheckbox.checked) {
                sezioneGas.style.display = 'block';
                gasFields.forEach(f => f.setAttribute('required','required'));
            } else {
                sezioneGas.style.display = 'none';
                gasFields.forEach(f => f.removeAttribute('required'));
            }
        }
    }
    if (richiestaElettricaCheckbox) {
        richiestaElettricaCheckbox.addEventListener('change', aggiornaRequiredEnergiaGas);
    }
    if (richiestaGasCheckbox) {
        richiestaGasCheckbox.addEventListener('change', aggiornaRequiredEnergiaGas);
    }
    aggiornaRequiredEnergiaGas();

    // --- CARICAMENTO OFFERTE DA FILE LOCALE ---
    const selectOffertaEE = document.getElementById('nome_offerta_ee');
    const codiceOffertaEE = document.getElementById('codice_offerta_ee');
    const hiddenCodiceOffertaEE = document.getElementById('hidden_codice_offerta_ee');
    const selectOffertaGas = document.getElementById('nome_offerta_gas');
    const codiceOffertaGas = document.getElementById('codice_offerta_gas');
    const hiddenCodiceOffertaGas = document.getElementById('hidden_codice_offerta_gas');

    let energiaOfferte = [];
    let gasOfferte = [];

    // Carica offerte da file locale
    fetch('/public/offerte_residenziali.json')
      .then(res => res.json())
      .then(data => {
        energiaOfferte = data.filter(o => o.Categoria === 'Energia');
        gasOfferte = data.filter(o => o.Categoria === 'Gas');

        // Popola select Energia
        if (selectOffertaEE) {
            selectOffertaEE.innerHTML = '<option value="" disabled selected>Seleziona un\'offerta</option>';
            energiaOfferte.forEach((offerta, idx) => {
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = offerta['Nome Offerta'];
                selectOffertaEE.appendChild(option);
            });
            selectOffertaEE.addEventListener('change', function() {
                const idx = this.value;
                const offerta = energiaOfferte[idx];
                if (offerta) {
                    codiceOffertaEE.textContent = offerta.Codice || '';
                    hiddenCodiceOffertaEE.value = offerta.Codice || '';
                } else {
                    codiceOffertaEE.textContent = '';
                    hiddenCodiceOffertaEE.value = '';
                }
            });
        }

        // Popola select Gas
        if (selectOffertaGas) {
            selectOffertaGas.innerHTML = '<option value="" disabled selected>Seleziona un\'offerta</option>';
            gasOfferte.forEach((offerta, idx) => {
                const option = document.createElement('option');
                option.value = idx;
                option.textContent = offerta['Nome Offerta'];
                selectOffertaGas.appendChild(option);
            });
            selectOffertaGas.addEventListener('change', function() {
                const idx = this.value;
                const offerta = gasOfferte[idx];
                if (offerta) {
                    codiceOffertaGas.textContent = offerta.Codice || '';
                    hiddenCodiceOffertaGas.value = offerta.Codice || '';
                } else {
                    codiceOffertaGas.textContent = '';
                    hiddenCodiceOffertaGas.value = '';
                }
            });
        }
      });

    // --- Salvataggio dati tecnici e navigazione ---
    if (technicalForm) {
        technicalForm.addEventListener('submit', function(event) {
            event.preventDefault();

            if (!richiestaElettricaCheckbox.checked && !richiestaGasCheckbox.checked) {
                alert('Seleziona almeno una fornitura (Energia Elettrica o Gas Naturale) per procedere.');
                return;
            }

            if (richiestaGasCheckbox && richiestaGasCheckbox.checked) {
                const categoriaUsoGasChecks = document.querySelectorAll('input[name="categoria_uso_gas"]:checked');
                if (categoriaUsoGasChecks.length === 0) {
                    alert("Seleziona almeno una categoria d'uso per il GAS.");
                    return;
                }
            }

            const pod1Input = document.getElementById('codice_pod_1');
            const pod2Input = document.getElementById('codice_pod_2');
            const pdrInput = document.getElementById('codice_pdr');

            const technicalData = {
                richiesta_elettrica: richiestaElettricaCheckbox ? richiestaElettricaCheckbox.checked : false,
                richiesta_gas: richiestaGasCheckbox ? richiestaGasCheckbox.checked : false,
                dati_elettrici: {},
                dati_gas: {}
            };

            if (richiestaElettricaCheckbox && richiestaElettricaCheckbox.checked) {
                const tipoRichiestaEE = document.querySelector('input[name="tipo_richiesta_elettrica"]:checked');
                const tipoUso = document.querySelector('input[name="tipologia_uso"]:checked');
                const idx = selectOffertaEE ? selectOffertaEE.value : '';
                const offerta = energiaOfferte[idx];
                technicalData.dati_elettrici = {
                    tipo_richiesta: tipoRichiestaEE ? tipoRichiestaEE.value : '',
                    data_attivazione: document.getElementById('data_attivazione_ee') ? document.getElementById('data_attivazione_ee').value : "",
                    codice_pod_1: pod1Input ? pod1Input.value : "",
                    codice_pod_2: pod2Input ? pod2Input.value : "",
                    fornitore_uscente: document.getElementById('fornitore_uscente_ee') ? document.getElementById('fornitore_uscente_ee').value : "",
                    consumo_annuo_kwh: document.getElementById('consumo_annuo_kwh') ? document.getElementById('consumo_annuo_kwh').value : "",
                    potenza_impegnata: document.getElementById('potenza_impegnata_kw') ? document.getElementById('potenza_impegnata_kw').value : "",
                    tipologia_uso: tipoUso ? tipoUso.value : '',
                    nome_offerta: offerta ? offerta['Nome Offerta'] : "",
                    codice_offerta: offerta ? offerta.Codice : "",
                };
            }

            if (richiestaGasCheckbox && richiestaGasCheckbox.checked) {
                const tipoRichiestaGas = document.querySelector('input[name="tipo_richiesta_gas"]:checked');
                const idx = selectOffertaGas ? selectOffertaGas.value : '';
                const offerta = gasOfferte[idx];
                technicalData.dati_gas = {
                    tipo_richiesta: tipoRichiestaGas ? tipoRichiestaGas.value : '',
                    data_attivazione: document.getElementById('data_attivazione_gas') ? document.getElementById('data_attivazione_gas').value : "",
                    codice_pdr: pdrInput ? pdrInput.value : "",
                    fornitore_uscente: document.getElementById('fornitore_uscente_gas') ? document.getElementById('fornitore_uscente_gas').value : "",
                    consumo_annuo_smc: document.getElementById('consumo_annuo_smc') ? document.getElementById('consumo_annuo_smc').value : "",
                    remi: document.getElementById('remi') ? document.getElementById('remi').value : "",
                    categoria_uso: Array.from(document.querySelectorAll('input[name="categoria_uso_gas"]:checked')).map(cb => cb.value),
                    nome_offerta: offerta ? offerta['Nome Offerta'] : "",
                    codice_offerta: offerta ? offerta.Codice : "",
                };
            }

            sessionStorage.setItem('technicalData', JSON.stringify(technicalData));
            alert('Dati tecnici salvati! Passiamo alla prossima pagina.');
            window.location.href = 'pagina3.html';
        });
    }

    // --- Pagina 3: Dati di Pagamento e Consensi ---
    const paymentForm = document.getElementById('paymentForm');
    const autorizzazioneSddCheckbox = document.getElementById('autorizzazione_sdd');
    const sezioneSdd = document.getElementById('sezione-sdd');

    if (autorizzazioneSddCheckbox) {
        autorizzazioneSddCheckbox.addEventListener('change', function() {
            if (sezioneSdd) {
                sezioneSdd.style.display = this.checked ? 'block' : 'none';
            }
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Validazione obbligo dichiarazione titolarità
            const dichiarazione = document.querySelector('input[name="dichiarazione"]:checked');
            if (!dichiarazione) {
                alert("Seleziona Proprietario o Affitto nella sezione Dichiarazioni.");
                return;
            }

            // Validazione obbligo documento identità almeno uno
            const documento = document.querySelectorAll('input[name="documento_identita"]:checked');
            if (documento.length === 0) {
                alert("Seleziona almeno un documento d'identità: Carta d'identità, Patente o Passaporto.");
                return;
            }

            // === VALIDAZIONE FIRMA OBBLIGATORIA ===
            const canvas = document.getElementById('firma-pad');
            let firmaValida = false;
            if (canvas && typeof canvas.toDataURL === 'function') {
                const blankCanvas = document.createElement('canvas');
                blankCanvas.width = canvas.width;
                blankCanvas.height = canvas.height;
                if (canvas.toDataURL() !== blankCanvas.toDataURL() && canvas.toDataURL().length > 300) {
                    firmaValida = true;
                }
            }
            if (!firmaValida) {
                alert('Devi apporre la firma per proseguire.');
                canvas.classList.add('error-border');
                return;
            } else {
                canvas.classList.remove('error-border');
            }
            // === FINE VALIDAZIONE FIRMA ===

            const paymentData = {
                autorizzazione_sdd: autorizzazioneSddCheckbox ? autorizzazioneSddCheckbox.checked : false,
                sdd_dati: {
                    cognome_nome: document.getElementById('cognome_nome') ? document.getElementById('cognome_nome').value : "",
                    indirizzo_debitore: document.getElementById('indirizzo_debitore') ? document.getElementById('indirizzo_debitore').value : "",
                    cf_debitore: document.getElementById('cf_debitore') ? document.getElementById('cf_debitore').value : "",
                    iban: document.getElementById('iban') ? document.getElementById('iban').value : ""
                },
                consenso_obbligatorio: document.getElementById('consenso_obbligatorio') ? document.getElementById('consenso_obbligatorio').checked : false,
                consensi_commerciali: {
                    promozione: document.getElementById('consenso_promozione') ? document.getElementById('consenso_promozione').checked : false,
                    profilazione: document.getElementById('consenso_profilazione') ? document.getElementById('consenso_profilazione').checked : false,
                    terzi: document.getElementById('consenso_terzi') ? document.getElementById('consenso_terzi').checked : false
                },
                dichiarazione_notorieta: dichiarazione ? dichiarazione.value : "",
                documento_identita: Array.from(document.querySelectorAll('input[name="documento_identita"]:checked')).map(cb => cb.value),
                data_firma: document.getElementById('data_firma') ? document.getElementById('data_firma').value : "",
                firma: canvas && typeof canvas.toDataURL === 'function' ? canvas.toDataURL() : ""
            };

            sessionStorage.setItem('paymentData', JSON.stringify(paymentData));
            window.location.href = 'riepilogo.html';
        });
    }
});