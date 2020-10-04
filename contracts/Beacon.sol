interface Registry {
  function getImplementation(string calldata name) external returns (address);
}

contract Beacon {
  address immutable public implementation;
  address immutable public admin;

  constructor(Registry _registry, string memory _name) public {
    implementation = _registry.getImplementation(_name);
    admin = address(_registry);
  }

  function destroy() public {
    require(msg.sender == admin);
    selfdestruct(msg.sender);
  }
}