import argparse
import dill as pickle
import json
import os
import sys

sys.path.append('../aux_classifier')
import aux_classifier.utils as utils


def main():
	parser = argparse.ArgumentParser(description='Train a classifier')
	parser.add_argument('--model-folder', dest='model_folder', required=True,
					help='Location of saved model files')
	parser.add_argument('--fraction', type=float, default=0.1,
					help='Fraction of weight mass for top neuron selection')
	args = parser.parse_args()

	# Load Model
	with open(os.path.join(args.model_folder, "model.pkl"), "rb") as fp:
		model_dict = pickle.load(fp)

	model = model_dict['model']
	label2idx = model_dict['label2idx']
	idx2label = model_dict['idx2label']
	src2idx = model_dict['src2idx']
	idx2src = model_dict['idx2src']

	top_neurons, _ = utils.get_neuron_ordering(model, label2idx, search_stride=1000)
	_, top_neurons_per_label = utils.get_top_neurons(model, args.fraction, label2idx)

	# print(top_neurons)
	# print(top_neurons_per_label)

	# Convert to json friendly types
	top_neurons = [int(n) for n in top_neurons]
	top_neurons_per_label = {k: [int(n) for n in v] for k,v in top_neurons_per_label.items()}

	with open(os.path.join(args.model_folder, "top_neurons.json"), "w") as fp:
		json.dump({
			'ranking': top_neurons,
			'top_neurons_per_label': top_neurons_per_label
			}, fp)

if __name__ == '__main__':
	main()
