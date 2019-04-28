import sys
import os
p = os.getcwd()
sys.path.insert(0, p)
from blockchain.blockchain import Transaction, BlockchainSPV

import Crypto.Random
from Crypto.PublicKey import RSA
import binascii

import requests
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)

spv = BlockchainSPV()

Cache = {}

@app.route('/')
def index():
	return render_template('./index.html')

WALLET_END_POINT = '/wallet'
@app.route(WALLET_END_POINT, methods=['GET'])
def new_wallet():
	if Cache.get(WALLET_END_POINT):
		return Cache[WALLET_END_POINT], 200
	random_gen = Crypto.Random.new().read
	private_key = RSA.generate(1024, random_gen)
	public_key = private_key.publickey()
	response = {
		'private_key': binascii.hexlify(private_key.exportKey(format='DER')).decode('ascii'),
		'public_key': binascii.hexlify(public_key.exportKey(format='DER')).decode('ascii')
	}
	Cache[WALLET_END_POINT] = jsonify(response)
	return Cache[WALLET_END_POINT], 200

@app.route('/validate/transaction', methods=['POST'])
def validate_transaction():

	transaction = Transaction(**request.form)
	response = {'is_valid': spv.validate_transaction(transaction)}
	
	return jsonify(response), 200

@app.route('/generate/transaction', methods=['POST'])
def generate_transaction():

	sender_address = request.form['sender_address']
	recipient_address = request.form['recipient_address']
	amount = request.form['amount']

	transaction = Transaction(sender_address, recipient_address, amount)

	sender_private_key = request.form['sender_private_key']
	signature = transaction.sign_transaction(sender_private_key)

	response = {'transaction': transaction.to_dict()}

	return jsonify(response), 200

@app.route('/nodes/consensus', methods=['GET'])
def consensus():
    replaced = spv.consensus()

    if replaced:
        response = {
            'message': 'Our chain was replaced',
            'new_chain': spv.chain
        }
    else:
        response = {
            'message': 'Our chain is authoritative',
            'chain': spv.chain
        }
    return jsonify(response), 200

@app.route('/nodes/register', methods=['POST'])
def register_nodes():
    values = request.form
    nodes = values.get('nodes').replace(" ", "").split(',')

    if nodes is None:
        return "Error: Please supply a valid list of nodes", 400

    for node in nodes:
        spv.register_node(node)

    response = {
        'message': 'New nodes have been added',
        'total_nodes': [node for node in spv.nodes],
    }
    return jsonify(response), 201

if __name__ == '__main__':
    from argparse import ArgumentParser

    parser = ArgumentParser()
    parser.add_argument('-p', '--port', default=8080, type=int, help='port to listen on')
    args = parser.parse_args()
    port = args.port

    app.run(host='127.0.0.1', port=port)
