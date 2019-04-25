from collections import OrderedDict
from merkletools import *
from bloom_filter import BloomFilter
import binascii
import Crypto
import Crypto.Random
from Crypto.Hash import SHA
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5

import hashlib
import json
from urllib.parse import urlparse
from uuid import uuid4
import requests
from datetime import datetime

MINING_SENDER = "THE BLOCKCHAIN"
MINING_REWARD = 1
MINING_DIFFICULTY = 4

#KEYS
# BLOCK
TRANSACTIONS = 'transactions'
BLOCK_HEADER_KEY = 'header'
# HEADER
TRANSACTIONS_SIGNATURES = 'transactions_signatures'
BLOOM_FILTER = 'bloom_filter'
MERKLE_ROOT_KEY = 'merkleRoot'


class Transaction:

    def __init__(self, sender_address, recipient_address, amount,  timestamp=None, signature=None):
        self.sender_address = sender_address
        self.recipient_address = recipient_address
        self.amount = amount
        self.timestamp = timestamp if timestamp else str(datetime.now())
        self.signature = signature

    def __getattr__(self, attr):
        return self.data[attr]

    def to_dict(self):
        return OrderedDict({'sender_address': self.sender_address,
                            'recipient_address': self.recipient_address,
                            'amount': self.amount,
                            'timestamp': self.timestamp,
                            'signature': self.signature})
    def calc_hash(self):
        return SHA.new(str({'sender_address': self.sender_address,
                            'recipient_address': self.recipient_address,
                            'amount': self.amount,
                            'timestamp': self.timestamp}).encode('utf8'))
    def is_valid(self):
        public_key = RSA.importKey(binascii.unhexlify(self.sender_address))
        verifier = PKCS1_v1_5.new(public_key)
        h = self.calc_hash()
        return verifier.verify(h, binascii.unhexlify(self.signature))

    def sign_transaction(self, sender_private_key):
        """
        Sign transaction with private key
        """
        if self.signature :
            return self.signature

        private_key = RSA.importKey(binascii.unhexlify(sender_private_key))
        signer = PKCS1_v1_5.new(private_key)
        h = self.calc_hash()
        self.signature = binascii.hexlify(signer.sign(h)).decode('ascii')
        return self.signature

class BlockHeader:
        def __init__(self, payload):
            self.block_number = payload.get('block_number')
            self.timestamp = payload.get('timestamp')
            self.merkleRoot = payload.get('merkleRoot')
            self.nonce = payload.get('nonce')
            self.previous_hash = payload.get('previous_hash')
            self.num_of_transactions = payload.get('num_of_transactions')
            self.signatures = payload.get('signatures')

        def __getattr__(self, attr):
            return self.data[attr]

        def to_dict(self):
            return OrderedDict({'block_number': self.block_number,
                                'timestamp': self.timestamp,
                                'nonce': self.nonce,
                                'merkleRoot': self.merkleRoot,
                                'previous_hash': self.timestamp,
                                'num_of_transactions': self.num_of_transactions,
                                'signatures': self.signatures})

class Block:
    def __init__(self, payload):
        self.header = BlockHeader(payload.get(BLOCK_HEADER_KEY))
        self.transactions = list(map(lambda tx: Transaction(tx), payload.get(TRANSACTIONS)))

    def __getattr__(self, attr):
        return self.data[attr]

    def to_dict(self):
        return OrderedDict({BLOCK_HEADER_KEY: self.header.to_dict(),
                            TRANSACTIONS: list(map(lambda tx: tx.to_dict(), self.transactions))})

class Base:

    def __init__(self):
        self.chain = [] # Blocks for Full Node, BlockHeaders for SPVs
        self.nodes = set() # Nighebors
        self.node_id = str(uuid4()).replace('-', '') # My id
        #Create genesis block
        self.create_block(0, '00') # Gen

    def register_node(self, node_url):
        """
        Add a new node to the list of nodes
        """
        #Checking node_url has valid format
        parsed_url = urlparse(node_url)
        if parsed_url.netloc:
            self.nodes.add(parsed_url.netloc)
        elif parsed_url.path:
            # Accepts an URL without scheme like '192.168.0.5:5000'.
            self.nodes.add(parsed_url.path)
        else:
            raise ValueError('Invalid URL')

    def hash(self, block):
        """
        Create a SHA-256 hash of a block
        """
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()


    def create_block(self, nonce, previous_hash):
        pass

# SPV Wallet
class BlockchainSPV(Base):
    def __init__(self):
        Base.__init__(self)

    def create_block(self, nonce, previous_hash):
        pass

    # Validating Using Headers only! - using signatures
    def validate_transaction(self, transaction):
        is_valid = False
        # First check!
        if not transaction.is_valid():
            return  is_valid
        signature = transaction.signature
        header = self.get_block_header_for(signature)
        if not header:
            return is_valid
        # Reconstracting the Merkle tree using leaves only
        mt = MerkleTools()
        signatures = header.get(TRANSACTIONS_SIGNATURES)
        mt.add_leaf(signatures, True)
        mt.make_tree()
        # Merkle Proof!
        index = signature.index(signature)
        # Using originale root! nad not new one which validate indeed!
        is_valid = mt.validate_proof(mt.get_proof(index), mt.get_leaf(index), header.get(MERKLE_ROOT_KEY))
        return is_valid


    def get_block_header_for(self, signature):
        # For now asking full noode - todo change to hold it myself
        res = requests.get('http://127.0.0.1:5000/block/get/' +signature)
        print(res.json())
        return res.json().get(BLOCK_HEADER_KEY)


# Full Node
class Blockchain(Base):

    def __init__(self):
        self.pending_transactions = []
        Base.__init__(self)


    def submit_transaction(self, transaction):
        # Bloom Filter Usage
        if self.is_transaction_exsits(transaction.signature):
            False

        #Reward for mining a block
        if transaction.sender_address == MINING_SENDER:
            self.pending_transactions.append(transaction.to_dict())
            return len(self.chain) + 1
        # Manages transactions from wallet to another wallet
        else:
            if transaction.is_valid():
                self.pending_transactions.append(transaction.to_dict())
                return len(self.chain) + 1
            else:
                return False

    def get_block_header_by(self, signature):

        for block in self.chain:
            # look for the blo
            header = block.get('header')
            signatures = header.get(TRANSACTIONS_SIGNATURES)
            print('signatures = '.format(signatures))
            if signature in signatures:
                return header

        return None

    def is_transaction_exsits(self, trans_signatues):
        is_exist = False
        for block in self.chain:
            bloom = block.get(BLOOM_FILTER)
            if not bloom:
                continue
            in_bloom = trans_signatues in bloom
            if not in_bloom:
                continue
            # Lets make sure
            header = block.get(BLOCK_HEADER_KEY)
            if not header:
                continue
            signatures = header.get(TRANSACTIONS_SIGNATURES)
            is_exist = trans_signatues in signatures

        return is_exist

    def create_block(self, nonce, previous_hash):
        """
        Add a block of transactions to the blockchain
        Each block Holds a MekrleTree
        """
        oldest_pending_tx = self.pending_transactions[:4]

        # Merkle Tree of the blockchain
        mt = MerkleTools()
        # Adding transactions signatures as leaves
        signatures = list(map(lambda tx: tx.get('signature'), oldest_pending_tx))
        print('adding transactions to mr - {}'.format(signatures))
        mt.add_leaf(signatures, True)
        # Check Bloom Filter support
        mt.make_tree()

        # bloom = BloomFilter(max_elements=10000, error_rate=0.1)
        # for s in signatures:
        #     bloom.add(s)

        block = {
                BLOCK_HEADER_KEY: {
                    'block_number': len(self.chain) + 1,
                    'timestamp': str(datetime.now()),
                    'merkleRoot': mt.get_merkle_root(),
                    'nonce': nonce,
                    'previous_hash': previous_hash,
                    'num_of_transactions':  len(oldest_pending_tx),
                    TRANSACTIONS_SIGNATURES: signatures
                },
                'transactions': oldest_pending_tx,
                # BLOOM_FILTER: bloom,
                }

        self.pending_transactions = self.pending_transactions[4:]

        self.chain.append(block)
        return block

    def proof_of_work(self):
        """
        Proof of work algorithm
        """
        last_block = self.chain[-1]
        last_hash = self.hash(last_block)

        nonce = 0
        while self.valid_proof(self.pending_transactions, last_hash, nonce) is False:
            nonce += 1

        return nonce


    def valid_proof(self, transactions, last_hash, nonce, difficulty=MINING_DIFFICULTY):
        """
        Check if a hash value satisfies the mining conditions. This function is used within the proof_of_work function.
        """
        guess = (str(transactions)+str(last_hash)+str(nonce)).encode()
        guess_hash = hashlib.sha256(guess).hexdigest()
        return guess_hash[:difficulty] == '0'*difficulty

    def get_balance_for_address(self, address):
        balance = 0;
        for block in self.chain:
            for tx in block.get('transactions', []):
                if tx.get('sender_address') == address:
                    balance -= float(tx.get('amount', 0))
                if tx.get('recipient_address') == address:
                    balance += float(tx.get('amount', 0))
        return balance

    def valid_chain(self, chain):
        """
        check if a bockchain is valid
        """
        last_block = chain[0]
        current_index = 1

        while current_index < len(chain):
            block = chain[current_index]
            if block.get('previous_hash',None) != self.hash(last_block):
                return False

            # Check that the Proof of Work is correct
            # Delete the reward transaction
            transactions = block['transactions'][:-1]

            # Need to make sure that the dictionary is ordered. Otherwise we'll get a different hash
            transaction_elements = ['sender_address', 'recipient_address', 'amount', 'signature']
            transactions = [OrderedDict((k, transaction[k]) for k in transaction_elements) for transaction in transactions]

            if not self.valid_proof(transactions, block['previous_hash'], block['nonce'], MINING_DIFFICULTY):
                return False

            last_block = block
            current_index += 1

        return True

    def resolve_conflicts(self):
        """
        Resolve conflicts between blockchain's nodes
        by replacing our chain with the longest one in the network.
        """
        neighbours = self.nodes
        new_chain = None

        # We're only looking for chains longer than ours
        max_length = len(self.chain)

        # Grab and verify the chains from all the nodes in our network
        for node in neighbours:
            print('http://' + node + '/chain')
            response = requests.get('http://' + node + '/chain')

            if response.status_code == 200:
                length = response.json()['length']
                chain = response.json()['chain']

                # Check if the length is longer and the chain is valid
                if length > max_length and self.valid_chain(chain):
                    max_length = length
                    new_chain = chain

        # Replace our chain if we discovered a new, valid chain longer than ours
        if new_chain:
            self.chain = new_chain
            return True

        return False
