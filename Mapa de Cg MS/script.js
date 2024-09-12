let map, markers = [], routingControl;
let obstacles = JSON.parse(localStorage.getItem('obstacles')) || {};
let userLocation = null;
let currentSelectedStreet = null;

// Função para inicializar o mapa
function initMap() {
    // Inicializa o mapa com a vista central em Campo Grande - MS
    map = L.map('map').setView([-20.4697, -54.6201], 13);

    // Adiciona a camada de tiles (mapa) do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Função para obter a localização do usuário
function getUserLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            userLocation = [position.coords.latitude, position.coords.longitude];
            L.marker(userLocation).addTo(map).bindPopup("Você está aqui").openPopup();
            map.setView(userLocation, 13); // Centraliza o mapa na localização do usuário
            updateDebugInfo("Localização do usuário obtida");
        }, function(error) {
            console.error("Erro ao obter localização:", error);
            updateDebugInfo("Falha ao obter localização do usuário");
        });
    } else {
        updateDebugInfo("Geolocalização não suportada pelo navegador");
    }
}

// Atualizar debug info (console na página)
function updateDebugInfo(message) {
    let debugInfo = document.getElementById('debugInfo');
    debugInfo.innerHTML += `${new Date().toLocaleTimeString()}: ${message}<br>`;
    debugInfo.scrollTop = debugInfo.scrollHeight;
}

// Botões e eventos associados (pesquisar, adicionar obstáculo, remover obstáculo, etc.)
document.getElementById('searchButton').addEventListener('click', function() {
    alert("Funcionalidade de pesquisa ainda não implementada!");
});
document.getElementById('addObstacleButton').addEventListener('click', function() {
    alert("Funcionalidade de adicionar obstáculo ainda não implementada!");
});
document.getElementById('removeObstacleButton').addEventListener('click', function() {
    alert("Funcionalidade de remover obstáculo ainda não implementada!");
});
document.getElementById('startRouteButton').addEventListener('click', function() {
    alert("Funcionalidade de iniciar trajeto ainda não implementada!");
});

// Carregar a função de inicialização do mapa e localização ao carregar a página
window.onload = function() {
    initMap();
    getUserLocation();
};
