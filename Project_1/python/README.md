# Blockchain
This blockchain has the following features:

- Possibility of adding multiple nodes to the blockchain
- Proof of Work (PoW)
- Simple conflict resolution between nodes
- Transactions with RSA encryption

The blockchain client has the following features:

- Wallets generation using Public/Private key encryption (based on RSA algorithm)
- Generation of transactions with RSA encryption

Contains 2 dashboards:

- "Blockchain Frontend" for miners
- "Blockchain Client" for users to generate wallets and send coins


# Dependencies

- ```Python 3.6```
- ```pip 9.0.1``` - using pip3 a must for automatic dependencies installation
- ```Google Chrome```

# How to run the code

## First install requirements

 - Run ```pip install -r requirements.txt```

## Linux
- Run ```python start.py lin```

## Mac
- Run ```python start.py``` - defualt will be for Mac

## Windows
- Run ```python start.py win```


## Manual
1. To start a blockchain node, go to ```blockchain``` folder and execute the command below:
```python blockchain.py -p 5000```
2. You can add a new node to blockchain by executing the same command and specifying a port that is not already used. For example, ```python blockchain.py -p 5001```
3. TO start the blockchain client, go to ```blockchain_client``` folder and execute the command below:
```python blockchain_client.py -p 8080```
4. You can access the blockchain frontend and blockchain client dashboards from your browser by going to localhost:5000 and localhost:8080
