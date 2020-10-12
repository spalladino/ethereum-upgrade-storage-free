async function deploy(name, ...args) {
  return ethers.getContractFactory(name)
    .then(f => f.deploy(...args))
    .then(c => c.deployed());
}

async function main() {
  const controller = '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC';
  const counter = await deploy('CounterV2');
  const counterBeacon = await deploy('DharmaBeacon', counter.address, controller);
  const proxy = await deploy('DharmaProxy', counterBeacon.address);
  const counterProxy = await ethers.getContractFactory('CounterV2').then(f => f.attach(proxy.address));
  console.log(`Counter deployed at:      ${counter.address}`);
  console.log(`Beacon implementation is: ${await ethers.provider.call({ to: counterBeacon.address })}`);
  
  await counter.increase().then(t => t.wait());
  const directGas = await counter.increase().then(t => t.wait()).then(t => t.gasUsed);
  console.log(`Direct value:`, await counter.value());

  await counterProxy.increase().then(t => t.wait());
  const proxiedGas = await counterProxy.increase().then(t => t.wait()).then(t => t.gasUsed);
  console.log(`Proxy value: `, await counterProxy.value());

  console.log(`Comparing direct calls vs beacon proxies`)
  console.log(` Without proxy`, directGas.toString());
  console.log(` With proxy`, proxiedGas.toString());
  console.log(` Difference`, proxiedGas.sub(directGas).toString());
}

main().catch(console.error);