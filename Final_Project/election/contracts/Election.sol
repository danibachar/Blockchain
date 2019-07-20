pragma solidity ^0.5.0;


contract Election {

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
	bool public isVotingDatesConfigured;

	constructor () public {
		admin = msg.sender;
		votingStartDate = 0;
		votingEndDate = 1;
		isVotingDatesConfigured = false;
	}

	modifier onlyAdmin { // Insure only admin can use a function
        require( msg.sender == admin, "Only Admin can call this function.");
        _;
    }
    modifier whileVoting { // Limits changes after voting started (such as adding a candidate or adding voters)
    	require(now < votingEndDate && now >= votingStartDate, "Voting has not started yet.");
    	_;
    }
    modifier beforeVotingStarted {
    	require( votingStartDate > now, "Voting has already started, You cannot change the election DB.");
    	_;
    }

    function isAdmin (address _checkAdmin) public returns (bool TF) {
    	return (_checkAdmin == admin);
    }

	function addingCandidate (string memory _name, string memory _agenda) public onlyAdmin beforeVotingStarted { // Adding a new candidate to candidates mapping
		numberOfCandidates++;
		candidates[numberOfCandidates] = Candidate(numberOfCandidates, _name, _agenda, 0);
		emit candidateEvent(numberOfCandidates); // Event for adding a new candidate
	}

	function defineVotingDates (uint _startDate, uint _endDate) public onlyAdmin  {
		require ( _endDate > _startDate && _startDate > now, "Dates are not valid");
		require (votingStartDate == 0 && votingEndDate == 1, "Dates allready defined"); // Dates can be defined only once
		votingStartDate = _startDate;
		votingEndDate = _endDate;
		isVotingDatesConfigured = true;
	}

	mapping(address => uint) public voters;

	function vote (uint _candidateId) public whileVoting {
		require(voters[msg.sender] == 1, "You can not vote, you voted in the past, or you do not have the right to vote"); // Insure that voter didn't vote and has the right
		require(_candidateId > 0 && _candidateId <= numberOfCandidates); // Insure that the candidate exites
		candidates[_candidateId].counter ++; // Increase candidate counter by one
		voters[msg.sender] = 2; // 2 represent voter voted in the past
    emit votingEvent(_candidateId); // Event for a voter that voted
	}

	event votingEvent (
		uint indexed _candidateId
		);

	event candidateEvent (
		uint indexed _candidateId
		);

	function addVoters(address[] memory _voters) public onlyAdmin beforeVotingStarted {
		for (uint i = 0; i < _voters.length; i++) {
			voters[_voters[i]] = 1;
			numberOfVoters++;
		}
		emit addVoterEvent();
	}

	event addVoterEvent ();

	function voterStatus () public returns (uint status) {
		return (voters[msg.sender]);
	}

	function endVoting () public returns (bool index) {
		return (now > votingEndDate);
	}

	// QA Functions

	// This function is just a QA function to test functionality.
	// It should not appear on a real contract - we need to understand how to set it appropriatly
	// We are aware of the security problem, but because this is just for showing functionality
	event adminSwitchEvent ();

	function setAdmin(address _admin) public {
		admin = _admin;
		emit adminSwitchEvent();
	}
}
