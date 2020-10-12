// Adapted from https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/upgradeability/smart-wallet/DharmaUpgradeBeacon.sol
contract DharmaBeacon {
  address private implementation;
  address private immutable controller;

  constructor(address _implementation, address _controller) public {
    implementation = _implementation;
    controller = _controller;
  }

  fallback() external {
    // Return implementation address for all callers other than the controller.
    if (msg.sender != controller) {
      // Load implementation from storage slot zero into memory and return it.
      assembly {
        mstore(0, sload(0))
        return(0, 32)
      }
    } else {
      // Set implementation - put first word in calldata in storage slot zero.
      assembly { sstore(0, calldataload(0)) }
    }
  }
}