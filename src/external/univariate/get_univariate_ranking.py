import argparse
import torch
import numpy as np
import sys
import json

from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import f_classif

sys.path.append('../aux_classifier')
import aux_classifier.utils as utils

# adapted from anthony's code
# normalize a nested list of values
# convert and tensors to regular lists
def listify(x, norm=1):
	if type(x) == torch.Tensor:
		return (x / norm).tolist()
	elif type(x) == list or type(x) == tuple:
		return [listify(y, norm=norm) for y in x]
	else:
		return x

def main():
	parser = argparse.ArgumentParser(description='Train a classifier')
	parser.add_argument('--activations', dest='activations_file', required=True,
					help='Location of activations')
	parser.add_argument('--label', dest='label_file', required=True,
					help='Location of label')
	args = parser.parse_args()

	# Load Activations
	print("Loading activations...")
	activations = torch.load(args.activations_file)
	activations = listify(activations, norm=1)
	activations = [np.array([[neurons for layer in token for neurons in layer] for token in sent]) for sent in activations]
	activations = np.concatenate(activations)
	
	labels = []
	with open(args.label_file) as fp:
		for line in fp:
			labels.append(line.strip().split(' '))

	print("Loading source tokens...")
	labels = [t for s in labels for t in s]
	unique_labels = set(labels)
	label2idx = {}
	for i, l in enumerate(unique_labels):
		label2idx[l] = i
	labels = np.array([label2idx[l] for l in labels])

	
	print("Running selector...")

	selector = SelectKBest(f_classif, k='all').fit(activations, labels)
	ordering = np.argsort(selector.scores_)[::-1]
	top_neurons = [int(x) for x in ordering]
	print("Overall:", ordering[:20])
	
	top_neurons_per_label = {}

	for label in unique_labels:
		y_selected = np.zeros_like(labels)
		y_selected[np.where(labels == label2idx[label])[0]] = 1
		selector = SelectKBest(f_classif, k='all').fit(activations, y_selected)
		ordering = np.argsort(selector.scores_)[::-1]
		top_neurons_per_label[label] = [int(x) for x in ordering]
		print(label + ":", ordering[:20])

	with open("output.json", "w") as fp:
		json.dump({
			'ranking': top_neurons,
			'top_neurons_per_label': top_neurons_per_label
		}, fp)


if __name__ == '__main__':
	main()
