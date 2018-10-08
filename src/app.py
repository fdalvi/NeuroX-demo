from flask import Flask
from flask import render_template
from flask import request, jsonify, send_from_directory

import json
import numpy as np
import torch

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
 
# convert nested list of lists / tensors
# to a flat element stream
def flatten(x):
	if type(x) == torch.Tensor:
		yield from x.tolist()
	elif type(x) == list or type(x) == tuple:
		for y in x:
			yield from flatten(y)
	else:
		yield x


# creates a Flask application, named app
app = Flask(__name__, template_folder="client/dist")
app.config.from_mapping({
	"JS_FOLDER": "client/dist/js"
})

# Fake projects - Eventually will come from a database
database = {
	'4e763af331': {
		'id': "4e763af331",
		'projectName': "English-Spanish bidirectional model",
		'creationDate': "2 September, 2018",
		'modelPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/models/en-es-1.pt',
		'textPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/train.tok',
		'mtTestPath': '/data/sls/qcri/mt/work/NeuroDissection/iwslt.en',
		'mtReferencePath': '/data/sls/qcri/mt/work/NeuroDissection/iwslt.es',
		'outputStyler': '{"direction": "ltr", "fontFamily": "monospace"}',
		'rankings': [
			{
				'id': 0,
				'type': 'cross-model',
				'name': 'Model 2/3 Cross-Model Ranking',
				'crossModelPaths': '/data/sls/qcri/mt/work/NeuroDissection/test_data/models/en-es-2.pt\n/data/sls/qcri/mt/work/NeuroDissection/test_data/models/en-es-3.pt',
				'tokensPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.tok',
			},
			{
				'id': 1,
				'type': 'task-specific',
				'name': 'Part-of-Speech Ranking',
				'tokensPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.tok',
				'labelsPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.pos'
			},
			{
				'id': 2,
				'type': 'univariate',
				'name': 'Part-of-Speech Univariate Feature Selection',
				'tokensPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.tok',
				'labelsPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.pos'
			},
			{
				'id': 3,
				'type': 'task-specific',
				'name': 'Semantic Tags Ranking',
				'tokensPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/14ktrain.tok',
				'labelsPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/14ktrain.sem'
			}
		],
		'store': {
			'activations': '/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-es-1.pt_train.tok.pt',
			'outputs': '/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_outputs/en-es-1.pt_train.tok.out',
			'rankings': {
				0: {
					'activations': [
							'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-es-1.pt_10ktrain.tok.pt',
							'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-es-2.pt_10ktrain.tok.pt',
							'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-es-3.pt_10ktrain.tok.pt'
						],
					'ranking': '/data/sls/qcri/mt/work/NeuroDissection/test_data/cross_correlations/en-es-10k-activations.json'
				},
				1: {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-es-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroDissection/test_data/linguistic_correlations_POS/en-es-1.pt_10ktrain.tok/top_neurons.json'
				},
				2: {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-es-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroDissection/test_data/univariate_POS/en-es-1.pt_10ktrain.tok.json'
				},
				3: {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-es-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroDissection/test_data/linguistic_correlations_SEM/en-es-1.pt_14ktrain.tok/top_neurons.json'
				},
			}
		}
	},
	'4e763af332': {
		'id': "4e763af332",
		'projectName': "English-Arabic 2-layer model",
		'creationDate': "9 September, 2018",
		'modelPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/models/en-ar-1.pt',
		'textPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/train.tok',
		'mtTestPath': '/data/sls/qcri/mt/work/NeuroDissection/iwslt.en',
		'mtReferencePath': '/data/sls/qcri/mt/work/NeuroDissection/iwslt.ar',
		'outputStyler': '{"direction": "rtl", "fontFamily": "Roboto"}',
		'rankings': [
			{
				'id': 0,
				'type': 'cross-model',
				'name': 'Model 2/3 Cross-Model Ranking',
				'crossModelPaths': '/data/sls/qcri/mt/work/NeuroDissection/test_data/models/en-ar-2.pt\n/data/sls/qcri/mt/work/NeuroDissection/test_data/models/en-ar-3.pt',
				'tokensPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.tok',
			},
			{
				'id': 1,
				'type': 'task-specific',
				'name': 'Part-of-Speech Ranking',
				'tokensPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.tok',
				'labelsPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.pos'
			},
			{
				'id': 2,
				'type': 'univariate',
				'name': 'Part-of-Speech Univariate Feature Selection',
				'tokensPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.tok',
				'labelsPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/10ktrain.pos'
			},
			{
				'id': 3,
				'type': 'task-specific',
				'name': 'Semantic Tags Ranking',
				'tokensPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/14ktrain.tok',
				'labelsPath': '/data/sls/qcri/mt/work/NeuroDissection/test_data/inputs/14ktrain.sem'
			}
		],
		'store': {
			'activations': '/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-ar-1.pt_train.tok.pt',
			'outputs': '/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_outputs/en-ar-1.pt_train.tok.out',
			'rankings': {
				0: {
					'activations': [
							'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-ar-1.pt_10ktrain.tok.pt',
							'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-ar-2.pt_10ktrain.tok.pt',
							'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-ar-3.pt_10ktrain.tok.pt'
						],
					'ranking': '/data/sls/qcri/mt/work/NeuroDissection/test_data/cross_correlations/en-ar-10k-activations.json'
				},
				1: {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-ar-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroDissection/test_data/linguistic_correlations_POS/en-ar-1.pt_10ktrain.tok/top_neurons.json'
				},
				2: {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-ar-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroDissection/test_data/univariate_POS/en-ar-1.pt_10ktrain.tok.json'
				},
				3: {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroDissection/test_data/decoded_activations/en-ar-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroDissection/test_data/linguistic_correlations_SEM/en-ar-1.pt_14ktrain.tok/top_neurons.json'
				},
			}
		}
	}
}

# Sessions data
sessions = {}

def load_session_data(project_id):
	model_path = database[project_id]['modelPath']
	text_path = database[project_id]['textPath']
	store_paths = database[project_id]['store']

	print("Loading activations...")
	raw_activations_path = store_paths['activations']
	activations = torch.load(raw_activations_path)

	print("Normalizing activations...")
	norm = max(abs(value) for value in flatten(activations))
	norm_activations = listify(activations, norm=norm)

	print("Flattening activations...")
	activations = listify(activations, norm=1)
	activations = [np.array([[neurons for layer in token for neurons in layer] for token in sent]) for sent in activations]
	norm_activations = [np.array([[neurons for layer in token for neurons in layer] for token in sent]) for sent in norm_activations]

	print("Computing Statistics...")
	activations = np.concatenate(activations)
	means = np.mean(activations, axis=0)
	stds = np.std(activations, axis=0)

	print("Loading source text...")
	source_path = text_path
	source_text = []
	with open(source_path) as fp:
		for line in fp:
			source_text.append(line.strip().split(' '))

	print("Loading source tokens...")
	source_tokens = [t for s in source_text for t in s]

	if len(source_tokens) != activations.shape[0]:
		print("[WARNING] Mismatch in number of tokens and activations")
		print("[WARNING] Activation Maps and Top Words may be corrupted")

	print("Loading predictions...")
	pred_path = store_paths['outputs']
	pred_text = []
	with open(pred_path) as fp:
		for line in fp:
			pred_text.append(line.strip().split(' '))

	print("Loading rankings...")
	rankings = []
	for ranking in database[project_id]['rankings']:
		if ranking['type'] == "cross-model":
			lang_pair = model_path.split('/')[-1][:5]
			correlations_path = store_paths['rankings'][ranking['id']]['ranking']
			with open(correlations_path, 'r') as fp:
				correlations = json.load(fp)
			rankings.append({
				'name': ranking['name'],
				'ranking': [x[0] for x in correlations[lang_pair + '-1']]
			})
		if ranking['type'] == "task-specific":
			results_path = store_paths['rankings'][ranking['id']]['ranking']
			with open(results_path, 'r') as fp:
				top_neurons = json.load(fp)
			
			sub_rankings = []
			for label, t_n in top_neurons['top_neurons_per_label'].items():
				sub_rankings.append({
					'name': label,
					'ranking': t_n
				})

			rankings.append({
				'name': ranking['name'],
				'ranking': top_neurons['ranking'],
				'sub_rankings': sub_rankings
			})
		if ranking['type'] == "univariate":
			results_path = store_paths['rankings'][ranking['id']]['ranking']
			with open(results_path, 'r') as fp:
				top_neurons = json.load(fp)
			
			sub_rankings = []
			for label, t_n in top_neurons['top_neurons_per_label'].items():
				sub_rankings.append({
					'name': label,
					'ranking': t_n
				})

			rankings.append({
				'name': ranking['name'],
				'ranking': top_neurons['ranking'],
				'sub_rankings': sub_rankings
			})

	sessions[project_id] = {
		'activations': activations,
		'norm_activations': norm_activations,
		'means': means,
		'stds': stds,
		'source_text': source_text,
		'pred_text': pred_text,
		'rankings': rankings,
		'source_tokens': source_tokens
	}

# a route where we will display a welcome message via an HTML template
@app.route("/")
def index():
	return render_template('index.html', projects=[database[x] for x in sorted(database, key=lambda p: database[p]['creationDate'], reverse=True)])

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(app.config['JS_FOLDER'],
                               filename, as_attachment=True)
@app.route("/analyze")
def analyze():
	project_id = request.args.get('project')

	if project_id not in database:
		# Lead to error page
		return render_template('index.html')

	# if project_id not in sessions:
	# 	load_session_data(project_id)

	project_info = database[project_id]
	return render_template('analyze.html', project_info=project_info)

@app.route("/initializeProject", methods=['POST'])
def initialize_project():
	project_id = request.json['project_id']
	if project_id not in sessions:
		load_session_data(project_id)
	return jsonify({'success': True})

@app.route("/getText", methods=['POST'])
def get_text():
	project_id = request.json['project_id']

	if project_id not in sessions:
		return jsonify({'success': False})
	else:
		project_data = sessions[project_id]
		return jsonify({
			'success': True,
			'source': project_data['source_text'],
			'pred': project_data['pred_text']
		})


@app.route("/getRankings", methods=['POST'])
def get_rankings():
	project_id = request.json['project_id']

	if project_id not in sessions:
		return jsonify({'success': False})
	else:
		project_data = sessions[project_id]
		return jsonify({
			'success': True,
			'rankings': project_data['rankings']
		})

@app.route("/getActivations", methods=['POST'])
def get_activations():
	project_id = request.json['project_id']
	neurons = request.json['neurons']

	if project_id not in sessions:
		return jsonify({'success': False})
	else:
		project_data = sessions[project_id]
		all_activations = project_data['norm_activations']

		filtered_activations = {n: [] for n in neurons}
		for a in all_activations:
			for n in neurons:
				curr_activations = list(a[:, n])
				filtered_activations[n].append(curr_activations)

		filtered_activations = [{'neuron':n, 'activations': filtered_activations[n]} for n in neurons]

		return jsonify({
			'success': True,
			'activations': filtered_activations
		})

@app.route("/getTopWords", methods=["POST"])
def get_top_words():
	SMOOTHING_FACTOR = 4

	project_id = request.json['project_id']
	neuron = int(request.json['neuron'])

	if project_id not in sessions:
		return jsonify({'success': False})
	else:
		project_data = sessions[project_id]
		activations = project_data['activations']
		tokens = project_data['source_tokens']
		mean = project_data['means'][neuron]
		std = project_data['stds'][neuron]

		individual_token_sums = {}
		individual_token_counts = {}
		for i, token_acts in enumerate(activations):
			token_act = token_acts[neuron]
			if tokens[i] not in individual_token_sums:
				individual_token_sums[tokens[i]] = 0
				individual_token_counts[tokens[i]] = 0
			individual_token_sums[tokens[i]] += (token_act - mean)/std
			individual_token_counts[tokens[i]] += 1

		for k in individual_token_sums:
			individual_token_sums[k] /= (individual_token_counts[k] + SMOOTHING_FACTOR)

		sorted_a = sorted(individual_token_sums, key=lambda k:abs(individual_token_sums[k]), reverse=True)
		top_words = sorted_a[:20]
		top_acts = [individual_token_sums[t] for t in top_words]
		norm = max([abs(a) for a in top_acts]) * 3 # arbitrary value, come up with better way
		top_acts = [t/norm for t in top_acts]

		top_results = [{'token': top_words[i], 'activation': top_acts[i]} for i in range(len(top_words))]

		return jsonify({
			'neuron': neuron,
			'mean': mean,
			'std': std,
			'top_words': top_results
		})

# run the application
if __name__ == "__main__":  
	app.run(host="0.0.0.0", port="5001", debug=True)