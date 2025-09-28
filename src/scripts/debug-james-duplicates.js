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
    
    // Obtener usuario de prueba
    const testUserId = '68d9aa245c32dfcf6e02f49f';
    
    console.log('🔍 Investigando chats duplicados de James...');
    
    // Buscar todos los chats de James para este usuario
    const jamesChats = await Chat.find({
      userId: testUserId,
      "partner.nombre": "James",
      "partner.nacionalidad": "Estados Unidos",
      activo: true
    }).sort({ createdAt: 1 });
    
    console.log(`📊 Total de chats de James: ${jamesChats.length}`);
    
    if (jamesChats.length > 0) {
      console.log('\n📋 Detalles de cada chat:');
      jamesChats.forEach((chat, index) => {
        console.log(`\n${index + 1}. Chat ID: ${chat._id}`);
        console.log(`   Nombre: ${chat.partner.nombre}`);
        console.log(`   Nacionalidad: ${chat.partner.nacionalidad}`);
        console.log(`   Idioma: ${chat.partner.idioma_objetivo}`);
        console.log(`   Género: ${chat.partner.genero}`);
        console.log(`   Activo: ${chat.activo}`);
        console.log(`   Creado: ${chat.createdAt}`);
        console.log(`   Actualizado: ${chat.updatedAt}`);
      });
      
      // Verificar si son exactamente iguales
      if (jamesChats.length >= 2) {
        const chat1 = jamesChats[0];
        const chat2 = jamesChats[1];
        
        console.log('\n🔍 Comparando los dos chats:');
        console.log(`   Mismo nombre: ${chat1.partner.nombre === chat2.partner.nombre}`);
        console.log(`   Misma nacionalidad: ${chat1.partner.nacionalidad === chat2.partner.nacionalidad}`);
        console.log(`   Mismo idioma: ${chat1.partner.idioma_objetivo === chat2.partner.idioma_objetivo}`);
        console.log(`   Mismo género: ${chat1.partner.genero === chat2.partner.genero}`);
        console.log(`   Mismo userId: ${chat1.userId.toString() === chat2.userId.toString()}`);
        console.log(`   Mismo activo: ${chat1.activo === chat2.activo}`);
        
        // Verificar la diferencia de tiempo
        const timeDiff = Math.abs(chat2.createdAt - chat1.createdAt);
        console.log(`   Diferencia de tiempo: ${timeDiff}ms`);
        
        if (timeDiff < 1000) {
          console.log('⚠️  Los chats se crearon casi simultáneamente - posible race condition');
        }
      }
    }
    
    // Probar la query que usa el backend
    console.log('\n🧪 Probando la query del backend...');
    const backendQuery = await Chat.findOne({
      userId: testUserId,
      "partner.nombre": "James",
      "partner.nacionalidad": "Estados Unidos",
      "partner.idioma_objetivo": "inglés",
      activo: true
    });
    
    console.log(`📱 Query del backend encuentra: ${backendQuery ? 'SÍ' : 'NO'}`);
    if (backendQuery) {
      console.log(`   Chat encontrado: ${backendQuery._id}`);
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });
