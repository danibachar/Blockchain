Web3 = require('web3')
var solc = require("solc"); // import the solidity compiler
var fs = require("fs");  //import the file system module

web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
code = fs.readFileSync('Election.sol').toString()
compiledCode = solc.compile(code)

abiDefinition = JSON.parse(compiledCode.contracts[':Election'].interface)

VotingContract = web3.eth.contract(abiDefinition)
byteCode = compiledCode.contracts[':Election'].bytecode
deployedContract = VotingContract.new({data: byteCode, from: web3.eth.accounts[0], gas: 4700000})
contractInstance = VotingContract.at(deployedContract.address)

var candidates = {"Bill": 1, "Tom": 2, "Janice": 3}

var dateV = '22/11/2018'

function voteForCandidate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(dd<10) {
		dd = '0'+dd
	}
	if(mm<10) {
		mm = '0'+mm
	}
	today = dd + '/' + mm + '/' + yyyy;


	if(today.toString()==dateV){
		document.getElementById('vote').disabled = true;
		alert("Voting has been disabled");
	}else{


		var account = prompt("Please enter your registered number");
		$("#ID").html("Your Account ID: "+web3.eth.accounts[account]);
		$("#bal").html("Balance: "+web3.eth.getBalance(web3.eth.accounts[account])/Math.pow(10,18));
		var e = document.getElementById("candidate").value;
		var candidateName = e;

		try{
			contractInstance.vote(candidates[candidateName], {from: web3.eth.accounts[account]});
		}catch(err){
			if(err.toString()=='Error: VM Exception while processing transaction: revert'){
				alert("You have already voted.\n" + err);
			}
		}finally{
			$("#bal").html("Balance: "+web3.eth.getBalance(web3.eth.accounts[account])/Math.pow(10,18));
		}
	}
}

function countForCandidate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(dd<10) {
		dd = '0'+dd
	}
	if(mm<10) {
		mm = '0'+mm
	}
	today = dd + '/' + mm + '/' + yyyy;


	if(today.toString()==dateV){
		document.getElementById('win1').disabled = false;
		document.getElementById('vote').disabled = true;
		for(var i=1;i<4;i++){
			$("#candidate-"+i).html(contractInstance.candidates(i)[2].toString());
		}
	}else{
		alert("The results will be declared on 23/11/2018");
	}
}

function winner(){
	var max = 0;
	var candidateW = '';
	for(var i=1;i<4;i++){
		var votes = contractInstance.candidates(i)[2].toString();
		if(max<votes){
			candidateW = contractInstance.candidates(i)[1].toString();
			max = votes
		}
	}
	//alert(max + " "+ candidateW);
	$("#win").html("Winner is: " + candidateW);
}
