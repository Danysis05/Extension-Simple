document.addEventListener('DOMContentLoaded', async () => {
    await cargarClics();

    // Botón exportar
    document.getElementById('exportBtn').addEventListener('click', exportarClics);

    // Botón limpiar
    document.getElementById('clearBtn').addEventListener('click', limpiarClics);
});
// función para acortar las urls
function acortarURL(url){
    if(url == null || url == ""){
        return console.log("url no encontrada")
    }
    const urlshort = new URL(url);
    return urlshort.hostname + urlshort.pathname;

}
async function cargarClics() {
    const [{ clicks = [] }, { usuarioActual }] = await Promise.all([
        chrome.storage.local.get(['clicks']),
        chrome.storage.local.get(['usuarioActual'])
    ]);

    const username = usuarioActual || 'Usuario desconocido';
    const clicksList = document.getElementById('clicksList');

    clicksList.innerHTML = '';

    [...clicks].reverse().forEach(click => {
        const card = crearCard(click, username);
        clicksList.appendChild(card);
    });
}
function crearCard(click, username) {
    const div = document.createElement('div');
    div.className = 'click-card';

    div.innerHTML = `
        <div class="card-header">
            <span class="timestamp">
                ${new Date(click.timestampInicio || click.timestamp).toLocaleString()}
            </span>
            <span class="user">Usuario: ${username}</span>
        </div>

        <div class="card-body">
            <div class="tipo">${click.tipo || 'click'}</div>
            <div class="url-corta">${acortarURL(click.url)}</div>

            <details>
                <summary>Ver detalles</summary>
                <div class="url-completa">${click.url || ''}</div>
                ${renderRequests(click.requests)}
                ${renderTarget(click.target, click)}
            </details>
        </div>
    `;

    return div;
}
function renderRequests(requests = []) {
    if (!requests.length) return '';

    return `
        <div class="requests">
            <h4>Peticiones HTTP</h4>
            ${requests.map(req => `
                <div class="request-item">
                    <div><strong>${req.method}</strong> (${req.type})</div>
                    <div>Status: ${req.statusCode}</div>
                    <div class="small-url">${req.url}</div>
                </div>
            `).join('')}
        </div>
    `;
}
function renderTarget(target, click) {
    if (!target) return '';

    return `
        <div class="target-info">
            <div>Elemento: ${target.tagName}</div>
            ${target.text ? `<div>Texto: ${target.text}</div>` : ''}
            ${target.id ? `<div>ID: ${target.id}</div>` : ''}
            ${click.x ? `<div>Posicion: X:${click.x}, Y:${click.y}</div>` : ''}
        </div>
    `;
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