pragma solidity ^0.5.0;


contract Voting {

	struct Candidate { // Candidates attributes:
		uint id;
		string name; // Candidate first and last name
		string agenda; // Candidate election agenda
		uint counter; // Candidate voting count
	}

	mapping(uint => Candidate) public candidates;
	
	uint public numberOfCandidates;
	address public admin; 
	uint public votingStartDate; // Voting start date
	uint public votingEndDate; // Voting end date
	uint public numberOfVoters;
	uint public votingCoinTotalAmount = 626; //ERC20 total amount of coins

	constructor () public {
		admin = msg.sender;
		votingStartDate = 0;
		votingEndDate = 1;
		voterBalance[msg.sender] = votingCoinTotalAmount;
	}

	modifier onlyAdmin { // Insure only admin can use a function
        require( msg.sender == admin, "Only Admin can call this function.");
        _;
    }
    modifier whileVoting { // Limits changes after voting started (such as adding a candidate or adding voters)
    	require(now < votingEndDate && now >= votingStartDate, "Voting has started.");
    	_;
    }
    modifier beforeVotingStarted {
    	require( votingStartDate > now, "Voting has started, can bot add new candidates");
    	_;
    }

	function addingCandidate (string memory _name, string memory _agenda) public onlyAdmin beforeVotingStarted { // Adding a new candidate to candidates mapping		
		numberOfCandidates++;
		candidates[numberOfCandidates] = Candidate(numberOfCandidates, _name, _agenda, 0);
		emit candidateEvent(); // Event for adding a new candidate
	}

	function defineVotingDates (uint _startDate, uint _endDate) public onlyAdmin  { 
		require ( _endDate > _startDate && _startDate > now, "Dates are not valid");
		require (votingStartDate == 0 && votingEndDate == 1, "Dates allready defined"); // Dates can be defined only once
		votingStartDate = _startDate;
		votingEndDate = _endDate;
	}
	
	mapping(address => uint) public voters;

	function vote (uint _candidateId) public whileVoting {
		require(voters[msg.sender] == 1, "You can not vote, you voted in the past, or you do not have the right to vote"); // Insure that voter didn't vote and has the right
		require(_candidateId > 0 && _candidateId <= numberOfCandidates); // Insure that the candidate exites
		candidates[_candidateId].counter ++; // Increase candidate counter by one
		voters[msg.sender] == 2; // 2 represent voter voted in the past
        emit votingEvent(); // Event for a voter that voted
        getPaidForVoting(msg.sender);
	}

	event votingEvent (
		);

	event candidateEvent (
		);

	function addVoter (address _voter) public onlyAdmin beforeVotingStarted {
		voters[_voter] = 1;
		numberOfVoters++;
		emit addVoterEvent();
	}

	event addVoterEvent (
		);

	function voterStatus () public view returns (uint status) {
		return (voters[msg.sender]);
	}

	mapping(address => uint) public voterBalance; // mapping keys to token balances of a voter.

	function balanceOf(address coinOwner) public view returns (uint) {
		return voterBalance[coinOwner];
	}

	function getPaidForVoting(address receiver) private {
		voterBalance[admin] = voterBalance[msg.sender] - votingCoinTotalAmount/numberOfVoters;
		voterBalance[receiver] = votingCoinTotalAmount/numberOfVoters;
		emit voterGotPaidForVoting();
	}

	event voterGotPaidForVoting (
		);

}





/* 
Tasks for Tom:

2. ERC20
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
4. bonos something nice
5. read about how truffle works with respect to migrations
6. aading a real voters book 
7. check if you can use a real live photo insted of privte key
*/
