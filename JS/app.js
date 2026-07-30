
document.addEventListener ('DOMContentLoaded', () => {

    const menuToggle = document.getElementById ('menuToggle');
    const navbarMenu = document.getElementById ('navbarMenu');

    if (menuToggle && navbarMenu) {
        menuToggle.addEventListener ('click', () => {
            navbarMenu.classList.toggle ('hidden');
        });
    }


    document.querySelectorAll ('[data-bs-toggle="modal"]').forEach (trigger => {
        trigger.addEventListener ('click', () => {
            const targetId = trigger.getAttribute ('data-bs-target');
            const modal = document.querySelector (targetId);
            if (modal) {
                modal.classList.remove ('hidden');
                modal.classList.add ('flex');
                document.body.classList.add ('overflow-hidden');
            }
        });
    });


    document.querySelectorAll ('.close-modal').forEach (closeBtn => {
        closeBtn.addEventListener ('click', () => {
            const modal = closeBtn.closest ('.fixed');
            if (modal) {
                modal.classList.remove ('flex');
                modal.classList.add ('hidden');
                document.body.classList.remove ('overflow-hidden');
            }
        });
    });


    document.querySelectorAll ('.fixed').forEach (modal => {
        modal.addEventListener ('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove ('flex');
                modal.classList.add ('hidden');
                document.body.classList.remove ('overflow-hidden');
            }
        });
    });

});