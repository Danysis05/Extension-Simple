function enviarMensajeSeguro(data) {
    try {
        if (!chrome.runtime?.id) return;

        chrome.runtime.sendMessage(
            {
                action: 'guardarClick',
                data: data
            },
            () => {
                if (chrome.runtime.lastError) {
                    // Evita que explote cuando el contexto se invalida
                    console.log("Mensaje no enviado:", chrome.runtime.lastError.message);
                }
            }
        );
    } catch (error) {
        console.warn("Extensión no disponible:", error);
    }
}



// Escuchar todos los clics en la página
document.addEventListener('click', function (event) {

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

    enviarMensajeSeguro(clickData);

}, true);


// Capturar clic derecho
document.addEventListener('mousedown', function (event) {

    if (event.button === 2) {

        const clickDerecho = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            tipo: 'click_derecho',
            target: {
                tagName: event.target.tagName
            }
        };

        enviarMensajeSeguro(clickDerecho);
    }

}, true);
// acceder al usuario logueado
function detectarUsuario() {
    const userElement = document.querySelector('.access-User p strong');

    if (userElement) {
        const nombre = userElement.textContent.trim();
        console.log("Usuario encontrado:", nombre);

        chrome.runtime.sendMessage({
            action: 'guardarUsuario',
            nombre: nombre
        });
    } else {
        console.log("No se encontró el usuario");
    }
}

window.addEventListener('load', () => {
    setTimeout(detectarUsuario, 1500);
});
