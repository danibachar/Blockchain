pragma solidity ^0.5.0;

contract SuperCoin {
  // Token name
  string public constant name = "SuperCoin";
  // Token symbol
  string public constant symbol = "SuperCoin.png";

  // Mapping (voterBalance) keys to token balances of a voter
  mapping(address => uint) public voterBalance;

  // Mapping (allowed) addresses of coin owners to those who are allowed to utilize the owner's coins
  mapping(address => mapping (address => uint)) private allowed;

  //ERC20 total supply of coins
  uint public votingCoinTotalSupply = 6262019;

  constructor(uint total) public {
    votingCoinTotalSupply = total;
    voterBalance[msg.sender] = total;
    voterBalance[msg.sender] = 123987;
  }
  //MARK: - Getters
  /*
  The function (allowance) is used to check the amount (if any) was allowed by a user (allocator) to a spender.
  */
  function allowance (address _allocator, address _spender) private view returns (uint _amountAllowed) {
    return (allowed[_allocator][_spender]);
  }

  //MARK: - Setters
  /*
  The function (approve) checks the balance and after it has been checked, the contract owner can give
  their approval to the user to collect the required number of tokens from the contract’s address.
  Need to add to the limitations presentation, once a user has allowed someone some amount of coins,
  he can only change that allowed amount and can't add.
  */
  function approve (address _spender, uint _amount) public returns (bool success) {
    require( voterBalance[msg.sender] >= _amount, "Insufficient funds");
    allowed[msg.sender][_spender] = _amount;
    emit Approval(msg.sender, _spender, _amount);
    return (true);
  }

  /*
  The function (transferCoin) is used to move an amount of tokens from the owner’s balance to that of another user (receiver)
  */
  function transferCoin (address _receiver, uint _amount) public returns (bool success) { // The purpose of the function is to enable transfer of funds from one user to another
    require(_amount <= voterBalance[msg.sender], "Insufficient funds, transfer failed"); // Insure that the sender has enough coins
    require(_amount > 0 , "You can't transfer non-postive coins, transfer failed");
    voterBalance[msg.sender] -= _amount; // Update sender account
    voterBalance[_receiver] += _amount; // Update receiver amount
    emit CoinsWereTransfer(msg.sender, _receiver, _amount);
    return (true);
  }

  /*
  The function (transferFrom) allows a user to transfer the allowed coins by the _allocator (if allowed) and to
  transfer it to any other account.
  */
  function transferFrom (address _allocator, uint _amount, address _receiver) public returns (bool success) {
    require(_amount <= voterBalance[_allocator], "Insufficient funds"); // insure the _allocator has the amount
    require(_amount > 0, "Can't transfer non-postive amount");
    require(allowed[_allocator][msg.sender] >= _amount, "The allowance is not enough");
    voterBalance[_allocator] -= _amount;
    voterBalance[_receiver] += _amount;
    emit CoinsWereTransfer(_allocator, _receiver, _amount);
    return (true);
  }

  //MARK: - Events
  event Approval(address indexed coinOwner, address indexed spender, uint amount);
  event CoinsWereTransfer(address indexed sender, address indexed receiver, uint amount);
}
