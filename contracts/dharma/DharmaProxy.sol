// Adapted from https://github.com/dharma-eng/dharma-smart-wallet/blob/master/contracts/proxies/smart-wallet/UpgradeBeaconProxyV1.sol

contract DharmaProxy {
  // Set upgrade beacon address as immutable (i.e. not in contract storage).
  address private immutable upgradeBeacon;

  constructor(address _upgradeBeacon) public {
    upgradeBeacon = _upgradeBeacon;
  }

  /**
   * @notice In the fallback, delegate execution to the implementation set on
   * the upgrade beacon.
   */
  fallback () external payable {
    // Delegate execution to implementation contract provided by upgrade beacon.
    _delegate(_implementation());
  }

  /**
   * @notice Private view function to get the current implementation from the
   * upgrade beacon. This is accomplished via a staticcall to the beacon with no
   * data, and the beacon will return an abi-encoded implementation address.
   * @return implementation Address of the implementation.
   */
  function _implementation() private view returns (address implementation) {
    // Get the current implementation address from the upgrade beacon.
    (bool ok, bytes memory returnData) = upgradeBeacon.staticcall("");

    // Revert and pass along revert message if call to upgrade beacon reverts.
    require(ok, string(returnData));

    // Set the implementation to the address returned from the upgrade beacon.
    implementation = abi.decode(returnData, (address));
  }

  /**
   * @notice Private function that delegates execution to an implementation
   * contract. This is a low level function that doesn't return to its internal
   * call site. It will return whatever is returned by the implementation to the
   * external caller, reverting and returning the revert data if implementation
   * reverts.
   * @param implementation Address to delegate.
   */
  function _delegate(address implementation) private {
    assembly {
      // Copy msg.data. We take full control of memory in this inline assembly
      // block because it will not return to Solidity code. We overwrite the
      // Solidity scratch pad at memory position 0.
      calldatacopy(0, 0, calldatasize())

      // Delegatecall to the implementation, supplying calldata and gas.
      // Out and outsize are set to zero - instead, use the return buffer.
      let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

      // Copy the returned data from the return buffer.
      returndatacopy(0, 0, returndatasize())

      switch result
      // Delegatecall returns 0 on error.
      case 0 { revert(0, returndatasize()) }
      default { return(0, returndatasize()) }
    }
  }
}