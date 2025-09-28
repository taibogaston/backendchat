const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/chatbot')
  .then(() => {
    console.log('✅ MongoDB conectado');
    
    // Definir esquemas simples
    const messageSchema = new mongoose.Schema({
      chatId: { type: mongoose.Schema.Types.ObjectId, required: true },
      sender: { type: String, enum: ['user', 'ia'], required: true },
      content: { type: String, required: true }
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
    
    const Message = mongoose.model('Message', messageSchema);
    const Chat = mongoose.model('Chat', chatSchema);
    
    // Verificar datos
    Chat.find({}).then(chats => {
      console.log(`\n📊 Total de chats: ${chats.length}`);
      
      if (chats.length > 0) {
        console.log('\n💬 Chats encontrados:');
        chats.forEach((chat, index) => {
          console.log(`   ${index + 1}. ID: ${chat._id}`);
          console.log(`      Usuario: ${chat.userId}`);
          console.log(`      Personaje: ${chat.partner.nombre} (${chat.partner.nacionalidad})`);
          console.log(`      Activo: ${chat.activo}`);
          console.log(`      Creado: ${chat.createdAt}`);
        });
        
        // Verificar mensajes del primer chat
        if (chats[0]) {
          Message.find({ chatId: chats[0]._id }).then(messages => {
            console.log(`\n📨 Mensajes en el primer chat: ${messages.length}`);
            
            if (messages.length > 0) {
              console.log('\n📝 Mensajes:');
              messages.forEach((msg, index) => {
                const time = new Date(msg.createdAt).toLocaleTimeString();
                console.log(`   ${index + 1}. [${msg.sender}] ${time}: ${msg.content.substring(0, 50)}...`);
              });
            } else {
              console.log('   ⚠️  No hay mensajes en este chat');
            }
            
            mongoose.disconnect();
          });
        } else {
          mongoose.disconnect();
        }
      } else {
        console.log('   ⚠️  No hay chats en la base de datos');
        mongoose.disconnect();
      }
    });
    
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });
