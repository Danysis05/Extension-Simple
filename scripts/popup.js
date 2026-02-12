document.addEventListener('DOMContentLoaded', async () => {
    await cargarClics();

    // Botón exportar
    document.getElementById('exportBtn').addEventListener('click', exportarClics);

    // Botón limpiar
    document.getElementById('clearBtn').addEventListener('click', limpiarClics);
});

async function cargarClics() {
    const result = await chrome.storage.local.get(['clicks']);
    const clicks = result.clicks || [];
    const clicksList = document.getElementById('clicksList');

    clicksList.innerHTML = '';
    clicks.reverse().forEach(click => {
        const div = document.createElement('div');
        div.className = 'click-item';

        let contenido = `
            <div class="timestamp">
                ${new Date(click.timestampInicio || click.timestamp).toLocaleString()}
            </div>
            <div><strong>${click.tipo || 'click'}</strong></div>
            <div class="url">${click.url || ''}</div>
        `;
        if (click.requests && click.requests.length > 0) {
            contenido += `<div style="margin-top:8px;"><strong>Peticiones HTTP:</strong></div>`;

            click.requests.forEach(req => {
                contenido += `
                    <div style="margin-left:10px; font-size:12px; border-left:2px solid #ccc; padding-left:6px; margin-bottom:6px;">
                        <div><strong>${req.method}</strong> (${req.type})</div>
                        <div>Status: ${req.statusCode}</div>
                        <div class="url">${req.url}</div>
                    </div>
                `;
            });
        }



        if (click.target) {
            contenido += `<div>Elemento: ${click.target.tagName}</div>`;
            if (click.target.text) {
                contenido += `<div>Texto: ${click.target.text}</div>`;
            }
            if (click.target.id) {
                contenido += `<div>ID: ${click.target.id}</div>`;
            }
            if (click.x) {
                contenido += `<div>Posición: X:${click.x}, Y:${click.y}</div>`;
            }
        }
  
        div.innerHTML = contenido;
        clicksList.appendChild(div);
    });
}

function exportarClics() {
    chrome.storage.local.get(['clicks'], (result) => {
        const datos = JSON.stringify(result.clicks, null, 2);
        const blob = new Blob([datos], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        chrome.downloads.download({
            url: url,
            filename: `clics_export_${Date.now()}.json`
        });
    });
}

async function limpiarClics() {
    await chrome.storage.local.set({ clicks: [] });
    await cargarClics();
}