# Configuración del Sistema de Autenticación

## Resumen de Implementación

Se ha implementado un sistema completo de autenticación con las siguientes características:

### ✅ Funcionalidades Implementadas

1. **Autenticación por Email**
   - Registro con verificación por email
   - Login con email y contraseña
   - Reset de contraseña por email
   - Reenvío de email de verificación

2. **Autenticación con Google OAuth**
   - Login con Google (preparado para implementar)
   - Vinculación de cuentas

3. **Sistema de Onboarding**
   - Formulario paso a paso para completar perfil
   - Validación de datos requeridos
   - Creación automática de chat por defecto

4. **Seguridad**
   - Contraseñas hasheadas con bcrypt
   - Tokens JWT para autenticación
   - Middleware de autenticación
   - Verificación de email obligatoria

5. **Frontend**
   - Componentes de login/registro
   - Formulario de onboarding
   - Protección de rutas
   - Manejo de estado de autenticación

## Configuración Requerida

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
MONGO_URI=mongodb://localhost:27017/chatbot

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_de_gmail

# URLs del frontend
FRONTEND_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Puerto del servidor
PORT=4000
```

### 2. Configuración de Gmail

Para enviar emails de verificación:

1. Ve a tu cuenta de Google
2. Activa la verificación en 2 pasos
3. Genera una "Contraseña de aplicación" específica para esta app
4. Usa esa contraseña en `EMAIL_PASS`

### 3. Configuración de Google OAuth (Opcional)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+ 
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:3000/auth/google/callback` como URL de redirección

## Endpoints de la API

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login con email/contraseña
- `GET /api/auth/verify/:token` - Verificar email
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña
- `POST /api/auth/reset-password` - Resetear contraseña
- `POST /api/auth/resend-verification` - Reenviar email de verificación
- `POST /api/auth/google` - Login con Google

### Usuario

- `GET /api/users/me` - Obtener usuario actual
- `PATCH /api/users/preferences` - Actualizar preferencias

### Onboarding

- `POST /api/onboarding/complete` - Completar onboarding
- `GET /api/onboarding/status` - Estado del onboarding

### Chats y Mensajes

- `GET /api/chats` - Listar chats del usuario
- `GET /api/chats/:id` - Obtener chat específico
- `POST /api/chats` - Crear nuevo chat
- `PATCH /api/chats/:id/deactivate` - Desactivar chat
- `GET /api/messages/:chatId` - Obtener mensajes
- `POST /api/messages/:chatId` - Enviar mensaje

## Flujo de Usuario

1. **Registro**: Usuario se registra con email y contraseña
2. **Verificación**: Recibe email de verificación y hace clic en el enlace
3. **Onboarding**: Completa su perfil con idiomas, intereses, etc.
4. **Chat**: Comienza a chatear con personajes auténticos

## Estructura de Archivos

```
src/
├── models/
│   └── user.model.ts          # Modelo de usuario actualizado
├── routes/
│   ├── auth.routes.ts         # Rutas de autenticación
│   ├── onboarding.routes.ts   # Rutas de onboarding
│   ├── user.routes.ts         # Rutas de usuario (actualizadas)
│   ├── chat.routes.ts         # Rutas de chat (actualizadas)
│   └── message.routes.ts      # Rutas de mensajes (actualizadas)
├── services/
│   └── email.service.ts       # Servicio de envío de emails
├── middleware/
│   └── auth.middleware.ts     # Middleware de autenticación
└── index.ts                   # Servidor principal (actualizado)

web/src/
├── components/
│   ├── Auth/                  # Componentes de autenticación
│   └── Onboarding/           # Componentes de onboarding
├── hooks/
│   └── useAuth.ts            # Hook de autenticación
├── lib/
│   └── api.ts               # Cliente API
└── app/
    ├── auth/               # Página de autenticación
    ├── onboarding/         # Página de onboarding
    └── verify-email/       # Página de verificación
```

## Próximos Pasos

1. **Configurar variables de entorno**
2. **Configurar Gmail para emails**
3. **Probar el flujo completo**
4. **Implementar Google OAuth** (opcional)
5. **Personalizar emails** según necesidades

## Notas Importantes

- Todas las rutas están protegidas con autenticación
- Los usuarios deben verificar su email antes de usar la app
- El onboarding es obligatorio para nuevos usuarios
- Los chats se crean automáticamente después del onboarding
- El sistema es compatible con usuarios de Google y email tradicional
