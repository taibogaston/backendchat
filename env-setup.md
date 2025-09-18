# Configuración del archivo .env

Crea un archivo llamado `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Base de datos
MONGO_URI=mongodb://localhost:27017/chatbot

# JWT
JWT_SECRET=84b7cfeef6fc2e44391c7d33d5188ba4c7143ea0496e3b5e2d84c0de3674275fcffe4b3f2ca99ce9ca426fb8d5f9f9fd29b6bb32c24549f1f806dbcc9afd36cf

# Email - Mailtrap (GRATIS para desarrollo/testing)
MAILTRAP_USER=tu_usuario_real_de_mailtrap
MAILTRAP_PASS=tu_password_real_de_mailtrap

# URLs del frontend
FRONTEND_URL=http://localhost:3000

# Puerto del servidor
PORT=4000
```

## Pasos para configurar:

1. **Crea el archivo .env** en la raíz del proyecto
2. **Copia el contenido de arriba** al archivo
3. **Obtén las credenciales de Mailtrap:**
   - Ve a [mailtrap.io](https://mailtrap.io)
   - Inicia sesión
   - Ve a "Email Testing" → "Inboxes" → "My Inbox"
   - Ve a "SMTP Settings" → "Nodemailer"
   - Copia el Username y Password
4. **Reemplaza** `tu_usuario_real_de_mailtrap` y `tu_password_real_de_mailtrap` con las credenciales reales
5. **Guarda el archivo**
6. **Reinicia el servidor backend**
