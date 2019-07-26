pragma solidity ^0.5.0;

import './SuperCoin.sol';

contract Election {

	/* The struct (Candidates) has the following attributes:
	Internal id, candidate name, candidate agenda, candidate voting counter, candidate picture */
	struct Candidate {
		uint id; //0
		string name; //1
		string agenda; //2
		uint counter; //3
		string candidatePicture; //4
		address candidateAddress; //5
	}

	// The mapping (candidates) is between candidate id to the candidates attributes
	mapping(uint => Candidate) public candidates;

	/* The mapping (voters) is between the voter address and {0,1,2}.
	"0" stands for no voting rights
	"1" stands for the user has a voting right & question rights that wasn't exercised
	"2" stands for the user has a voting right but asked a question
	"3" stands for the user has voted
	"4" stands for pending request for voting rights */
	mapping(address => uint) public voters;

	mapping(uint => address) public registeredVoters;

	uint public numberOfCandidates;
	address public admin;
	uint public votingStartDate; // Voting start date
	uint public votingEndDate; // Voting end date
	uint public numberOfVoters;
	bool public isVotingDatesConfigured;
	SuperCoin private coin;

	constructor () public {
		admin = msg.sender;
		votingStartDate = 0;
		votingEndDate = 1;
		isVotingDatesConfigured = false;
		registeredVoters[1] = msg.sender;
		numberOfVoters = 1;
		voters[msg.sender] = 1;
		coin = new SuperCoin(6262019);
	}

	// The modifier (onlyAdmin) insure that only an admin can use the function
	modifier onlyAdmin { require( msg.sender == admin, "Only Admin can call this function.");_; }

	// The modifier (whileVoting) limits changes after voting started (such as adding a candidate or adding voters)
	modifier whileVoting { require(now < votingEndDate && now >= votingStartDate, "Voting has NOT started yet.");_; }

	// The modifier (beforeVotingStarted) insure that now is prior to voting start date
	modifier beforeVotingStarted { require( votingStartDate > now, "Voting has started, this is not allowed during voting time");_; }

	//MARK: - Getters
  function isAdmin (address _checkAdmin) public view returns (bool TF) {
    	return (_checkAdmin == admin);
  }

	// The function (voterStatus) will return the voting status of the sender {0,1,2}
	function voterStatus () public view returns (uint status) {
		return (voters[msg.sender]);
	}

	function endVoting () public view returns (bool index) {
		return (now > votingEndDate);
	}

	/* The function (balanceOf) returns the number of tokens that a particular address, 
	in this case, the contract owner, has in their account. */
	function balanceOf (address _coinOwner) public view returns (uint) {
		return coin.voterBalance(_coinOwner);
	}


	//MARK: - Setters
	/* The function (addingCandidate) is limited for admin use only (with the help of the onlyAdmin modifier)
	and can be used only before voting starts (with the help of the beforeVotingStarted modifier), that is, adding a new
	candidate should take place only before voting starts */
	function addingCandidate (string memory _name, string memory _agenda, string memory _picture, address _address) public onlyAdmin beforeVotingStarted { // Adding a new candidate to candidates mapping
		numberOfCandidates++;
		candidates[numberOfCandidates] = Candidate(numberOfCandidates, _name, _agenda, 0, _picture, _address);
		emit CandidatesAdded(numberOfCandidates);
	}

	// The function (defineVotingDates) is limited for admin use only (with the help of the onlyAdmin modifier)
	function defineVotingDates (uint _startDate, uint _endDate) public onlyAdmin  {
		require ( _endDate > _startDate && _startDate > now, "Dates are not valid");
		require (votingStartDate == 0 && votingEndDate == 1, "Dates already defined"); // Dates can be defined only once
		votingStartDate = _startDate;
		votingEndDate = _endDate;
		isVotingDatesConfigured = true;
	}

	/* The function (vote) can be used only while voting time period (with the help of th whileVoting modifier),
	it insure the user has voting rights and didn't use them allredy, and pay the voter after he votes. With the
	first require we insure that voter didn't vote in the past and has the right to vote. The seconde require
	insure that the candidate exists */
	function vote (uint _candidateId) public whileVoting {
		require(voters[msg.sender] >= 1 && voters[msg.sender] <= 2, "You can not vote, you voted in the past, or you do not have the right to vote");
		require(_candidateId > 0 && _candidateId <= numberOfCandidates, "This candidate doesn't exist");
		candidates[_candidateId].counter ++; // Increase candidate counter
		voters[msg.sender] = 3; // Update users status
    emit VotingTookPlace(_candidateId);
    getPaid(msg.sender); // after coin is good
	}

	/* The function (addVoters) is limited for admin use only (with the help of the onlyAdmin modifier)
		and can be used only before voting starts (with the help of the beforeVotingStarted modifier), that is, adding a new
		voter should take place only before voting starts */
	function addVoters (address[] memory _voters) public onlyAdmin beforeVotingStarted {
		for (uint i = 0; i < _voters.length; i++) {
			if (voters[_voters[i]] != 1) {
				voters[_voters[i]] = 1;
				numberOfVoters++;
				registeredVoters[numberOfVoters] = _voters[i];
			}
		}
		emit VotersAdded();
	}

	//MARK: - Private
	/* The function (getPaid) will reward any voter which is entitle, that is, either the voter voted or
	he asked a question were all candidates answered */
	function getPaid (address _receiver) private {
		//uint votingCoinTotalAmount = coin.votingCoinTotalSupply();
		//coin.transferCoin(_receiver, votingCoinTotalAmount/numberOfVoters);
		//require(coin.voterBalance(msg.sender) > 0, "Next time please vote earlier");

		coin.transferCoin(_receiver, 1); // new line - 1 coin for a vote
		emit VoterGotPaidForVoting(_receiver);
	}

	//MARK: - Events
	event VoterGotPaidForVoting (address indexed receiver);
	event VotingTookPlace (uint indexed candidateId);
	event CandidatesAdded (uint indexed candidateId);
	event VotersAdded ();


	//----------------------------------------------------------------------------------------------------------------------------//
		/* Bonus part: Questions from voters and answers candidates.
		In order to encourage vote, debate and contact with candidates we thought about a mechanism of questions and answersץ
		Each voter, after voting started, has the right to ask all candidates one question,
		if all candidates answered this questions (that is the question was relevant) the voter receives a reward (coin).*/

		// The mapping is between question id to question struct
		mapping (uint => Question) public questionList;
		// The mapping is between questions and answers
		mapping (uint => mapping (address => string)) public answerList;

		/* The struct (Question) has the following attributes:
		question, counter of answers, questioner address */
		struct Question {
			string question;
			uint answerCounter;
			address questioner;
		}

		uint public numberOfQuestions; // Counter for the number of questions been asked

		/* The function (addQuestion) can be used only while voting time period (with the help of the whileVoting modifier),
		it insure that the voter has voting & question rights, saves the question and update the counter */
		function addQuestion (string memory _question) public whileVoting {
			require(voters[msg.sender] == 1 , "Question can't be asked"); // make sure he has voting & asking rights
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

		function isCandidate (address _helper) public view returns(bool ok) {
			for (uint i = 1; i <= numberOfCandidates; i++) {
				if (candidates[i].candidateAddress == _helper) {
					return(true);
				}
			}
			return(false);
		}

		event NewQuestion (uint indexed questionId);
		event NewAnswer (uint indexed questionId, address indexed candidateId);
	//--------------------------------------------------------------------------------------------------------------------------------//

/* voter can request from admin to get voting rights
function for pending request
mapping form a key (counter) to address
insure he doesn't have voting rights
function move from pendeing to voters */

	//mapping (uint => mapping(address => uint)) public pendingVoters; // can be done with only maaping (uint => address)
	mapping (uint => address) public pendingVoters;
	uint public numberOfPendingRequest;

	/* The function (addNewRequesst) can be used only before voting started (with the help of the beforeVoting modifer).
	It the the requester hasn't have voting rights and does n ot have anther pendding request.
	update requester status to pendding request (voters == 4) and updating the pendingVoters mapping */
	function addNewRequest () public beforeVotingStarted {
		require(voters[msg.sender] == 0, "The request is invalid"); // insure he hasn't have voting rights
		voters[msg.sender] = 4; // update requester status to pendding request!!!!!!!!
		numberOfPendingRequest++; // increase counter by one

	}
	/* The function (getPendingRequesters) returns an array of address, oreder by the key in pending voters */
	function getPendingRequesters() public view onlyAdmin beforeVotingStarted returns(address[] memory _pendingRequesters) {
		for(uint i = 1; i <= numberOfPendingRequest; i++) {
			_pendingRequesters[i] = pendingVoters[i];
		}
		return (_pendingRequesters);
	}

	function approveRequest(uint _requesterId) public onlyAdmin beforeVotingStarted {
		require(voters[pendingVoters[_requesterId]] == 4, "Can't approve");
		voters[pendingVoters[_requesterId]] == 1; // update his voting rigths
		pendingVoters[_requesterId] = pendingVoters[numberOfPendingRequest];
		numberOfPendingRequest--;

	}

}
