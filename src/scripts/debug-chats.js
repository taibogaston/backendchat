const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/chatbot')
  .then(async () => {
    console.log('✅ MongoDB conectado');
    
    // Definir esquemas
    const userSchema = new mongoose.Schema({
      nombre: String,
      email: String,
      password: String,
      emailVerified: Boolean,
      onboardingCompleted: Boolean
    }, { timestamps: true });
    
    const chatSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, required: true },
      partner: {
        nombre: String,
        nacionalidad: String,
        genero: String,
        idioma_objetivo: String
      },
      activo: { type: Boolean, default: true }
    }, { timestamps: true });
    
    const User = mongoose.model('User', userSchema);
    const Chat = mongoose.model('Chat', chatSchema);
    
    // Obtener el usuario más reciente
    const user = await User.findOne({ emailVerified: true }).sort({ createdAt: -1 });
    
    if (!user) {
      console.log('❌ No hay usuarios verificados');
      process.exit(1);
    }
    
    console.log('👤 Usuario encontrado:', {
      id: user._id,
      email: user.email,
      nombre: user.nombre,
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted
    });
    
    // Generar token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || '84b7cfeef6fc2e44391c7d33d5188ba4c7143ea0496e3b5e2d84c0de3674275fcffe4b3f2ca99ce9ca426fb8d5f9f9fd29b6bb32c24549f1f806dbcc9afd36cf');
    console.log('🔑 Token generado:', token.substring(0, 50) + '...');
    
    // Verificar chats en la base de datos (solo activos)
    const dbChats = await Chat.find({ userId: user._id, activo: true }).sort({ createdAt: -1 });
    console.log('📊 Chats activos en BD para este usuario:', dbChats.length);
    
    if (dbChats.length > 0) {
      console.log('📋 Primeros 3 chats en BD:');
      dbChats.slice(0, 3).forEach((chat, index) => {
        console.log(`   ${index + 1}. ${chat.partner.nombre} (${chat.partner.nacionalidad}) - ${chat.partner.idioma_objetivo}`);
        console.log(`      ID: ${chat._id}`);
        console.log(`      Activo: ${chat.activo}`);
        console.log(`      Creado: ${chat.createdAt}`);
      });
    }
    
    // Probar API de chats
    try {
      console.log('\n🌐 Probando API de chats...');
      const response = await fetch('http://localhost:4000/api/chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Status de respuesta:', response.status);
      console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const chats = await response.json();
        console.log('✅ Chats obtenidos via API:', chats.length);
        console.log('📋 Primeros 3 chats via API:');
        chats.slice(0, 3).forEach((chat, index) => {
          console.log(`   ${index + 1}. ${chat.partner.nombre} (${chat.partner.nacionalidad}) - ${chat.partner.idioma_objetivo}`);
          console.log(`      ID: ${chat._id}`);
          console.log(`      Activo: ${chat.activo}`);
          console.log(`      Creado: ${chat.createdAt}`);
        });
        
        // Comparar con BD
        console.log('\n🔍 Comparación BD vs API:');
        console.log(`   BD: ${dbChats.length} chats`);
        console.log(`   API: ${chats.length} chats`);
        console.log(`   Coinciden: ${dbChats.length === chats.length ? '✅' : '❌'}`);
        
      } else {
        const error = await response.text();
        console.log('❌ Error:', error);
      }
    } catch (error) {
      console.log('❌ Error de conexión:', error.message);
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });
