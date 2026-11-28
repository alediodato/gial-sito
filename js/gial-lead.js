/* Invio dei moduli contatti (home e pagine servizio) senza uscire dal sito.
   Manda i dati a Formspree, registra l'evento generate_lead in Analytics
   e porta il visitatore alla pagina /grazie/. */
(function () {
    function traccia(evento, params) {
        try { if (window.gtag) window.gtag('event', evento, params || {}); } catch (e) { /* silenzioso */ }
    }

    document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!form.matches || !form.matches('form[data-gial-lead]')) return;
        e.preventDefault();

        var msg = form.querySelector('.g-lead-msg');
        var btn = form.querySelector('button[type="submit"]');
        var tel = form.querySelector('[name="telefono"]');
        var campoServizio = form.querySelector('[name="servizio"]');
        var servizio = campoServizio ? campoServizio.value : '';
        var posizione = form.getAttribute('data-gial-lead');

        if (tel && tel.value.replace(/\D/g, '').length < 8) {
            if (msg) msg.textContent = 'Controlla il numero di telefono: ci serve per richiamarti.';
            tel.focus();
            return;
        }

        // Oggetto della mail con servizio e nome, per riconoscere subito la richiesta
        var oggetto = form.querySelector('[name="_subject"]');
        var nome = form.querySelector('[name="nome"]');
        if (oggetto) {
            oggetto.value = '[Sito] ' + (servizio || 'Richiesta') + (nome && nome.value ? ' — ' + nome.value : '');
        }

        var testoBtn = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Invio in corso…'; }
        if (msg) msg.textContent = '';

        fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
            .then(function (r) {
                if (!r.ok) throw new Error('invio non riuscito');
                var fatto = false;
                function vai() { if (fatto) return; fatto = true; window.location.href = '/grazie/'; }
                if (window.gtag) {
                    window.gtag('event', 'generate_lead', { servizio: servizio, posizione: posizione, event_callback: vai, event_timeout: 1500 });
                }
                setTimeout(vai, 1600);
            })
            .catch(function () {
                if (btn) { btn.disabled = false; btn.textContent = testoBtn; }
                if (msg) msg.innerHTML = 'Invio non riuscito. Chiamaci al <a href="tel:+393279371705" style="color:#fff;text-decoration:underline">327 937 1705</a> o scrivici su WhatsApp.';
                traccia('form_errore', { servizio: servizio, posizione: posizione });
            });
    });
})();
