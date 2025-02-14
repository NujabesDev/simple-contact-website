let state = 0;

function toggleContent() {
    const imageElement = document.getElementById('middle-image');
    const headingElement = document.querySelector('.main-text');  

    if (state === 0) {
        imageElement.src = 'imgs/gtea.webp';
        headingElement.classList.add('main-text-inverse'); 
        state = 1;
    } else {
        imageElement.src = 'imgs/tea.webp';
        headingElement.classList.remove('main-text-inverse'); 
        state = 0;
    }
}
