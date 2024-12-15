let state = 0;

function toggleContent() {
    const imageElement = document.getElementById('middle-image');
    
    switch (state) {
        case 0:
            imageElement.src = 'imgs/gtea.png';  
            state = 1;
            break;
        case 1:
            imageElement.src = 'imgs/tea.png';  
            state = 0;
            break;
    }
}
