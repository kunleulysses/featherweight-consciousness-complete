module.exports = {
  apps: [{
    name: 'featherweight-server',
    script: './index.js',
    node_args: '--experimental-modules',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'sk-proj-aaaaaaaaa-bbbbbbbbbbbb-cccccccccccc-dddddddddddd-eeeeeeeeeeee-ffffffffffff-gggggggggggg-hhhhhhhhhhhh-iiiiiiiiiiii',
      VENICE_AI_API_KEY: 'qiHEzUmALhbs0wUcT3VvFo2_nFliLjgGDAPr_p9e7Z',
      VENICE_AI_BASE_URL: 'https://api.venice.ai/api/v1',
      VENICE_AI_MODEL: 'llama-3.3-70b'
    }
  }]
};
