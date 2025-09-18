# Test de Personajes - Verificar que cada chat tenga su personaje correcto

## 🧪 **Prueba Paso a Paso**

### **Paso 1: Registrar Usuario**
```bash
POST http://localhost:4000/api/users/register
{
  "nombre": "Juan",
  "email": "juan@test.com",
  "idioma_principal": "español",
  "idioma_objetivo": "inglés",
  "preferencia_genero": "F",
  "nivel_idioma": "principiante",
  "intereses": ["viajes"],
  "pais": "México",
  "edad": 25
}
```

**Resultado esperado:** Chat por defecto con Emily (Estados Unidos, inglés)

### **Paso 2: Chatear con Emily (Chat por defecto)**
```bash
POST http://localhost:4000/api/messages/CHAT_ID_DEFAULT
{
  "sender": "user",
  "content": "Hi Emily! What's your name and where are you from?"
}
```

**Resultado esperado:** Emily responde como Emily de Estados Unidos

### **Paso 3: Solicitar nuevo personaje**
```bash
POST http://localhost:4000/api/messages/CHAT_ID_DEFAULT
{
  "sender": "user",
  "content": "I want to learn French, can you introduce me to someone from France?"
}
```

**Resultado esperado:** Emily presenta a Marie y devuelve nuevo chat ID

### **Paso 4: Chatear con Marie (Nuevo chat)**
```bash
POST http://localhost:4000/api/messages/NUEVO_CHAT_ID
{
  "sender": "user",
  "content": "Bonjour! What's your name and where are you from?"
}
```

**Resultado esperado:** Marie responde como Marie de Francia

### **Paso 5: Volver a Emily**
```bash
POST http://localhost:4000/api/messages/CHAT_ID_DEFAULT
{
  "sender": "user",
  "content": "Hi Emily! I'm back. How are you?"
}
```

**Resultado esperado:** Emily responde como Emily de Estados Unidos

## 🔍 **Logs a Verificar**

En la consola del servidor deberías ver:

```
👤 Personaje del chat: {nombre: "Emily", nacionalidad: "Estados Unidos", genero: "F", idioma_objetivo: "inglés"}
🤖 Respuesta de la IA: Hi! I'm Emily from the United States...
```

Y para Marie:
```
👤 Personaje del chat: {nombre: "Marie", nacionalidad: "Francia", genero: "F", idioma_objetivo: "francés"}
🤖 Respuesta de la IA: Bonjour! Je suis Marie de France...
```

## ✅ **Verificación**

- [ ] Emily se presenta como Emily de Estados Unidos
- [ ] Marie se presenta como Marie de Francia
- [ ] Cada personaje mantiene su identidad en su chat
- [ ] Los logs muestran el personaje correcto
- [ ] No hay confusión entre personajes



