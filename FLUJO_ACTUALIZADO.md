# Flujo Actualizado - Sistema de Chat de Idiomas

## 🎯 **Flujo Correcto Implementado**

### 1. **Registro de Usuario** (`POST /api/users/register`)
El usuario se registra con sus preferencias:

```json
{
  "nombre": "Juan",
  "email": "juan@email.com",
  "idioma_principal": "español",
  "idioma_objetivo": "inglés",
  "preferencia_genero": "F",
  "nivel_idioma": "principiante",
  "intereses": ["viajes", "música", "deportes"],
  "pais": "México",
  "edad": 25
}
```

**Respuesta:**
```json
{
  "user": {
    "id": "user_id",
    "nombre": "Juan",
    "email": "juan@email.com",
    "idioma_objetivo": "inglés",
    "nivel_idioma": "principiante",
    "intereses": ["viajes", "música", "deportes"],
    "pais": "México",
    "edad": 25
  },
  "defaultChat": {
    "id": "chat_id_por_defecto",
    "partner": {
      "nombre": "Emily",
      "nacionalidad": "Estados Unidos",
      "genero": "F",
      "idioma_objetivo": "inglés"
    },
    "activo": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. **Chat por Defecto**
- Se crea automáticamente un chat con un personaje según el idioma objetivo
- El usuario puede empezar a chatear inmediatamente
- El personaje responde como él mismo (Emily, Mateo, etc.)

### 3. **Solicitar Nuevo Personaje**
Cuando el usuario pide un nuevo personaje:

**Mensaje:** `"Quiero aprender francés, puedes presentarme a alguien de Francia?"`

**Respuesta de la IA:**
```
¡Por supuesto! Te presento a Marie de Francia 🇫🇷. Es profesora de francés y le encanta enseñar mediante conversaciones sobre arte y cultura. Es muy paciente y divertida. ¡Puedes empezar a chatear con ella!

NUEVO_AMIGO: {"nombre":"Marie","nacionalidad":"Francia","genero":"F","idioma_objetivo":"francés"}
```

**Respuesta del API:**
```json
{
  "userMsg": { /* mensaje del usuario */ },
  "aiMsg": { /* respuesta de la IA */ },
  "newChat": {
    "id": "nuevo_chat_id",
    "partner": {
      "nombre": "Marie",
      "nacionalidad": "Francia",
      "genero": "F",
      "idioma_objetivo": "francés"
    },
    "activo": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. **Sistema Tipo WhatsApp**
- El usuario puede cambiar entre chats usando los IDs
- Cada chat tiene su propio personaje
- Los mensajes se guardan por chat
- El usuario puede tener múltiples conversaciones simultáneas

## 🔧 **Endpoints Disponibles**

### Usuarios
- `POST /api/users/register` - Registrar usuario
- `GET /api/users/:userId` - Obtener información del usuario
- `PATCH /api/users/:userId/preferences` - Actualizar preferencias

### Chats
- `GET /api/chats/:userId` - Obtener todos los chats del usuario
- `GET /api/chats/chat/:chatId` - Obtener chat específico
- `POST /api/chats` - Crear chat manualmente
- `PATCH /api/chats/:chatId/deactivate` - Desactivar chat

### Mensajes
- `POST /api/messages/:chatId` - Enviar mensaje (con detección de nuevos personajes)

## 🎭 **Personajes por Defecto por Idioma**

### Español
- **F**: Camila (Colombia)
- **M**: Mateo (España)
- **A**: Sofia (México)

### Inglés
- **F**: Emily (Estados Unidos)
- **M**: James (Reino Unido)
- **A**: Sarah (Canadá)

### Francés
- **F**: Marie (Francia)
- **M**: Pierre (Francia)
- **A**: Claire (Francia)

### Portugués
- **F**: Ana (Brasil)
- **M**: João (Brasil)
- **A**: Isabela (Brasil)

### Alemán
- **F**: Anna (Alemania)
- **M**: Hans (Alemania)
- **A**: Lisa (Alemania)

## 📱 **Flujo en el Frontend**

1. **Registro**: Usuario se registra con preferencias
2. **Chat Inicial**: Se abre automáticamente el chat por defecto
3. **Conversación**: Usuario chatea con el personaje
4. **Nuevo Personaje**: Usuario pide nuevo personaje
5. **Presentación**: IA presenta al personaje y devuelve nuevo chat ID
6. **Navegación**: Frontend navega al nuevo chat
7. **Múltiples Chats**: Usuario puede cambiar entre chats como WhatsApp

## ✅ **Problemas Solucionados**

1. ✅ **Presentación de personajes**: Solo presenta, no habla como ellos
2. ✅ **Registro completo**: Recopila todas las preferencias del usuario
3. ✅ **Chat por defecto**: Se crea automáticamente según idioma objetivo
4. ✅ **Sistema tipo WhatsApp**: Múltiples chats con IDs únicos
5. ✅ **Detección de nuevos personajes**: Funciona correctamente
6. ✅ **Validaciones**: Datos completos y validados

