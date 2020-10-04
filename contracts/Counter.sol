contract CounterV1 {
  uint256 public value;
  
  function increase() external {
    value += 1;
  }

  function version() virtual external pure returns (string memory) {
    return "V1";
  }
}

contract CounterV2 is CounterV1 {
  function version() override external pure returns (string memory) {
    return "V2";
  }
}