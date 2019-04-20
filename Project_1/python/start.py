import sys
import os
import subprocess
import time

# TODO - support multi platform -win/lin/mac (mac implemented)
print(sys.argv)

# Extracting platform
supported_platforms = ['mac', 'win']
if len(argv) > 1 and argv[1] is not None:
    curr_platform = str(argv[1)

if curr_platform not in supported_platforms:
    curr_platform = 'mac'


# Getting pwd
current_dir = os.path.dirname(os.path.realpath(__file__))

full_node_script = 'blockchain/blockchain.py'
spv_node_script = 'blockchain/blockchain.py'
client_script = 'blockchain_client/blockchain_client.py'

# FullNode
full_node_script_path = '/'.join([current_dir, full_node_script])
print(full_node_script_path)
full_node_process = subprocess\
    .Popen(['python', full_node_script_path, '-p', '5000'],
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# # SPV - TODO - use SPV and NOT Fullnode implementaion
spv_1_process = subprocess\
    .Popen(['python', full_node_script_path, '-p', '5001'],
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)
spv_2_process = subprocess\
    .Popen(['python', full_node_script_path, '-p', '5002'],
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# We would like to auto register the the nodes with each other without the need to do so manually


# Client
# Enables creation of a wallet and ask for transactions from a specific node
client_script_path = '/'.join([current_dir, client_script])
client_process = subprocess\
    .Popen(['python', client_script_path, '-p', '8080'],
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)

processes = [client_process, spv_1_process, spv_2_process, full_node_process]

# Wiating for servers to initielize so
# browser will be open without the need to refresh
time.sleep(10)
# # Open Dashboards - accroding to platform - rest should be multiplatform supported
# # Nodes
subprocess.Popen(['open', '-a', "Google Chrome", 'http://localhost:5000'])
subprocess.Popen(['open', '-a', 'Google Chrome', 'http://localhost:5001'])
subprocess.Popen(['open', '-a', 'Google Chrome', 'http://localhost:5002'])
#
# # Client
subprocess.Popen(['open', '-a', 'Google Chrome', 'http://localhost:8080'])

# Waiting for process to kill
exit_codes = [p.wait() for p in processes]
