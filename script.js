const sqlite3 = require('sqlite3');

document.addEventListener('DOMContentLoaded', function() {
  const regaSwitch = document.getElementById('rega-switch');
  const luzSwitch = document.getElementById('luz-switch');
  const notificationsContainer = document.querySelector('.notifications');
  let notificationCount = 0; // Contador de notificações
  const temperatureValue = document.querySelector('.value.temperatura');
  const humidityValue = document.querySelector('.value.umidade');
  const ldrValue = document.querySelector('.value.luminosidade');
  const soloValue = document.querySelector('.value.solo');


  function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `[${hours}:${minutes}]`;
  }

  function showNotification(message) {
    if (notificationCount < 3) {
      const notification = document.createElement('div');
      notification.className = 'notification active';
      const currentTime = getCurrentTime();
      notification.textContent = `${currentTime} ${message}`;
      notificationsContainer.appendChild(notification);

      notificationCount++;

      setTimeout(() => {
        notificationsContainer.removeChild(notification);
        notificationCount--;

        // Reabilita os switches quando uma notificação é removida
        regaSwitch.disabled = false;
        luzSwitch.disabled = false;
      }, 2000);

      // Desabilita os switches ao exibir notificação
      regaSwitch.disabled = true;
      luzSwitch.disabled = true;
    }
  }

  regaSwitch.addEventListener('change', function() {
    const message = this.checked ? 'Rega Automática Ativada' : 'Rega Automática Desativada';
    showNotification(message);
  });

  luzSwitch.addEventListener('change', function() {
    const message = this.checked ? 'Luz Automática Ativada' : 'Luz Automática Desativada';
    showNotification(message);
  });

  let lastLuminosidadeStatus = ""; // Variável para armazenar o último status de luminosidade

  function updateDashboardData() {
    fetch('http://10.10.254.147/dados-do-sensor') // Rota no NodeMCU para obter dados
      .then(response => response.json())
      .then(data => {
        // Atualize os elementos do seu dashboard com os dados recebidos
        temperatureValue.textContent = `${data.temperatura} °C`;
        soloValue.textContent = `${data.umidadeSolo}`;
        humidityValue.textContent = `${data.umidade} %`;
        // Converter valor da luminosidade para "ligado" ou "desligado"
        const newLuminosidadeStatus = data.luminosidade < 100 ? "Ligado" : "Desligado";
        if (newLuminosidadeStatus !== lastLuminosidadeStatus) {
          // Verificar se houve uma mudança no status da luminosidade
          const message = newLuminosidadeStatus === "Ligado" ? "Luz Ligada" : "Luz Desligada";
          showNotification(message);
          lastLuminosidadeStatus = newLuminosidadeStatus; // Atualizar o último status
        }

      ldrValue.textContent = newLuminosidadeStatus; // Atualizar a luminosidade
      
      const db = new sqlite3.Database('dados.db', (err) => {
        if (err) {
          console.error('Erro ao abrir o banco de dados:', err.message);
        } else {
          console.log('Banco de dados conectado');
          // Crie a tabela se ela não existir
          db.run('INSERT INTO dados(id,temperatura,umidade,luminosidade,solo) VALUES(null,'+data.temperatura+','+data.umidade+','+data.luminosidade+','+data.umidadeSolo+');'), (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log('Dados inseridos');
            }
          };
        }
      });
  
        // ... outros elementos
      })
      .catch(error => {
        console.error('Erro na requisição:', error);
      });
  }

  

  // Chame a função de atualização quando a página é carregada
  window.addEventListener('load', function() {
    updateDashboardData();
    // Chame a função de atualização a cada 5 segundos (5000 milissegundos)
    setInterval(updateDashboardData, 1000);
  });

});
