async function deploy(name, ...args) {
  const contract = await ethers.getContractFactory(name)
    .then(f => f.deploy(...args))
    .then(c => c.deployed());
  console.log(` Deployed ${name} at: ${contract.address}`);
  return contract;
}

async function main() {
  // Deploy controller and create new implementation for CounterV1
  const from = await ethers.getSigners().then(([signer]) => signer.getAddress());
  console.log(`Setting up controller...`)
  const controller = await deploy("Controller", from);
  const counter = await deploy('CounterV1');
  await controller.createImplementation('Counter', counter.address).then(t => t.wait());

  // Create a proxy for Counter and interact with it
  console.log(`Creating proxy...`)
  const proxyAddr = await controller.createProxy('Counter').then(t => t.wait()).then(r => r.events[0].args[0]);
  console.log(` Proxy created at`, proxyAddr);
  const counterProxy = await ethers.getContractFactory('CounterV1').then(f => f.attach(proxyAddr));
  await counterProxy.increase().then(t => t.wait());
  await counterProxy.increase().then(t => t.wait());
  console.log(` Proxy counter version is ${await counterProxy.version()} and value is ${await counterProxy.value()}`);

  // Begin upgrade to V2
  console.log(`Upgrading to V2...`)
  const counterV2 = await deploy('CounterV2');
  await controller.beginUpgrade('Counter', counterV2.address).then(t => t.wait());
  console.log(` Proxy counter version is ${await counterProxy.version()} and value is ${await counterProxy.value()}`);

  // Finish upgrade
  console.log(`Finishing upgrade...`)
  await controller.finishUpgrade('Counter').then(t => t.wait());
  console.log(` Proxy counter version is ${await counterProxy.version()} and value is ${await counterProxy.value()}`);

  // Measure gas overhead
  console.log(`Comparing gas usage...`)
  await counterV2.increase().then(t => t.wait());
  const directGas = await counterV2.increase().then(t => t.wait()).then(t => t.gasUsed);
  const proxiedGas = await counterProxy.increase().then(t => t.wait()).then(t => t.gasUsed);
  console.log(` Without proxy`, directGas.toString());
  console.log(` With proxy`, proxiedGas.toString());
  console.log(` Difference`, proxiedGas.sub(directGas).toString());
}

main().catch(console.error);