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

	constructor () public {
		admin = msg.sender;
	}

	modifier onlyAdmin { // Insure only admin can use a function
        require( msg.sender == admin, "Only Admin can call this function.");
        _;
    }
    modifier whileVoting { // Limitis changes after voting started (such as adding a candidate or adding voters)
    	require(now < votingEndDate && now >= votingStartDate, "Voting has started.");
    	_;
    }
    modifier beforeVotingStarted {
    	require( votingStartDate > now, "Voting has started, can bot add new candidates");
    	_;
    }

    function isAdmin () public returns (bool TF) {
    	return (msg.sender == admin);
    }

	function addingCandidate (string memory _name, string memory _agenda) public onlyAdmin beforeVotingStarted { // Adding a new candidate to candidates mapping		
		numberOfCandidates++;
		candidates[numberOfCandidates] = Candidate(numberOfCandidates, _name, _agenda, 0);
	}

	function defineVotingDates (uint _startDate, uint _endDate) public onlyAdmin  { 
		require ( _endDate > _startDate && _startDate > now, "Dates are not valid");
		votingStartDate = _startDate;
		votingEndDate = _endDate;
	}

}


// list the candidates that will run in the election
//  keep track of all the votes and voters
// It will also govern all of the rules of the election, like enforcing accounts to only vote once. 





// contract Voting {


//     mapping(uint => Candidate) public candidatesList; // Candidates List
    
//     uint public candidatesNumber; // Holds number of candidates

//     //function addCandidate();

//     event candidateAdded(uint indexed _candidateId);



//     constructor () public {
//         addCandidate("Candidate 1");
//         addCandidate("Candidate 2");
//         voters[0] = true;
//     }

//     function addCandidate (string _name) private {
//         candidatesCount ++;
//         candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
//     }
// }
