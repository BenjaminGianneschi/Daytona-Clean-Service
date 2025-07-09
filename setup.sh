#!/bin/bash

# 🚗 Script de Configuración - Daytona Clean Service
# Este script configura automáticamente el sistema de turnos

echo "🚗 Configurando Daytona Clean Service..."
echo "========================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "backend/package.json" ]; then
    print_error "No se encontró el archivo package.json en backend/"
    print_error "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# 1. Verificar dependencias del sistema
print_status "Verificando dependencias del sistema..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instálalo desde https://nodejs.org/"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado. Por favor instálalo junto con Node.js"
    exit 1
fi

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL no está instalado o no está en el PATH"
    print_warning "Por favor instala PostgreSQL y asegúrate de que esté en ejecución"
fi

print_success "Dependencias del sistema verificadas"

# 2. Configurar backend
print_status "Configurando backend..."

cd backend

# Instalar dependencias
print_status "Instalando dependencias de Node.js..."
npm install

if [ $? -ne 0 ]; then
    print_error "Error instalando dependencias"
    exit 1
fi

print_success "Dependencias instaladas correctamente"

# Verificar archivo de configuración
if [ ! -f "config.env" ]; then
    print_warning "Archivo config.env no encontrado, creando desde ejemplo..."
    if [ -f "config.env.example" ]; then
        cp config.env.example config.env
        print_success "Archivo config.env creado"
    else
        print_error "No se encontró config.env.example"
        exit 1
    fi
fi

# 3. Configurar base de datos
print_status "Configurando base de datos..."

# Leer configuración de la base de datos
if [ -f "config.env" ]; then
    source <(grep -E '^DB_' config.env | sed 's/^/export /')
fi

# Valores por defecto si no están en config.env
DB_HOST=${DB_HOST:-localhost}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-daytona_turnos}
DB_PORT=${DB_PORT:-5432}

print_status "Configuración de BD: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

# Intentar conectar a PostgreSQL
if command -v psql &> /dev/null; then
    print_status "Probando conexión a PostgreSQL..."
    
    # Intentar conectar
    if PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Conexión a PostgreSQL exitosa"
        
        # Crear base de datos si no existe
        print_status "Creando base de datos si no existe..."
        PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "CREATE DATABASE $DB_NAME;"
        
        # Ejecutar script de esquema
        if [ -f "database/schema-postgres.sql" ]; then
            print_status "Ejecutando script de esquema..."
            PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" < database/schema-postgres.sql
            
            if [ $? -eq 0 ]; then
                print_success "Base de datos configurada correctamente"
            else
                print_error "Error ejecutando script de esquema"
                exit 1
            fi
        else
            print_error "No se encontró database/schema-postgres.sql"
            exit 1
        fi
    else
        print_warning "No se pudo conectar a PostgreSQL"
        print_warning "Por favor verifica que PostgreSQL esté ejecutándose y las credenciales sean correctas"
    fi
else
    print_warning "PostgreSQL no está disponible"
    print_warning "Por favor instala PostgreSQL y ejecuta manualmente:"
    print_warning "psql -U postgres -d daytona_turnos < backend/database/schema-postgres.sql"
fi

# 4. Crear directorio de logs
print_status "Creando directorio de logs..."
mkdir -p logs
touch logs/app.log
print_success "Directorio de logs creado"

# 5. Verificar archivos de configuración
print_status "Verificando archivos de configuración..."

# Verificar JWT_SECRET
if grep -q "JWT_SECRET=tu_jwt_secret" config.env; then
    print_warning "JWT_SECRET no está configurado"
    print_warning "Por favor edita config.env y cambia JWT_SECRET por un valor seguro"
fi

# Verificar WhatsApp
if grep -q "WHATSAPP_API_KEY=tu_whatsapp_api_key" config.env; then
    print_warning "WhatsApp API Key no está configurada"
    print_warning "Por favor edita config.env y configura WHATSAPP_API_KEY si deseas usar notificaciones"
fi

# 6. Configurar permisos
print_status "Configurando permisos..."
chmod 644 config.env
chmod 755 logs
chmod 644 logs/app.log
print_success "Permisos configurados"

# 7. Volver al directorio raíz
cd ..

# 8. Crear script de inicio
print_status "Creando script de inicio..."

cat > start-server.sh << 'EOF'
#!/bin/bash

# Script de inicio para Daytona Clean Service

echo "🚗 Iniciando Daytona Clean Service..."

# Navegar al directorio backend
cd backend

# Verificar si el servidor ya está ejecutándose
if pgrep -f "node.*server.js" > /dev/null; then
    echo "⚠️  El servidor ya está ejecutándose"
    echo "Para detenerlo: pkill -f 'node.*server.js'"
    exit 1
fi

# Iniciar servidor
echo "🚀 Iniciando servidor en puerto 3000..."
npm start
EOF

chmod +x start-server.sh
print_success "Script de inicio creado: start-server.sh"

# 9. Crear script de parada
print_status "Creando script de parada..."

cat > stop-server.sh << 'EOF'
#!/bin/bash

# Script de parada para Daytona Clean Service

echo "🛑 Deteniendo Daytona Clean Service..."

# Buscar y detener el proceso del servidor
if pgrep -f "node.*server.js" > /dev/null; then
    pkill -f "node.*server.js"
    echo "✅ Servidor detenido"
else
    echo "ℹ️  No hay servidor ejecutándose"
fi
EOF

chmod +x stop-server.sh
print_success "Script de parada creado: stop-server.sh"

# 10. Mostrar resumen
echo ""
echo "🎉 Configuración completada!"
echo "============================"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita backend/config.env con tus credenciales"
echo "2. Ejecuta: ./start-server.sh"
echo "3. Accede al admin: http://localhost:3000/admin/"
echo "4. Credenciales por defecto: admin / admin123"
echo ""
echo "📚 Documentación: GUIA_ADMINISTRACION.md"
echo "🔧 Scripts disponibles:"
echo "   - start-server.sh: Iniciar servidor"
echo "   - stop-server.sh: Detener servidor"
echo ""
echo "📞 Soporte: +5493482588383"
echo ""

# 11. Verificar si todo está listo
print_status "Verificando configuración final..."

# Verificar archivos críticos
if [ -f "backend/package.json" ] && [ -f "backend/config.env" ] && [ -f "backend/database/schema-postgres.sql" ]; then
    print_success "✅ Configuración básica completada"
else
    print_error "❌ Faltan archivos críticos"
    exit 1
fi

# Verificar si el servidor puede iniciarse
cd backend
if npm list > /dev/null 2>&1; then
    print_success "✅ Dependencias instaladas correctamente"
else
    print_error "❌ Error con las dependencias"
    exit 1
fi

cd ..

print_success "🎉 ¡Sistema listo para usar!"
print_status "Ejecuta './start-server.sh' para iniciar el servidor" 