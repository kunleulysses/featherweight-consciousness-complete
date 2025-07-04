import { spawn } from 'child_process';
import { readFileSync } from 'fs';

// Load environment variables from .env file
const envFile = readFileSync('.env', 'utf8');
const envVars = {};

envFile.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#') && line.includes('=')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').trim();
    envVars[key.trim()] = value;
  }
});

// Set environment variables
Object.assign(process.env, envVars);
process.env.NODE_ENV = 'development';

// Try to run with various TypeScript runners
const runners = [
  'tsx',
  './node_modules/.bin/tsx',
  'ts-node',
  './node_modules/.bin/ts-node',
  'sucrase-node',
  './node_modules/.bin/sucrase-node'
];

async function runApp() {
  for (const runner of runners) {
    try {
      console.log(`Trying to run with ${runner}...`);
      const child = spawn(runner, ['server/index.ts'], {
        stdio: 'inherit',
        env: process.env
      });
      
      child.on('error', (err) => {
        console.log(`Failed with ${runner}: ${err.message}`);
      });
      
      child.on('exit', (code) => {
        if (code === 0) {
          console.log(`Successfully ran with ${runner}`);
          return;
        }
      });
      
      // If we get here, the process started successfully
      console.log(`Started successfully with ${runner}`);
      return;
    } catch (err) {
      console.log(`Failed to start with ${runner}: ${err.message}`);
    }
  }
  
  console.log('All TypeScript runners failed. Please install tsx or ts-node globally.');
  process.exit(1);
}

runApp();
