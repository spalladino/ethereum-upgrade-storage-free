async function deploy(name, ...args) {
  return ethers.getContractFactory(name)
    .then(f => f.deploy(...args))
    .then(c => c.deployed());
}

async function main() {
  const Counter = await ethers.getContractFactory('CounterV2');
  const counter = await Counter.deploy().then(c => c.deployed());
  const counterProxy = await upgrades.deployProxy(Counter);
  
  await counter.increase().then(t => t.wait());
  const directGas = await counter.increase().then(t => t.wait()).then(t => t.gasUsed);
  await counterProxy.increase().then(t => t.wait());
  const proxiedGas = await counterProxy.increase().then(t => t.wait()).then(t => t.gasUsed);

  console.log(`Comparing direct calls vs transparent proxies`)
  console.log(` Without proxy`, directGas.toString());
  console.log(` With proxy`, proxiedGas.toString());
  console.log(` Difference`, proxiedGas.sub(directGas).toString());
}

main().catch(console.error);