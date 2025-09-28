const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/chatbot')
  .then(async () => {
    console.log('✅ MongoDB conectado');
    
    // Definir esquemas
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
    
    const Chat = mongoose.model('Chat', chatSchema);
    
    console.log('🧹 Iniciando limpieza de chats duplicados...');
    
    // Obtener todos los chats
    const allChats = await Chat.find({ activo: true }).sort({ createdAt: 1 });
    console.log(`📊 Total de chats activos: ${allChats.length}`);
    
    // Agrupar por usuario y personaje
    const groupedChats = {};
    
    allChats.forEach(chat => {
      const key = `${chat.userId}_${chat.partner.nombre}_${chat.partner.nacionalidad}`;
      if (!groupedChats[key]) {
        groupedChats[key] = [];
      }
      groupedChats[key].push(chat);
    });
    
    console.log(`📋 Grupos únicos de usuario-personaje: ${Object.keys(groupedChats).length}`);
    
    let duplicatesRemoved = 0;
    
    // Procesar cada grupo
    for (const [key, chats] of Object.entries(groupedChats)) {
      if (chats.length > 1) {
        console.log(`\n🔍 Grupo con duplicados: ${key}`);
        console.log(`   Chats duplicados: ${chats.length}`);
        
        // Mantener el más antiguo (primero en el array)
        const keepChat = chats[0];
        const duplicateChats = chats.slice(1);
        
        console.log(`   ✅ Manteniendo: ${keepChat._id} (${keepChat.createdAt})`);
        
        // Desactivar los duplicados
        for (const duplicate of duplicateChats) {
          console.log(`   🗑️  Desactivando: ${duplicate._id} (${duplicate.createdAt})`);
          await Chat.findByIdAndUpdate(duplicate._id, { activo: false });
          duplicatesRemoved++;
        }
      }
    }
    
    console.log(`\n🎉 Limpieza completada:`);
    console.log(`   Chats duplicados removidos: ${duplicatesRemoved}`);
    
    // Verificar resultado
    const remainingChats = await Chat.find({ activo: true });
    console.log(`   Chats activos restantes: ${remainingChats.length}`);
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });
