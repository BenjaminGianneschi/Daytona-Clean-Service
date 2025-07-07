const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Reiniciando servidor...');

// Función para encontrar el proceso del servidor
function findServerProcess() {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'tasklist' : 'ps';
    const args = isWin ? ['/FI', 'IMAGENAME eq node.exe'] : ['aux'];
    
    const process = spawn(cmd, args, { shell: true });
    let output = '';
    
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    process.on('close', () => {
      const lines = output.split('\n');
      const serverProcesses = lines.filter(line => 
        line.includes('node') && 
        (line.includes('server.js') || line.includes('daytona'))
      );
      resolve(serverProcesses);
    });
  });
}

// Función para matar un proceso
function killProcess(pid) {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'taskkill' : 'kill';
    const args = isWin ? ['/PID', pid, '/F'] : [pid];
    
    const process = spawn(cmd, args, { shell: true });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Proceso ${pid} terminado`);
      } else {
        console.log(`⚠️ No se pudo terminar proceso ${pid}`);
      }
      resolve();
    });
  });
}

// Función principal
async function restartServer() {
  try {
    console.log('🔍 Buscando procesos del servidor...');
    
    // En Windows, es más difícil detectar procesos específicos
    // así que vamos a intentar reiniciar directamente
    if (process.platform === 'win32') {
      console.log('🖥️ Detectado Windows, reiniciando directamente...');
    } else {
      const processes = await findServerProcess();
      if (processes.length > 0) {
        console.log(`📋 Encontrados ${processes.length} procesos del servidor`);
        
        for (const processLine of processes) {
          const parts = processLine.trim().split(/\s+/);
          if (parts.length > 1) {
            const pid = parts[1];
            console.log(`🔄 Terminando proceso ${pid}...`);
            await killProcess(pid);
          }
        }
        
        // Esperar un momento para que los procesos se terminen
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('🚀 Iniciando servidor...');
    
    // Iniciar el servidor
    const serverProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: true
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ Error iniciando servidor:', error.message);
    });
    
    serverProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`❌ Servidor terminado con código ${code}`);
      }
    });
    
    console.log('✅ Servidor reiniciado exitosamente');
    console.log('📝 Para detener el servidor, presiona Ctrl+C');
    
  } catch (error) {
    console.error('❌ Error reiniciando servidor:', error.message);
    console.log('\n💡 Alternativa manual:');
    console.log('1. Presiona Ctrl+C para detener el servidor actual');
    console.log('2. Ejecuta: npm start');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  restartServer();
}

module.exports = { restartServer }; 