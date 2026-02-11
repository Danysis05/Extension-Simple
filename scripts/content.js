// Escuchar todos los clics en la página
document.addEventListener('click', function (event) {
    // Obtener información detallada del clic
    const clickData = {
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
        x: event.clientX,
        y: event.clientY,
        target: {
            tagName: event.target.tagName,
            id: event.target.id,
            className: event.target.className,
            text: event.target.innerText?.substring(0, 50),
            href: event.target.href,
            value: event.target.value
        },
        tipo: 'click'
    };

    // Enviar al background script
    chrome.runtime.sendMessage({
        action: 'guardarClick',
        data: clickData
    });
}, true);

// También capturar clics en elementos específicos
document.addEventListener('mousedown', function (event) {
    if (event.button === 2) { // Clic derecho
        const clickDerecho = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            tipo: 'click_derecho',
            target: event.target.tagName
        };

        chrome.runtime.sendMessage({
            action: 'guardarClick',
            data: clickDerecho
        });
    }
}, true);