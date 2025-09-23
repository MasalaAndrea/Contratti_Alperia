function mostraFormEliminaBozze() {
    // Usa il container già presente nella pagina
    let eliminaContainer = document.getElementById('elimina-bozze-container');
    if (!eliminaContainer) return;
    eliminaContainer.innerHTML = '';

    // Recupera bozze
    const bozzeKeys = Object.keys(localStorage).filter(k => k.startsWith('bozza_'));
    if (bozzeKeys.length === 0) {
        eliminaContainer.innerHTML = '<p>Nessuna bozza salvata.</p>';
        return;
    }

    // Form con checkbox per ogni bozza
    const form = document.createElement('form');
    form.id = 'form-elimina-bozze';

    const selectDiv = document.createElement('div');
    selectDiv.style.maxHeight = '220px';
    selectDiv.style.overflowY = 'auto';
    selectDiv.style.marginBottom = '12px';

    bozzeKeys.forEach(key => {
        const nomeBozza = key.replace('bozza_', '');
        const label = document.createElement('label');
        label.style.display = 'block';
        label.style.marginBottom = '6px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = key;
        checkbox.style.marginRight = '8px';

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(nomeBozza));
        selectDiv.appendChild(label);
    });
    form.appendChild(selectDiv);

    // Bottone OK per eliminare selezionate
    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.textContent = 'OK';
    okBtn.style.marginRight = '10px';

    okBtn.onclick = function () {
        const selected = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
        if (selected.length === 0) {
            alert('Seleziona almeno una bozza da eliminare.');
            return;
        }
        // Mostra conferma
        if (confirm('Vuoi eliminare le bozze selezionate?')) {
            selected.forEach(key => localStorage.removeItem(key));
            alert('Bozze eliminate!');
            mostraFormEliminaBozze();
            // Aggiorna la tendina delle bozze di ripresa
            try {
                document.getElementById('riprendi-bozza').dispatchEvent(new Event('change'));
            } catch(e){}
        }
    };

    // Bottone ANNULLA per chiudere
    const annullaBtn = document.createElement('button');
    annullaBtn.type = 'button';
    annullaBtn.textContent = 'Annulla';
    annullaBtn.onclick = function () {
        eliminaContainer.innerHTML = '';
    };

    form.appendChild(okBtn);
    form.appendChild(annullaBtn);
    eliminaContainer.appendChild(form);
    eliminaContainer.style.display = 'block';
}