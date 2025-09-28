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
      emailVerified: { type: Boolean, default: false },
      onboardingCompleted: { type: Boolean, default: false }
    });
    
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
    
    // Obtener usuario de prueba
    const testUser = await User.findOne({ email: 'gaston3@gmail.com' });
    if (!testUser) {
      console.error('❌ Usuario de prueba no encontrado');
      process.exit(1);
    }
    
    console.log(`👤 Usuario de prueba: ${testUser.email}`);
    
    // Simular creación de chat con James
    const character = {
      nombre: "James",
      nacionalidad: "Estados Unidos",
      genero: "M",
      idioma_objetivo: "inglés"
    };
    
    console.log('\n🧪 Probando creación de chat con James...');
    
    // Verificar si ya existe
    const existingChat = await Chat.findOne({
      userId: testUser._id,
      "partner.nombre": character.nombre,
      "partner.nacionalidad": character.nacionalidad,
      "partner.idioma_objetivo": character.idioma_objetivo,
      activo: true
    });
    
    if (existingChat) {
      console.log('📱 Chat existente encontrado:', existingChat._id);
    } else {
      console.log('🆕 Creando nuevo chat...');
      const newChat = await Chat.create({
        userId: testUser._id,
        partner: character,
        activo: true
      });
      console.log('✅ Nuevo chat creado:', newChat._id);
    }
    
    // Verificar total de chats
    const totalChats = await Chat.find({ userId: testUser._id, activo: true });
    console.log(`\n📊 Total de chats del usuario: ${totalChats.length}`);
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });
