document.addEventListener ('hidden.bs.modal', function () {
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '0px';
});

// Aqui mostramos el boton para volver al inicio segun el scroll de la página wb
const btnScrollTop = document.getElementById("btnScrollTop");

window.addEventListener("scroll", () => {
    // Aparece después de bajar 300px
    if (window.scrollY > 300) {
        btnScrollTop.style.display = "flex";
    } else {
        btnScrollTop.style.display = "none";
    }
});

btnScrollTop.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});