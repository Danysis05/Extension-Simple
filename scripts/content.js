const boton = document.getElementById("btn");
const texto = document.getElementById("texto")

boton.addEventListener("click", function() {
    texto.textContent = "Hola";
});

function cambio(){
    console.log("Hola Daniel");
    texto.textContent="cambio desde la funcion"
}

