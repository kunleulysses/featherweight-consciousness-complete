import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { setupConsciousnessWebSocket } = require('./consciousness-websocket-real.cjs');

export { setupConsciousnessWebSocket };
