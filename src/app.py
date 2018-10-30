from flask import Flask
from flask import render_template
from flask import request, jsonify, send_from_directory

import server.database as database
import uuid
import multiprocessing as mp
from peewee import *

import json
import numpy as np
import torch

import sys
sys.path.append("external/opennmt-inspection")

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
	"JS_FOLDER": "client/dist/js",
	"IMG_FOLDER": "client/assets/img"
})
db = None

# Sessions data
sessions = {}

def load_session_data(project_id):
	project = database.Project.get(database.Project.id == uuid.UUID(project_id))
	rankings = []
	for ranking in database.Ranking.select().join(database.Project).where(database.Ranking.project == project.id):
		rankings.append({
			'id': ranking.id,
			'type': ranking.type,
			'name': ranking.name,
			'crossModelPaths': ranking.crossModelPaths,
			'tokensPath': ranking.tokensPath,
			'labelsPath': ranking.labelsPath,
			'store': ranking.store
		})
	project_struct = {
		'id': project.id,
		'projectName': project.projectName,
		'creationDate': project.creationDate,
		'modelPath': project.modelPath,
		'textPath': project.textPath,
		'mtTestPath': project.mtTestPath,
		'mtReferencePath': project.mtReferencePath,
		'outputStyler': project.outputStyler,
		'store': project.store,
		'rankings': rankings
	}
	model_path = project_struct['modelPath']
	text_path = project_struct['textPath']
	store_paths = project_struct['store']

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
	mins = np.min(activations, axis=0)
	maxs = np.max(activations, axis=0)

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
	for ranking in project_struct['rankings']:
		if ranking['type'] == "cross-model":
			lang_pair = model_path.split('/')[-1][:5]
			correlations_path = ranking['store']['ranking']
			with open(correlations_path, 'r') as fp:
				correlations = json.load(fp)

			rankings.append({
				'name': ranking['name'],
				'ranking': [x[0] for x in correlations[lang_pair + '-1']]
			})
		if ranking['type'] == "task-specific":
			results_path = ranking['store']['ranking']
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
			results_path = ranking['store']['ranking']
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

		# Common across all rankings
		forward_ablation_path = ranking['store']['ablation_forward']
		with open(forward_ablation_path, 'r') as fp:
			forward_ablation_results = list(map(float, fp.read().strip().split(" ")))
		backward_ablation_path = ranking['store']['ablation_backward']
		with open(backward_ablation_path, 'r') as fp:
			backward_ablation_results = list(map(float, fp.read().strip().split(" ")))
		rankings[-1]['forward_ablation_results'] = forward_ablation_results
		rankings[-1]['backward_ablation_results'] = backward_ablation_results

	sessions[project_id] = {
		'activations': activations,
		'norm_activations': norm_activations,
		'means': means,
		'stds': stds,
		'mins': mins,
		'maxs': maxs,
		'source_text': source_text,
		'pred_text': pred_text,
		'rankings': rankings,
		'source_tokens': source_tokens,
		'manipulator': None,
		'project_info': project_struct
	}

# a route where we will display a welcome message via an HTML template
@app.route("/")
def index():
	projects = []
	for project in database.Project.select().order_by(database.Project.creationDate.desc()):
		rankings = []
		for ranking in database.Ranking.select().join(database.Project).where(database.Ranking.project == project.id):
			rankings.append({
				'id': ranking.id,
				'type': ranking.type,
				'name': ranking.name,
				'crossModelPaths': ranking.crossModelPaths,
				'tokensPath': ranking.tokensPath,
				'labelsPath': ranking.labelsPath
			})
		projects.append({
			'id': project.id,
			'projectName': project.projectName,
			'creationDate': project.creationDate,
			'modelPath': project.modelPath,
			'textPath': project.textPath,
			'mtTestPath': project.mtTestPath,
			'mtReferencePath': project.mtReferencePath,
			'outputStyler': project.outputStyler,
			'rankings': rankings
		})
	return render_template('index.html', projects=projects)

@app.route('/img/<path:filename>')
def serve_imgs(filename):
    return send_from_directory(app.config['IMG_FOLDER'],
                               filename, as_attachment=True)

@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(app.config['JS_FOLDER'],
                               filename, as_attachment=True)
@app.route("/analyze")
def analyze():
	project_id = request.args.get('project')

	try:
		project = database.Project.get(database.Project.id == uuid.UUID(project_id))
		print(project)
		rankings = []
		for ranking in database.Ranking.select().join(database.Project).where(database.Ranking.project == project.id):
			rankings.append({
				'id': ranking.id,
				'type': ranking.type,
				'name': ranking.name,
				'crossModelPaths': ranking.crossModelPaths,
				'tokensPath': ranking.tokensPath,
				'labelsPath': ranking.labelsPath
			})
		project_struct = {
			'id': project.id,
			'projectName': project.projectName,
			'creationDate': project.creationDate,
			'modelPath': project.modelPath,
			'textPath': project.textPath,
			'mtTestPath': project.mtTestPath,
			'mtReferencePath': project.mtReferencePath,
			'outputStyler': project.outputStyler,
			'rankings': rankings
		}

		return render_template('analyze.html', project_info=project_struct)
	except DoesNotExist:
		return render_template('error.html')

@app.route("/manipulate")
def manipulate():
	project_id = request.args.get('project')

	try:
		project = database.Project.get(database.Project.id == uuid.UUID(project_id))
		print(project)
		rankings = []
		for ranking in database.Ranking.select().join(database.Project).where(database.Ranking.project == project.id):
			rankings.append({
				'id': ranking.id,
				'type': ranking.type,
				'name': ranking.name,
				'crossModelPaths': ranking.crossModelPaths,
				'tokensPath': ranking.tokensPath,
				'labelsPath': ranking.labelsPath
			})
		project_struct = {
			'id': project.id,
			'projectName': project.projectName,
			'creationDate': project.creationDate,
			'modelPath': project.modelPath,
			'textPath': project.textPath,
			'mtTestPath': project.mtTestPath,
			'mtReferencePath': project.mtReferencePath,
			'outputStyler': project.outputStyler,
			'rankings': rankings
		}

		return render_template('manipulate.html', project_info=project_struct)
	except DoesNotExist:
		return render_template('error.html')
	

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
		min_v = project_data['mins'][neuron]
		max_v = project_data['maxs'][neuron]

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
			'min': min_v,
			'max': max_v,
			'mean': mean,
			'std': std,
			'top_words': top_results
		})

@app.route("/getNeuronStats", methods=["POST"])
def get_neuron_stats():
	project_id = request.json['project_id']
	neuron = int(request.json['neuron'])

	if project_id not in sessions:
		return jsonify({'success': False})
	else:
		project_data = sessions[project_id]
		mean = project_data['means'][neuron]
		std = project_data['stds'][neuron]
		min_v = project_data['mins'][neuron]
		max_v = project_data['maxs'][neuron]

		return jsonify({
			'neuron': neuron,
			'min': min_v,
			'max': max_v,
			'mean': mean,
			'std': std
		})

def manipulate_and_translate(request_q, reply_q, model_path, text_path):
	from online_translator_v2 import init_model, translate

	translator = init_model(model_path, use_gpu=True)
	print("Model Loading complete...")

	sentences = []
	with open(text_path) as fp:
		for line in fp:
			sentences.append(line.strip())

	while True:
		modifications = request_q.get()
		print("Modifying neurons: ", modifications)
		output, dumps = translate(translator, sentences, modifications)
		reply_q.put(output)

@app.route("/startModifiedTranslation", methods=["POST"])
def start_modified_translation():
	project_id = request.json['project_id']
	if project_id not in sessions:
		return jsonify({'success': False, 'error': "Project not loaded!"})

	if sessions[project_id]['manipulator'] == None:
		print("Init-ing translator")
		request_q = mp.Queue()
		reply_q = mp.Queue()
		p = mp.Process(target=manipulate_and_translate,
			args=(request_q, reply_q,
					sessions[project_id]['project_info']['modelPath'],
					sessions[project_id]['project_info']['textPath']))
		p.start()
		sessions[project_id]['manipulator'] = (p, request_q, reply_q)

	p, request_q, reply_q = sessions[project_id]['manipulator']

	return jsonify({'success': True, 'message': "Translator is running."})

@app.route("/getModifiedTranslation", methods=["POST"])
def get_modified_translation():
	project_id = request.json['project_id']
	neurons = request.json['neurons']

	p, request_q, reply_q = sessions[project_id]['manipulator']
	request_q.put(neurons)

	modified_translations = reply_q.get()
	modified_translations = [line.strip().split(' ') for line in modified_translations]

	return jsonify({'success': True, 'message': modified_translations})


# run the application
if __name__ == "__main__":
	mp.set_start_method('spawn')
	db = database.init()
	app.run(host="0.0.0.0", port="5000", debug=True)
