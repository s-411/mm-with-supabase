// Test script to verify Supabase MCP server
const { spawn } = require('child_process');

console.log('Testing Supabase MCP server...\n');

const mcp = spawn('npx', [
  '-y',
  '@supabase/mcp-server-supabase',
  '--read-only',
  '--project-ref=dmuyymdfpciuqjrarezw'
], {
  env: {
    ...process.env,
    SUPABASE_ACCESS_TOKEN: 'sbp_5b47c9a45b39b53c255d9949af02e4d687028828'
  }
});

mcp.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

mcp.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

mcp.on('close', (code) => {
  console.log(`MCP server process exited with code ${code}`);
});

// Send a test request after 2 seconds
setTimeout(() => {
  console.log('\nSending test request...');
  mcp.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  }) + '\n');
}, 2000);

// Exit after 5 seconds
setTimeout(() => {
  mcp.kill();
  process.exit(0);
}, 5000);