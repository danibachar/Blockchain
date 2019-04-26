import sys
import os
import subprocess
import requests
import time
import platform
from io import StringIO

def cleanup(process):
    print('Clenup - we had some fialure in the init process')
    for p in process:
        p.kill()

def init_nodes(nodes_urls, client_urls):
    print('Init Nodes')
    # Getting pwd
    current_dir = os.path.dirname(os.path.realpath(__file__))

    processes = []

    full_node_script = 'full_node/app.py'
    spv_node_script = 'spv_wallet/app.py'
    # Full Node
    full_node_script_path = '/'.join([current_dir, full_node_script])
    for fn in nodes_urls:
        port = str(fn.split(':')[2])
        print('runing full node - {} from {}'.format(port, full_node_script_path))
        full_node_process = subprocess\
            .Popen(['python', full_node_script_path, '-p', port],
                                 stdout=sys.stdout, stderr=sys.stderr)
        processes.append(full_node_process)

    # 2 - SPV
    spv_node_script_path = '/'.join([current_dir, spv_node_script])
    for fn in client_urls:
        port = str(fn.split(':')[2])
        print('runing spv - {} from {}'.format(port, spv_node_script_path))
        p = subprocess \
            .Popen(['python', spv_node_script_path, '-p', port],
                   stdout=sys.stdout, stderr=sys.stderr)
        processes.append(p)

    return processes

def register_and_validate_nodes(nodes_porcesses, base_urls):
    print('Registering Nodes')
    endpoint = '/nodes/register'

    res_codes = []
    for url in base_urls:
        urls_without_mine = list(filter(lambda u: url != u, base_urls))
        url = ''.join([url, endpoint])
        print('register me - {}, nieghbours - {}'.format(url, urls_without_mine))
        try:
            registration_payload = ','.join(urls_without_mine)
            r = requests.post(url, data = {'nodes': registration_payload})
            res_codes.append(r.status_code)
        except Exception as e:
            print('Error while registering - {}, with - {}'.format(url, registration_payload))
            print('{},'.format(e))

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

nodes_urls = ['http://127.0.0.1:5000']
client_urls = ['http://127.0.0.1:8080','http://127.0.0.1:8081' ]

# Extracting platform if mentioned
curr_platform = 'mac'
# Checking for os
platform = platform.system().lower()
if platform is 'Darwin'.lower():
    curr_platform = 'mac'

if platform is 'Linux'.lower():
    curr_platform = 'lin'

if platform is 'Windows'.lower():
    curr_platform = 'win'

supported_platforms = ['mac', 'win']
if len(argv) > 1 and argv[1] is not None:
    curr_platform = str(argv[1])

if curr_platform not in supported_platforms:
    curr_platform = 'mac'

nodes_porcesses = init_nodes(nodes_urls, client_urls)

# Wiating for nodes and client to initielize
print('Waiting for nodes to come up!')
time.sleep(5)

register_and_validate_nodes(nodes_porcesses, nodes_urls)

open_gui = open_gui(curr_platform, nodes_urls, client_urls)

if not open_gui:
    print('Please open Chrome on these websites - {}'.format(nodes_urls + client_urls))

# Waiting for process to kill
exit_codes = [p.wait() for p in nodes_porcesses]
# print('nodes and client processes exit code = {}'.format(exit_codes))
