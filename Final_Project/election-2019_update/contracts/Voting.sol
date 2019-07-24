pragma solidity ^0.5.0;


contract Voting {
	
	/* The struct (Candidates) has the follwoing attributes:
	Internal id, candidat name, candidat agenda, candidat voting counter, candidate pictuer */
	struct Candidate {
		uint id;
		string name;
		string agenda;
		uint counter;
		string candidatePictuer;
		address candidateAddress;
	}
	
	// The mapping (candidates) is between candidate id to the candidates attributes
	mapping(uint => Candidate) public candidates;
	
	// Some variables:
	uint public numberOfCandidates; // Counter for the number of candidates
	address public admin;
	uint public votingStartDate; // Voting start date
	uint public votingEndDate; // Voting end date
	uint public numberOfVoters; // Counter for the number of voters

	constructor () public {
		admin = msg.sender;
		votingStartDate = 0;
		votingEndDate = 1;
	}

	// The modifier (onlyAdmin) insure that only an admin can use the function
	modifier onlyAdmin { 
        require( msg.sender == admin, "Only Admin can call this function.");_;}

    // The modifier (whileVoting) limits changes after voting started (such as adding a candidate or adding voters)
    modifier whileVoting {
    	require(now < votingEndDate && now >= votingStartDate, "Voting has started.");_;}

    // The modifier (beforeVotingStarted) insuer that now is prior to voting start date
    modifier beforeVotingStarted {
    	require( votingStartDate > now, "Voting has started, can bot add new candidates");_;}

    /* The function (addingCandidate) is limited for admin use only (with the help of th onlyAdmin modifier)
    and can be used only before voting starts (with the help of th beforeVotingStarted modifier), that is, adding a new
    candidate sholud take place only before voting starts */
	function addingCandidate (string memory _name, string memory _agenda, string memory _picture, address _address) public onlyAdmin beforeVotingStarted { // Adding a new candidate to candidates mapping		
		numberOfCandidates++;
		candidates[numberOfCandidates] = Candidate(numberOfCandidates, _name, _agenda, 0, _picture, _address);
		emit AddingCandidate(numberOfCandidates);
	}

	// The function (defineVotingDates) is limited for admin use only (with the help of th onlyAdmin modifier)
	function defineVotingDates (uint _startDate, uint _endDate) public onlyAdmin  { 
		require ( _endDate > _startDate && _startDate > now, "Dates are not valid");
		require (votingStartDate == 0 && votingEndDate == 1, "Dates allready defined"); // Dates can be defined only once
		votingStartDate = _startDate;
		votingEndDate = _endDate;
	}
	
	/* The mapping (voters) is between the voter address and {0,1,2}.
	"0" stands for no voting rights
	"1" stands for the user has a voting & qestion rights that wasn't exercised
	"2" stands for the user has a voting but asked a quedstion
	"3" stands for the user has voted */
	mapping(address => uint) public voters;

	/* The function (vote) can be used only while voting time period (with the help of th whileVoting modifier), 
	it insure the user has voting rights and didn't use them allredy, and pay the voter after he votes. With the
	first require we insure that voter didn't vote in the past and has the right to vote. The seconde require
	insure that the candidate exites */
	function vote (uint _candidateId) public whileVoting {
		require(voters[msg.sender] >= 1 && voters[msg.sender] <= 2, "You can not vote, you voted in the past, or you do not have the right to vote");
		require(_candidateId > 0 && _candidateId <= numberOfCandidates, "This candidate doesn't exist");
		candidates[_candidateId].counter ++; // Increase candidate counter
		voters[msg.sender] = 3; // Update users status
        emit VotingTookPlace(_candidateId);
        getPaid(msg.sender); // after coin is good
	}

	/* The function (addVoter) is limited for admin use only (with the help of th onlyAdmin modifier)
    and can be used only before voting starts (with the help of th beforeVotingStarted modifier), that is, adding a new
    voter sholud take place only before voting starts */
	function addVoter (address _voter) public onlyAdmin beforeVotingStarted {
		voters[_voter] = 1;
		numberOfVoters++;
		emit AddVoter(_voter);
	}

	// The function (voterStatus) will return the voting status of the sender {0,1,2}
	function voterStatus () public view returns (uint status) {
		return (voters[msg.sender]);
	}

	/* The function (getPaid) will rewared any voter which is entitle, that is, either the voter voted or
	he asked a question were all candidates answered */
	function getPaid (address _receiver) private {
		voterBalance[admin] = voterBalance[msg.sender] - votingCoinTotalSupply/numberOfVoters;
		voterBalance[_receiver] = votingCoinTotalSupply/(2*numberOfVoters);
		emit VoterGotPaidForVoting(_receiver);
	}

	/* The function (balanceOf) returns the number of tokens that a particular address,  
	in this case, the contract owner, has in their account. */
	function balanceOf (address _coinOwner) public view returns (uint) {
		return voterBalance[_coinOwner];
	}

	event VoterGotPaidForVoting (address indexed receiver);
	event VotingTookPlace (uint indexed candidateId);
	event AddingCandidate (uint indexed candidateId);
	event AddVoter (address indexed voter);

//----------------------------------------------------------------------------------------------------------------------------//
	/* Bonus part: Questions from voters and answers candidates. 
	In order to encourage vote, debate and contact with candidates we thought about a mechanism of questions and answersץ
	Each voter, after voting started, has the right to ask all candidates one question, 
	if all candidates answered this questions (that is the question was relevent) the voter receives a reward (coin).*/

	// The mapping is between question id to question struct
	mapping (uint => Question) public questionList;
	// The mapping is between questions and answers
	mapping (uint => mapping (address => string)) public answerList;
	
	/* The struct (Question) has the follwoing attributes:
	question, counter of answers, questioner address */
	struct Question {
		string question;
		uint answerCounter;
		address questioner;
	}

	uint public numberOfQuestions; // Counter for the number of questions been asked

	/* The function (addQuestion) can be used only while voting time period (with the help of th whileVoting modifier),
	it insure that the voter has voting & question rights, saves the question and update the counter */
	function addQuestion (string memory _question) public whileVoting {
		require(voters[msg.sender] == 1, "Question can't be asked"); // make sure he has voting & asking rights
		numberOfQuestions++;
		voters[msg.sender] = 2; // mark he asked a question
		questionList[numberOfQuestions] = Question(_question, 0, msg.sender);
		emit NewQuestion(numberOfQuestions);
	}

	/* The function (addAnswer) can be used only be used only by candidates (with the help of isCandidate function),
	insure that the candidate didn't answer in the past, updates the answers, and check if the questioner
	entitled to the reward */
	function addAnswer (string memory _answer, uint _questionId) public {
		require(getStringLength(answerList[_questionId][msg.sender]) == 0); // make sure he didn't answered this question
		require(isCandidate(msg.sender)); // make sure he is a candidate
		answerList[_questionId][msg.sender] = _answer; // save answer of the candidate
		questionList[_questionId].answerCounter++; // increase by 1 the answer counter
		if (questionList[_questionId].answerCounter == numberOfCandidates) { // if answer counter == number of candidates => pay the voter
			getPaid(questionList[_questionId].questioner);
		}
		emit NewAnswer(_questionId, msg.sender);

	}

	function getStringLength (string memory _string) private pure returns(uint _length) {
		bytes memory helper = bytes(_string);
		return (helper.length);
	}

	function isCandidate (address _helper) private view returns(bool ok) {
		for (uint i = 1; i <= numberOfCandidates; i++) {
			if (candidates[i].candidateAddress == _helper) {
				return(true);
			} else {
				return(false);
			}
		}
	}

	event NewQuestion (uint indexed questionId);
	event NewAnswer (uint indexed questionId, address indexed candidateId);
//--------------------------------------------------------------------------------------------------------------------------------//

// Coin Part - TO be removed!!!!!!!!!!!!!!

	// Token name
	string public constant name = "VOTING_COIN";
	// Token symbol
	string public constant symbol = "SYM"; // need to add!!!!!!!!!!
	/*
	Decimal (up to 18) A divisibility of 0 mean lowest value of the token is 1. divisibility of 2 means lowest value 0.01
	uint8 public constant decimals = 18;
	*/ //?????????????????????????????

	// Mapping (voterBalance) keys to token balances of a voter
	mapping(address => uint) public voterBalance;

	// Mapping (allowed) addresses of coin owners to those who are allowed to utilize the owner's coins
	mapping(address => mapping (address => uint)) allowed;

	//ERC20 total supply of coins
	uint public votingCoinTotalSupply = 6262019;

	/*
	The totalSupply function identifies the total number of ERC-20 tokens created
	*/
	function totalSupply () public view onlyAdmin returns (uint theTotalSupply) {
		theTotalSupply = votingCoinTotalSupply;
		return (theTotalSupply);
	}

	/*
	The function (approve) checkes the balance and after it has been checked, the contract owner can give 
	their approval to the user to collect the required number of tokens from the contract’s address.
	Need to add to the limitions presention, once a user has allwoed someone some amount of coins, 
	he can only change that allwoed amount and can't add.
	*/
	function approve (address _spender, uint _amount) public returns (bool success) {
		require( voterBalance[msg.sender] >= _amount, "Insufficient funds");
		allowed[msg.sender][_spender] = _amount;
		emit Approval(msg.sender, _spender, _amount);
		return (true);
	}

	event Approval(address indexed coinOwner, address indexed spender, uint amount);

	/*
	The function (transferCoin) is used to move an amount of tokens from the owner’s balance to that of another user (receiver)
	*/
	function transferCoin (address _receiver, uint _amount) public returns (bool success) { // The purpose of the function is to enable transfer of funds from one user to another
		require(_amount <= voterBalance[msg.sender], "Insufficient funds, transfer faild"); // Insure that the sender has enough coins
		require(_amount > 0 , "You can't transfer non-postive coins, transfer faild"); 
		voterBalance[msg.sender] -= _amount; // Update sender acount
		voterBalance[_receiver] += _amount; // Update receiver avount
		emit CoinsWereTransfer(msg.sender, _receiver, _amount);
		return (true);
	}

	/*
	The function (allowance) is used to check the amount (if any) was allwoed by a user (allocator) to a spender.
	*/
	function allowance (address _allocator, address _spender) private view returns (uint _amountAllowed) {
		return (allowed[_allocator][_spender]);
	}

	/*
	The function (transferFrom) allows the a user to transfer the allowed coins by the _allocator (if allwoed) and to 
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

	event CoinsWereTransfer(address indexed sender, address indexed receiver, uint amount);





/*
voter can request from admin to get voting rights
function for pending request
mapping form a key (counter) to address
insure he doesn't have voting rights
function move from pendeing to voters
*/
	mapping (uint => address) public pendingVoters;

	uint public numberOfPendingRequest; // make sure to initaliz with in constructor with

	function addNewPenddingRequest(address _requester) public {
		require(voters[_requester] == 0, "You have voitng rights");
		numberOfPendingRequest++;
		pendeingVoters[numberOfPendingRequest] = _requester;
		emit newRequest(_requester);
	}
	event newRequest (address indexed _requesterAddress);

	function viewPendingRequest() public onlyAdmin beforeVotingStarted {

	}
}





/* 
Tasks for Tom:

3. Presention
	3.1. add to the presention, after closing the smart contract with Daniel the following:
		3.1.1. Structs
		3.1.2. Mappings
		3.1.3. Modifiers
		3.1.4. Functions
		3.1.5. State Variables
		3.1.6. Events
	3.2. Add Installation instructions - after we are done
	3.3. Add demonstration video - after we are done
	3.4. Add known bugs - after we are done
5. read about how truffle works with respect to migrations
*/
