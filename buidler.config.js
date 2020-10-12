usePlugin("@nomiclabs/buidler-ethers");
usePlugin("@openzeppelin/buidler-upgrades");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

module.exports = {
  solc: {
    version: "0.7.2",
    optimizer: { enabled: true },
  },
  defaultNetwork: 'buidlerevm',
  networks: {
    local: {
      url: 'http://localhost:9545'
    }
  }
};
