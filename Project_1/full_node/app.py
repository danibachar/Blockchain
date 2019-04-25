import sys
import os
p = os.getcwd()
sys.path.insert(0, p)
from blockchain.blockchain import Transaction, Blockchain ,MINING_SENDER, MINING_REWARD
import requests
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS

# I/O Operations
import pickle

BLOCKCHAIN_FILE_NAME = "THE_BLOCKCHAIN"
# Instantiate the Node
app = Flask(__name__)
CORS(app)

blockchain = None

@app.route('/')
def index():
    return render_template('./index.html')


@app.route('/transactions/new', methods=['POST'])
def new_transaction():
    values = request.form

    # Check that the required fields are in the POST'ed data
    required = ['sender_address', 'recipient_address', 'amount', 'signature']
    if not all(k in values for k in required):
        return 'Missing values', 400
    # Create a new Transaction
    transaction = Transaction(**values)
    # values['sender_address'], values['recipient_address'], values['amount'], values['signature']
    transaction_result = blockchain.submit_transaction(transaction)

    if transaction_result == False:
        response = {'message': 'Invalid Transaction!'}
        return jsonify(response), 406
    else:
        response = {'message': 'Transaction will be added to Block '+ str(transaction_result)}
        return jsonify(response), 201

@app.route('/balance/<address>', methods=['GET'])
def balance(address):
    balance = blockchain.get_balance_for_address(address)
    response = {'balance': balance}
    return jsonify(response), 200

@app.route('/block/get/<tx_signature>', methods=['GET'])
def get_block_header(tx_signature):
    response = {}
    
    header = blockchain.get_block_header_by(tx_signature)
    if header:
        response['header'] = header

    return jsonify(response), 200

@app.route('/transactions/get', methods=['GET'])
def get_transactions():
    transactions = blockchain.pending_transactions
    response = {'transactions': transactions}
    return jsonify(response), 200

@app.route('/chain', methods=['GET'])
def full_chain():
    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
    }
    return jsonify(response), 200

@app.route('/save', methods=['POST'])
def save_blockchain():
    # Update
    blockchain.resolve_conflicts()
    # Save
    try:
        pickle.dump(blockchain, open(BLOCKCHAIN_FILE_NAME, "wb"))
    except Exception as e:
        return jsonify({'error':'{}'.format(e)}), 400

    response = {
        'chain': blockchain.chain,
        'length': len(blockchain.chain),
    }
    return jsonify(response), 200

@app.route('/mine', methods=['GET'])
def mine():
    # We run the proof of work algorithm to get the next proof...
    last_block = blockchain.chain[-1]
    nonce = blockchain.proof_of_work()
    reward_transaction = Transaction(sender_address=MINING_SENDER,
                                     recipient_address=blockchain.node_id,
                                     amount=MINING_REWARD,
                                     signature="")
    # We must receive a reward for finding the proof.
    blockchain.submit_transaction(reward_transaction)

    # Forge the new Block by adding it to the chain
    previous_hash = blockchain.hash(last_block)
    block = blockchain.create_block(nonce, previous_hash)

    response = {
        'message': "New Block Forged",
        'block_number': block.get('header').get('block_number'),
        'transactions': block.get('transactions'),
        'nonce': block.get('header').get('nonce'),
        'previous_hash': block.get('header').get('previous_hash'),
    }
    return jsonify(response), 200



@app.route('/nodes/register', methods=['POST'])
def register_nodes():
    values = request.form
    nodes = values.get('nodes').replace(" ", "").split(',')

    if nodes is None:
        return "Error: Please supply a valid list of nodes", 400

    for node in nodes:
        blockchain.register_node(node)

    response = {
        'message': 'New nodes have been added',
        'total_nodes': [node for node in blockchain.nodes],
    }
    return jsonify(response), 201


@app.route('/nodes/resolve', methods=['GET'])
def consensus():
    replaced = blockchain.resolve_conflicts()

    if replaced:
        response = {
            'message': 'Our chain was replaced',
            'new_chain': blockchain.chain
        }
    else:
        response = {
            'message': 'Our chain is authoritative',
            'chain': blockchain.chain
        }
    return jsonify(response), 200


@app.route('/nodes/get', methods=['GET'])
def get_nodes():
    nodes = list(blockchain.nodes)
    response = {'nodes': nodes}
    return jsonify(response), 200



if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=5000, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port

    # Start of Blockchain
    try:
        # trying to load previouse blockchain if there was once
        blockchain = pickle.load(open(BLOCKCHAIN_FILE_NAME, "rb"))
    except Exception as e:
        # Instantiate the Blockchain
        blockchain = Blockchain()

    # Resolving confilicts
    blockchain.resolve_conflicts()

    app.run(host='127.0.0.1', port=port)
