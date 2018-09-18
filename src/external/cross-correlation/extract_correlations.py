'''
FIND CORRELATED NEURONS BETWEEN NETWORKS
To use, generate description files using `describe.lua` from here: https://github.com/dabbler0/nmt-shared-information.
Then create a file listing the locations of the description files for your networks. For instance, I might create a file `myfile.txt` that reads:
```
../descriptions/en-es-1.desc.t7
../descriptions/en-es-2.desc.t7
../descriptions/en-fr-1.desc.t7
../descriptions/en-fr-2.desc.t7
```
Then invoke `python correlations.py --descriptions myfile.txt --output my_results.json`.
If you want to run correlation-min instead of correlation-max, add the --min flag: `python correlations.py --descriptions myfile.txt --min`.
'''

import argparse
import json
import numpy
import os
import torch

from itertools import product as p
from numpy import newaxis as na
from tqdm import tqdm

# For legacy torch format
from torch.utils.serialization import load_lua

FORMAT_OPENNMTPY = "OpenNMT-py"
FORMAT_SEQ2SEQ = "seq2seq-attn"
FORMAT_UNKNOWN = "UNKNOWN"

def detect_format(names):
    extension = names[0].split(".")[-1]

    if extension == "pt":
        return FORMAT_OPENNMTPY
    elif extension == "t7":
        return FORMAT_SEQ2SEQ
    else:
        return FORMAT_UNKNOWN

def main():
    parser = argparse.ArgumentParser(description = 'Run correlation analysis')
    parser.add_argument('--min', dest='pool', action='store_const', const=min, default=max)
    parser.add_argument('-d', '--descriptions', dest='descriptions', required=True,
        help = 'File with list of locations of description files (one per line)')
    parser.add_argument('-o', '--output', dest='output', required=True,
        help='Output file')

    args = parser.parse_args()

    # Load all the descriptions of networks
    # Get list of network filenames
    with open(args.descriptions) as f:
        network_filenames = [line.strip() for line in f]

    fmt = detect_format(network_filenames)
    assert fmt != FORMAT_UNKNOWN, "Activations are not extracted from OpenNMT-py or seq2seq-attn"

    activations = {}

    for fname in tqdm(network_filenames):
        network_name = os.path.split(fname)[1]
        network_name = network_name[:network_name.index('.')]

        # Load activations
        if fmt == FORMAT_SEQ2SEQ:
            current_activations = torch.cat(load_lua(fname)['encodings'])
        elif fmt == FORMAT_OPENNMTPY:
            current_activations = torch.load(fname)
            current_activations = torch.cat([torch.stack([torch.cat(token) for token in sentence]) for sentence in current_activations]).cpu()

        # Load as 4000x(sentence_length)x500 matrix
        activations[network_name] = current_activations

    '''
    Correlation-finding code. This should probably not need to be modified for ordinary use.
    ========================================================================================
    '''

    # Get means and stdevs so that we can whiten appropriately
    means = {}
    stdevs = {}
    for network in tqdm(activations, desc='mu, sigma'):
        means[network] = activations[network].mean(0, keepdim=True)
        stdevs[network] = (
            activations[network] - means[network].expand_as(activations[network])
        ).pow(2).mean(0, keepdim=True).pow(0.5)

    correlations = {network: {} for network in activations}

    # Get all correlation pairs
    for network, other_network in tqdm(p(activations, activations), desc='correlate', total=len(activations)**2):
        # Don't match within one network
        if network == other_network:
            continue

        # Correlate these networks with each other
        covariance = (
            torch.mm(
                activations[network].t(), activations[other_network] # E[ab]
            ) / activations[network].size()[0]
            - torch.mm(
                means[network].t(), means[other_network] # E[a]E[b]
            )
        )

        correlation = covariance / torch.mm(
            stdevs[network].t(), stdevs[other_network]
        )

        correlations[network][other_network] = correlation.cpu().numpy()

    # Get all "best correlation pairs"
    clusters = {network: {} for network in activations}
    for network, neuron in tqdm(p(activations, range(500)), desc='clusters', total=len(activations)*500):
        clusters[network][neuron] = {
            other: max(
                range(500),
                key = lambda i: abs(correlations[network][other][neuron][i])
            ) for other in correlations[network]
        }

    neuron_notated_sort = {}
    # For each network, created an "annotated sort"
    #
    # Sort neurons by worst best correlation with another neuron
    # in another network.
    for network in tqdm(activations, desc='annotation'):
        neuron_sort = sorted(
            range(500),
            key = lambda i: -args.pool(
                abs(correlations[network][other][i][clusters[network][i][other]])
                for other in clusters[network][i]
            )
        )

        # Annotate each neuron with its associated cluster
        neuron_notated_sort[network] = [
            (
                neuron,
                {
                    '%s:%d' % (other, clusters[network][neuron][other],):
                    float(correlations[network][other][neuron][clusters[network][neuron][other]])
                    for other in clusters[network][neuron]
                }
            )
            for neuron in neuron_sort
        ]

    json.dump(neuron_notated_sort, open(args.output, 'w'), indent = 4)

if __name__ == '__main__':
    main()