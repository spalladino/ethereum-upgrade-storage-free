const fs = require('fs');

async function main() {
  const artifact = JSON.parse(fs.readFileSync('./artifacts/Proxy.json'));
  const blue = (artifact.bytecode.indexOf('cccccccccccccccccccccccccccccccccccccccc') - 2) / 2;
  const green = (artifact.bytecode.indexOf('dddddddddddddddddddddddddddddddddddddddd') - 2) / 2;
  console.log('Beacon offsets in proxy:', blue, green);
}

main();