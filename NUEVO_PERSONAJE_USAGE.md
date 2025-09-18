# Funcionalidad de Nuevos Personajes

## Descripción
Tu aplicación ya tiene implementada la funcionalidad para detectar cuando la IA presenta un nuevo personaje y crear automáticamente un nuevo chat con ese personaje. Cuando esto sucede, recibirás el ID del nuevo chat para poder navegar a él desde el frontend.

## Cómo Funciona

### 1. Detección Automática
Cuando la IA presenta un nuevo personaje en su respuesta, el sistema:
- Detecta el patrón `NUEVO_AMIGO: {...}` en la respuesta
- Extrae los datos del personaje (nombre, nacionalidad, género, idioma)
- Crea un nuevo chat con esos datos
- Devuelve la información del nuevo chat en la respuesta

### 2. Estructura de Respuesta
Cuando envías un mensaje y la IA presenta un nuevo personaje, recibirás:

```json
{
  "userMsg": {
    "_id": "...",
    "chatId": "...",
    "sender": "user",
    "content": "Quiero aprender inglés",
    "createdAt": "..."
  },
  "aiMsg": {
    "_id": "...",
    "chatId": "...",
    "sender": "ia",
    "content": "Claro, te presento a Emily de Estados Unidos 🇺🇸...",
    "createdAt": "..."
  },
  "newChat": {
    "id": "nuevo_chat_id_aqui",
    "partner": {
      "nombre": "Emily",
      "nacionalidad": "Estados Unidos",
      "genero": "F",
      "idioma_objetivo": "inglés"
    },
    "activo": true,
    "createdAt": "..."
  }
}
```

### 3. Endpoints Disponibles

#### Enviar Mensaje (con detección de nuevos personajes)
```
POST /api/messages/:chatId
```
Body:
```json
{
  "sender": "user",
  "content": "Quiero aprender inglés, puedes presentarme a alguien de EEUU?"
}
```

#### Obtener Chats de un Usuario
```
GET /api/chats/:userId
```

#### Obtener Chat Específico
```
GET /api/chats/chat/:chatId
```

#### Crear Chat Manualmente
```
POST /api/chats
```
Body:
```json
{
  "userId": "user_id_aqui",
  "partner": {
    "nombre": "Emily",
    "nacionalidad": "Estados Unidos",
    "genero": "F",
    "idioma_objetivo": "inglés"
  }
}
```

## Ejemplo de Uso en Frontend

```javascript
// Enviar mensaje y detectar nuevo personaje
async function sendMessage(chatId, message) {
  const response = await fetch(`/api/messages/${chatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sender: 'user',
      content: message
    })
  });
  
  const data = await response.json();
  
  // Si hay un nuevo chat, navegar a él
  if (data.newChat) {
    console.log('Nuevo personaje presentado:', data.newChat.partner.nombre);
    console.log('Nuevo chat ID:', data.newChat.id);
    
    // Navegar al nuevo chat
    window.location.href = `/chat/${data.newChat.id}`;
    // O usar tu sistema de routing
    // router.push(`/chat/${data.newChat.id}`);
  }
  
  return data;
}

// Ejemplo de uso
sendMessage('chat_actual_id', 'Quiero aprender francés, puedes presentarme a alguien de Francia?');
```

## Flujo Completo

1. **Usuario envía mensaje** pidiendo un nuevo personaje
2. **IA responde** presentando el personaje + línea `NUEVO_AMIGO: {...}`
3. **Sistema detecta** el patrón y crea nuevo chat
4. **Respuesta incluye** información del nuevo chat
5. **Frontend navega** al nuevo chat usando el ID proporcionado

## Validaciones

El sistema valida que el nuevo personaje tenga:
- ✅ `nombre`: Nombre del personaje
- ✅ `nacionalidad`: País de origen
- ✅ `genero`: "M" o "F"
- ✅ `idioma_objetivo`: Idioma que enseñará

Si falta algún campo, el sistema no creará el nuevo chat y continuará normalmente.

## Manejo de Errores

Si hay algún error al crear el nuevo chat:
- Se registra el error en la consola
- El mensaje de la IA se guarda normalmente
- No se interrumpe la conversación
- El frontend recibe `newChat: null`

