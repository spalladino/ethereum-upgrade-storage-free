contract Proxy {
  address constant main = 0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC;
  address constant backup = 0xDDdDddDdDdddDDddDDddDDDDdDdDDdDDdDDDDDDd;

  fallback() external {
    assembly {
      extcodecopy(main, 0, 127, 20)
      let impl := mload(0)
      
      switch iszero(impl)
      case 1 {
        extcodecopy(backup, 0, 127, 20)
        impl := mload(0)
      }
      default { }

      calldatacopy(0, 0, calldatasize())
      let result := delegatecall(gas(), shr(96, impl), 0, calldatasize(), 0, 0)
      returndatacopy(0, 0, returndatasize())

      switch result
      case 0 { revert(0, returndatasize()) }
      default { return(0, returndatasize()) }
    }
  }
}
