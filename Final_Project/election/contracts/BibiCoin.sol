pragma solidity ^0.5.0;

//Based on - https://www.toptal.com/ethereum/create-erc20-token-tutorial
contract BibiCoin {
  string public constant name = "BibiCoin";
  string public constant symbol = "BibiCoin.png";

  uint256 public totalSupply;

  mapping(address => uint256) balances;
  mapping(address => mapping (address => uint256)) allowed;

  address public admin;

  constructor(address _admin, uint256 total) public {
      admin = _admin;
      totalSupply = total;
      balances[msg.sender] = totalSupply;
  }


  function balanceOf(address tokenOwner) public view returns (uint) {
    return balances[tokenOwner];
  }

  function allowance(address owner, address delegate) public view returns (uint) {
    return allowed[owner][delegate];
  }

  function transfer(address receiver, uint256 numTokens) public returns (bool) {
    require(numTokens <= balances[msg.sender]);
    balances[msg.sender] = (balances[msg.sender] - numTokens);
    balances[receiver] = balances[receiver] + numTokens;
    emit Transfer(msg.sender, receiver, numTokens);
    return true;
  }

  function approve(address delegate, uint numTokens) public returns (bool) {
    allowed[msg.sender][delegate] = numTokens;
    emit Approval(msg.sender, delegate, numTokens);
    return true;
  }

  function transferFrom(address owner, address buyer, uint numTokens) public returns (bool) {
    require(numTokens <= balances[owner]);
    require(numTokens <= allowed[owner][msg.sender]);
    balances[owner] = (balances[owner] - numTokens);
    allowed[owner][msg.sender] = (allowed[owner][msg.sender] - numTokens);
    balances[buyer] = balances[buyer] + numTokens;
    emit Transfer(owner, buyer, numTokens);
    return true;
  }

  event Approval(address indexed tokenOwner, address indexed spender, uint tokens);
  event Transfer(address indexed from, address indexed to, uint tokens);
}
