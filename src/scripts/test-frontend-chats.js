const jwt = require('jsonwebtoken');

// Simular el token que debería tener el frontend
const userId = '68d9a61b94a9a091163f2c75'; // ID del usuario de las pruebas anteriores
const token = jwt.sign({ userId }, process.env.JWT_SECRET || '84b7cfeef6fc2e44391c7d33d5188ba4c7143ea0496e3b5e2d84c0de3674275fcffe4b3f2ca99ce9ca426fb8d5f9f9fd29b6bb32c24549f1f806dbcc9afd36cf');

console.log('🔑 Token para frontend:', token.substring(0, 50) + '...');
console.log('👤 User ID:', userId);

// Probar la misma URL que usa el frontend
const frontendUrl = 'http://localhost:4000/api/chats';
console.log('🌐 URL del frontend:', frontendUrl);

fetch(frontendUrl, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
})
.then(response => {
  console.log('📡 Status:', response.status);
  console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));
  
  if (response.ok) {
    return response.json();
  } else {
    return response.text().then(text => {
      throw new Error(`HTTP ${response.status}: ${text}`);
    });
  }
})
.then(data => {
  console.log('✅ Datos recibidos:', data);
  console.log('📊 Número de chats:', data.length);
  
  if (data.length > 0) {
    console.log('📋 Primeros chats:');
    data.slice(0, 3).forEach((chat, index) => {
      console.log(`   ${index + 1}. ${chat.partner.nombre} (${chat.partner.nacionalidad}) - ${chat.partner.idioma_objetivo}`);
    });
  }
})
.catch(error => {
  console.error('❌ Error:', error.message);
});
