import sys
import os
import subprocess
import requests
import time

def cleanup(process):
    print('Clenup - we had some fialure in the init process')
    for p in process:
        p.kill()

def init_nodes():
    print('Init Nodes')
    # Getting pwd
    current_dir = os.path.dirname(os.path.realpath(__file__))

    full_node_script = 'full_node/app.py'
    spv_node_script = 'spv_wallet/app.py'
    # Full Node
    full_node_script_path = '/'.join([current_dir, full_node_script])
    full_node_process = subprocess\
        .Popen(['python', full_node_script_path, '-p', '5000'],
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    # 2 - SPV
    spv_node_script_path = '/'.join([current_dir, spv_node_script])
    spv_1_process = subprocess\
        .Popen(['python', spv_node_script_path, '-p', '8080'],
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    spv_2_process = subprocess\
        .Popen(['python', spv_node_script_path, '-p', '8081'],
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    processes = [spv_1_process, spv_2_process, full_node_process]
    return processes

def register_and_validate_nodes(nodes_porcesses, base_urls):
    print('Registering Nodes')
    endpoint = '/nodes/register'
    registration_payload = ','.join(base_urls)
    res_codes = []
    for url in base_urls:
        url = ''.join([url, endpoint])
        r = requests.post(url, data = {'nodes': registration_payload})
        res_codes.append(r.status_code)

    print('Validating Nodes')
    for code in res_codes:
        if code > 299:
            cleanup(nodes_porcesses)

def _open_gui_mac(nodes_urls, client_urls):
    for url in nodes_urls+client_urls:
        subprocess.Popen(['open', '-a', "Google Chrome", url])
    return True

# TODO - support windows with script
def _open_gui_win(nodes_urls, client_urls):
    return False

def open_gui(platform, nodes_urls, client_urls):
    print('Open Nodes and Client UI in Chrome Browser!')
    if platform == 'mac':
        return _open_gui_mac(nodes_urls, client_urls)

    if platform == 'win':
        return _open_gui_win(nodes_urls, client_urls)

    return False



###################
# Start Of Script #
###################

argv = sys.argv

nodes_urls = ['http://localhost:5000']
client_urls = ['http://localhost:8080','http://localhost:8081' ]

# Extracting platform if mentioned
curr_platform = 'mac'
supported_platforms = ['mac', 'win']
if len(argv) > 1 and argv[1] is not None:
    curr_platform = str(argv[1])

if curr_platform not in supported_platforms:
    curr_platform = 'mac'

nodes_porcesses = init_nodes()

# Wiating for nodes and client to initielize
print('Waiting for nodes to come up!')
time.sleep(10)

register_and_validate_nodes(nodes_porcesses, nodes_urls)

open_gui = open_gui(curr_platform, nodes_urls, client_urls)

if not open_gui:
    cleanup(nodes_porcesses)

# Waiting for process to kill
for p in nodes_porcesses:
    for line in iter(p.stdout.readline, b''):
        print(line)
    # p.wait()
exit_codes = [p.wait() for p in nodes_porcesses]
print('nodes and client processes exit code = {}'.format(exit_codes))
