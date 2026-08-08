customElements.whenDefined('app-footer').then(() => {

    const footer = document.querySelector('app-footer footer');
    const root = document.documentElement;

    function ajustarFAQ() {

        if (!footer) return;

        const alturaFooter = footer.offsetHeight;

        root.style.setProperty(
            '--faq-bottom',
            `${alturaFooter + 16}px`
        );
    }

    ajustarFAQ();

    window.addEventListener('resize', ajustarFAQ);
});