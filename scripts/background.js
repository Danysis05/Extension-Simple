// Escuchar mensajes del content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'guardarClick') {
        guardarClick(message.data);
    }
});

// Función para guardar clics en storage
async function guardarClick(clickData) {
    try {
        // Obtener clics existentes
        const result = await chrome.storage.local.get(['clicks']);
        const clicks = result.clicks || [];

        // Agregar nuevo clic
        clicks.push({
            ...clickData,
            tabId: clickData.tabId,
            ventana: Date.now()
        });

        // Mantener solo últimos 100 clics (opcional)
        if (clicks.length > 100) {
            clicks.shift();
        }

        // Guardar en storage
        await chrome.storage.local.set({ clicks });

        console.log('Click guardado:', clickData);
    } catch (error) {
        console.error('Error guardando click:', error);
    }
}

// Detectar navegación
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) { // Solo frame principal
        chrome.tabs.get(details.tabId, (tab) => {
            const navegacion = {
                url: details.url,
                timestamp: new Date().toISOString(),
                tipo: 'navegacion',
                tabId: details.tabId
            };
            guardarClick(navegacion);
        });
    }
});

// Cuando se instala la extensión
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ clicks: [] });
});