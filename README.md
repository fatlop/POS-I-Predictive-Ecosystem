# POS-I Predictive Ecosystem 🔮✨

**POS-I · Predictive Ecosystem** es un ecosistema inteligente que aprende de los datos, detecta patrones y anticipa necesidades antes de que surjan problemas. Integra análisis predictivo, avatares con IA, y automatización para apoyar decisiones claras, humanas y sostenibles.

## 🚀 Características Principales

### 🤖 Avatares Inteligentes
- **Múltiples personalidades IA** con expertise especializado
- **Interacción por voz** con avatares nativos
- **Análisis predictivo** en tiempo real
- **Visualización cósmica** con StarField

### 💰 Sistema de Monetización
- **Suscripciones**: Basic ($9.99), Pro ($29.99), Enterprise ($99.99)
- **Token $FATI**: Moneda interna con bonificaciones por volumen
- **Marketplace Cósmico**: Items premium y consultas especializadas
- **Sistema de Referidos**: Gana recompensas por invitar usuarios

### 🔐 Seguridad y Autenticación
- Autenticación con Supabase
- Protección de rutas premium
- Encriptación de datos sensibles
- Rate limiting y protección CSRF

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de [Supabase](https://supabase.com) (free tier)
- Cuenta de [Stripe](https://stripe.com) (test mode)
- API Key de [Google Gemini](https://makersuite.google.com/app/apikey)

## 🛠️ Instalación Local

### 1. Clonar el repositorio
\`\`\`bash
git clone https://github.com/fatlop/POS-I-Predictive-Ecosystem.git
cd POS-I-Predictive-Ecosystem
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno
Copia \`.env.example\` a \`.env\` y completa las variables:

\`\`\`bash
cp .env.example .env
\`\`\`

Edita \`.env\` con tus credenciales.

### 4. Configurar base de datos
1. Ve a tu proyecto en Supabase
2. Navega a SQL Editor
3. Ejecuta el script \`database/schema.sql\`

### 5. Ejecutar en desarrollo
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en \`http://localhost:3000\`

## 🎯 Planes de Suscripción

### 🆓 Free
- Acceso limitado a chat básico
- 10 consultas por día

### 💎 Básico - $9.99/mes
- Chat básico ilimitado
- Hasta 100 consultas por día
- Bonus: 100 $FATI

### 🚀 Pro - $29.99/mes (Popular)
- Todo lo del plan Básico
- Voz en vivo con avatares
- Análisis predictivo avanzado
- Consultas ilimitadas
- Bonus: 500 $FATI

### 🏢 Enterprise - $99.99/mes
- Todo lo del plan Pro
- API access completo
- Avatares personalizados
- Bonus: 2000 $FATI

## 💸 Sistema $FATI Token

Tasa de conversión: **1 USD = 100 $FATI**

### Paquetes con Bonificación
- 500 $FATI → $5 (5% bonus = 525 $FATI)
- 1,000 $FATI → $10 (10% bonus = 1,100 $FATI)
- 5,000 $FATI → $50 (20% bonus = 6,000 $FATI)

## 🚀 Deploy a Producción

### Vercel (Recomendado)
1. Instala Vercel CLI: \`npm i -g vercel\`
2. Haz login: \`vercel login\`
3. Deploy: \`vercel --prod\`
4. Configura las variables de entorno en el dashboard

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Hecho con 💜 para financiar proyectos sostenibles**
