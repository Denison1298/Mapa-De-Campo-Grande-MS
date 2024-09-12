let map, markers = [], routingControl;
let obstacles = JSON.parse(localStorage.getItem('obstacles')) || [];
let userLocation = JSON.parse(localStorage.getItem('userLocation')) || null;

// Função para inicializar o mapa
function initMap() {
    map = L.map('map').setView([-20.4697, -54.6201], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Carrega obstáculos existentes
    obstacles.forEach(obstacle => {
        addObstacleToMap(obstacle);
    });
    displayObstacleList();  // Exibe a lista de obstáculos no canto
}

// Função para obter a localização do usuário
function getUserLocation() {
    if (userLocation) {
        // Se a localização já está salva no localStorage, usá-la diretamente
        L.marker(userLocation).addTo(map).bindPopup("Você está aqui").openPopup();
        map.setView(userLocation, 13);
        updateDebugInfo("Localização do usuário carregada do armazenamento.");
    } else if ("geolocation" in navigator) {
        // Caso contrário, solicitar a localização do usuário
        navigator.geolocation.getCurrentPosition(function(position) {
            userLocation = [position.coords.latitude, position.coords.longitude];
            localStorage.setItem('userLocation', JSON.stringify(userLocation)); // Salva a localização
            L.marker(userLocation).addTo(map).bindPopup("Você está aqui").openPopup();
            map.setView(userLocation, 13);
            updateDebugInfo("Localização do usuário obtida e salva.");
        }, function(error) {
            console.error("Erro ao obter localização:", error);
            updateDebugInfo("Falha ao obter localização do usuário");
        });
    } else {
        updateDebugInfo("Geolocalização não suportada pelo navegador");
    }
}

// Função para geocodificar um endereço
function geocodeAddress(address, callback) {
    if (!address || address.trim() === '') {
        callback("O endereço fornecido é inválido ou está vazio.");
        return;
    }

    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}, Campo Grande, MS&format=json&accept-language=pt-BR&limit=1`;

    fetch(geocodeUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error("Falha na requisição à API de geocodificação.");
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                let location = {
                    lat: data[0].lat,
                    lon: data[0].lon,
                    display_name: data[0].display_name
                };
                callback(null, location);
            } else {
                callback("Endereço não encontrado. Verifique o endereço e tente novamente.");
            }
        })
        .catch(error => {
            callback(`Erro ao geocodificar o endereço: ${error.message}`);
        });
}

// Função para iniciar o trajeto
function startRoute() {
    if (!userLocation) {
        alert("Localização do usuário não encontrada. Por favor, permita o acesso à sua localização.");
        return;
    }

    const destinationInput = prompt("Digite o endereço de destino:");

    if (destinationInput) {
        geocodeAddress(destinationInput, function(error, location) {
            if (error) {
                alert(error);
            } else {
                if (routingControl) {
                    map.removeControl(routingControl);  // Remove a rota anterior, se houver
                }
                
                routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(userLocation[0], userLocation[1]),
                        L.latLng(location.lat, location.lon)
                    ],
                    routeWhileDragging: true
                }).addTo(map);

                updateDebugInfo(`Rota iniciada para ${location.display_name}`);
            }
        });
    } else {
        alert("Endereço de destino inválido.");
    }
}

// Função para atualizar o debug info
function updateDebugInfo(message) {
    let debugInfo = document.getElementById('debugInfo');
    debugInfo.innerHTML += `${new Date().toLocaleTimeString()}: ${message}<br>`;
    debugInfo.scrollTop = debugInfo.scrollHeight;
}

// Pesquisar rua e exibir no mapa
document.getElementById('searchButton').addEventListener('click', function() {
    let query = document.getElementById('searchInput').value;
    if (query) {
        geocodeAddress(query, function(error, location) {
            if (error) {
                alert(error);
            } else {
                map.setView([location.lat, location.lon], 16);
                L.marker([location.lat, location.lon]).addTo(map).bindPopup(location.display_name).openPopup();
                updateDebugInfo(`Local encontrado: ${location.display_name}`);

                // Verifica se há obstáculos nesta rua
                let foundObstacles = obstacles.filter(obstacle => obstacle.street.toLowerCase().includes(query.toLowerCase()));
                if (foundObstacles.length > 0) {
                    let obstacleInfo = foundObstacles.map(o => `${o.street}: ${o.description}`).join('\n');
                    alert(`Obstáculos nesta rua:\n${obstacleInfo}`);
                }
            }
        });
    }
});

// Adicionar obstáculo com nome da rua e descrição
document.getElementById('addObstacleButton').addEventListener('click', function() {
    document.getElementById('obstacleModal').style.display = 'block';
});

document.getElementById('confirmObstacle').addEventListener('click', function() {
    let streetName = document.getElementById('streetNameInput').value;
    let description = document.getElementById('obstacleDescription').value;

    if (streetName && description) {
        geocodeAddress(streetName, function(error, location) {
            if (error) {
                alert(error);
            } else {
                let obstacle = {
                    description: description,
                    position: [location.lat, location.lon],
                    street: location.display_name
                };
                obstacles.push(obstacle);
                localStorage.setItem('obstacles', JSON.stringify(obstacles));
                addObstacleToMap(obstacle);
                displayObstacleList();  // Atualiza a lista de obstáculos
                document.getElementById('obstacleModal').style.display = 'none';
                updateDebugInfo(`Obstáculo adicionado na rua ${location.display_name}`);
            }
        });
    } else {
        alert("Por favor, preencha o nome da rua e a descrição do obstáculo.");
    }
});

// Função para adicionar obstáculo no mapa
function addObstacleToMap(obstacle) {
    L.marker(obstacle.position, {icon: L.divIcon({className: 'obstacle-icon'})})
        .addTo(map)
        .bindPopup(`${obstacle.street}: ${obstacle.description}`);
}

// Exibir lista de obstáculos no canto superior direito
function displayObstacleList() {
    let obstacleList = document.getElementById('obstacleList');
    obstacleList.innerHTML = '';
    if (obstacles.length > 0) {
        obstacles.forEach(obstacle => {
            let obstacleItem = document.createElement('div');
            obstacleItem.textContent = `${obstacle.street}: ${obstacle.description}`;
            obstacleList.appendChild(obstacleItem);
        });
    } else {
        obstacleList.innerHTML = '<p>Nenhum obstáculo cadastrado</p>';
    }
}

// Remover obstáculo
document.getElementById('removeObstacleButton').addEventListener('click', function() {
    let removed = obstacles.pop();
    if (removed) {
        localStorage.setItem('obstacles', JSON.stringify(obstacles));
        map.eachLayer(function (layer) {
            if (layer instanceof L.Marker && layer.getPopup().getContent().includes(removed.description)) {
                map.removeLayer(layer);
            }
        });
        displayObstacleList();  // Atualiza a lista de obstáculos
        updateDebugInfo("Último obstáculo removido");
    } else {
        alert("Nenhum obstáculo para remover.");
    }
});

// Fechar modal
document.querySelector('.close').addEventListener('click', function() {
    document.getElementById('obstacleModal').style.display = 'none';
});

// Botão de iniciar trajeto
document.getElementById('startRouteButton').addEventListener('click', startRoute);

// Carregar o mapa e localização ao carregar a página
window.onload = function() {
    initMap();
    getUserLocation();  // Carrega localização do localStorage ou pede permissão se necessário
};
