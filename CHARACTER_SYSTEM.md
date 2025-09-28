# Sistema de Personajes Avanzado

## Descripción

Este sistema permite crear y gestionar personajes con personalidades muy específicas y consistentes para la aplicación de aprendizaje de idiomas. Cada personaje tiene una identidad única, historia personal detallada, contexto cultural y restricciones estrictas de idioma y comportamiento.

## Características Principales

### 1. Personalidades Detalladas
- **Rasgos de personalidad**: Cálida, maternal, aventurera, etc.
- **Motivaciones y sueños**: Qué mueve al personaje
- **Miedos y experiencias**: Historia personal profunda
- **Hobbies y profesión**: Contexto de vida actual

### 2. Contexto Cultural Auténtico
- **Tradiciones**: Festividades y costumbres del país
- **Comida y música**: Elementos culturales específicos
- **Lugares importantes**: Referencias geográficas reales
- **Historia personal**: Infancia, juventud, vida actual

### 3. Estilo Conversacional Único
- **Tono específico**: Cálido, directo, elegante, etc.
- **Expresiones típicas**: Frases características del personaje
- **Palabras clave**: Vocabulario específico del personaje
- **Nivel de formalidad**: Formal, informal o mixto

### 4. Restricciones Estrictas
- **Idioma único**: Solo habla el idioma programado
- **Temas prohibidos**: Evita ciertos temas
- **Temas favoritos**: Se enfoca en sus intereses
- **Nivel de enseñanza**: Principiante, intermedio o avanzado

## Personajes Incluidos

### María Elena (España - Español)
- **Profesión**: Profesora de literatura española
- **Personalidad**: Cálida, maternal, apasionada por la poesía
- **Contexto**: Sevilla → Madrid, tradiciones flamencas
- **Estilo**: Conversacional con humor andaluz

### James (Estados Unidos - Inglés)
- **Profesión**: Ex-militar, guía de aventuras extremas
- **Personalidad**: Directo, honesto, aventurero
- **Contexto**: Colorado, experiencias militares
- **Estilo**: Motivacional y directo

### Yuki (Japón - Japonés)
- **Profesión**: Diseñadora gráfica
- **Personalidad**: Tranquila, perfeccionista, creativa
- **Contexto**: Kyoto → Tokio, tradiciones japonesas
- **Estilo**: Respetuoso y reflexivo

### Pierre (Francia - Francés)
- **Profesión**: Chef ejecutivo
- **Personalidad**: Elegante, sofisticado, apasionado
- **Contexto**: Lyon → París, gastronomía francesa
- **Estilo**: Sofisticado con humor francés

## API Endpoints

### Personajes
- `GET /api/characters` - Obtener todos los personajes
- `GET /api/characters/:id` - Obtener personaje por ID
- `GET /api/characters/language/:idioma` - Personajes por idioma
- `GET /api/characters/nationality/:nacionalidad` - Personajes por nacionalidad
- `POST /api/characters/search` - Buscar con criterios
- `GET /api/characters/recommended/:userId` - Personajes recomendados
- `POST /api/characters/:characterId/chat` - Crear chat con personaje
- `GET /api/characters/random/language/:idioma` - Personaje aleatorio
- `POST /api/characters/:characterId/validate` - Validar consistencia
- `GET /api/characters/stats/overview` - Estadísticas

### Mensajes (Actualizados)
- `POST /api/messages/:chatId` - Enviar mensaje (con validación de personalidad)

## Validación de Consistencia

El sistema valida automáticamente que cada respuesta:
1. **Mantenga el idioma correcto**
2. **Use expresiones típicas del personaje**
3. **Incorpore palabras clave específicas**
4. **Evite temas prohibidos**
5. **Mantenga la personalidad consistente**

## Uso en el Frontend

```typescript
// Obtener personajes por idioma
const characters = await fetch('/api/characters/language/español');

// Crear chat con personaje específico
const response = await fetch(`/api/characters/${characterId}/chat`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
});

// Enviar mensaje (automáticamente usa la personalidad del personaje)
const messageResponse = await fetch(`/api/messages/${chatId}`, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        sender: 'user',
        content: 'Hola, ¿cómo estás?'
    })
});
```

## Migración

Para migrar la base de datos existente:

```bash
# Compilar TypeScript
npm run build

# Ejecutar migración
node dist/scripts/migrate-characters.js
```

## Beneficios del Nuevo Sistema

1. **Consistencia Total**: Los personajes nunca se salen de su rol
2. **Idioma Estricto**: Solo hablan el idioma programado
3. **Personalidades Únicas**: Cada personaje es completamente diferente
4. **Contexto Cultural**: Referencias auténticas a cada país
5. **Validación Automática**: El sistema detecta inconsistencias
6. **Escalabilidad**: Fácil agregar nuevos personajes
7. **Memoria Persistente**: Los personajes recuerdan su identidad

## Próximos Pasos

1. **Agregar más personajes** de diferentes países
2. **Implementar sistema de memoria** para recordar conversaciones anteriores
3. **Crear sistema de calificaciones** para evaluar la consistencia
4. **Desarrollar interfaz de administración** para gestionar personajes
5. **Implementar sistema de feedback** para mejorar personalidades
