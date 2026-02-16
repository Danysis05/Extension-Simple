
// Escuchar mensajes del content script

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'guardarClick') {
        guardarClick(message.data);
    }
});


// Función para guardar en storage

async function guardarClick(data) {
    try {
        const result = await chrome.storage.local.get(['clicks']);
        const clicks = result.clicks || [];

        clicks.push({
            ...data,
            guardadoEn: new Date().toISOString()
        });

        // Mantener solo últimos 100 registros
        if (clicks.length > 100) {
            clicks.shift();
        }

        await chrome.storage.local.set({ clicks });

        console.log('Registro guardado:', data.tipo);

    } catch (error) {
        console.error('Error guardando registro:', error);
    }
}


// Almacén temporal de navegaciones activas

const navegacionesActivas = {};



// Detectar inicio de nueva navegación

chrome.webNavigation.onBeforeNavigate.addListener((details) => {

    if (details.frameId === 0) {

        const navegacionAnterior = navegacionesActivas[details.tabId];

        if (navegacionAnterior) {
            guardarClick(navegacionAnterior);
            delete navegacionesActivas[details.tabId];
        }
    }
});



// Detectar navegación completada

chrome.webNavigation.onCompleted.addListener((details) => {

    if (details.frameId === 0) {

        navegacionesActivas[details.tabId] = {
            tipo: "navegacion",
            url: details.url,
            tabId: details.tabId,
            timestampInicio: new Date().toISOString(),
            requests: []
        };
    }
});



// Detectar peticiones HTTP

chrome.webRequest.onCompleted.addListener(
    function(details) {

        // Ignorar peticiones internas o sin pestaña
        console.log("Detectada:", details.url, "Tipo:", details.type);
        if (
            details.url.startsWith("chrome-extension://") ||
            details.tabId < 0
        ) {
            return;
        }

        const requestData = {
            url: details.url,
            method: details.method,
            statusCode: details.statusCode,
            type: details.type,
            timestamp: new Date().toISOString()
        };

        const navegacion = navegacionesActivas[details.tabId];

        if (navegacion) {
            navegacion.requests.push(requestData);
        }

    },
     { urls: ["<all_urls>"] }

);


// Guardar navegación si se cierra pestaña

chrome.tabs.onRemoved.addListener((tabId) => {

    const navegacion = navegacionesActivas[tabId];

    if (navegacion) {
        guardarClick(navegacion);
        delete navegacionesActivas[tabId];
    }
});



// Inicializar storage al instalar

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ clicks: [] });
});

chrome.runtime.onMessage.addListener((message) => {

    if (message.action === 'guardarUsuario') {
        chrome.storage.local.set({ usuarioActual: message.nombre });
    }

});

