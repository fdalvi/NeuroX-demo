import database
import datetime
import uuid


db = database.init()

# Init Project 1
project_1 = database.Project.create(
	id = uuid.uuid4(),
	projectName = "English-Spanish bidirectional model",
	creationDate = datetime.datetime.strptime("2018-09-02", '%Y-%m-%d'),
	modelPath = "/data/sls/qcri/mt/work/NeuroX/test_data/models/en-es-1.pt",
	textPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/train.tok",
	mtTestPath = "/data/sls/qcri/mt/work/NeuroX/iwslt.en",
	mtReferencePath = "/data/sls/qcri/mt/work/NeuroX/iwslt.es",
	outputStyler = '{"direction": "ltr", "fontFamily": "monospace"}'
)

project_1_ranking_1 = database.Ranking.create(
	project = project_1.id,
	type = "cross-model",
	name = "Model 2/3 Cross-Model Ranking",
	crossModelPaths = "/data/sls/qcri/mt/work/NeuroX/test_data/models/en-es-2.pt\n/data/sls/qcri/mt/work/NeuroX/test_data/models/en-es-3.pt",
	tokensPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.tok"
)
project_1_ranking_2 = database.Ranking.create(
	project = project_1.id,
	type = "task-specific",
	name = "Part-of-Speech Ranking",
	tokensPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.tok",
	labelsPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.pos"
)
project_1_ranking_3 = database.Ranking.create(
	project = project_1.id,
	type = "univariate",
	name = "Part-of-Speech Univariate Feature Selection",
	tokensPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.tok",
	labelsPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.pos"
)
project_1_ranking_4 = database.Ranking.create(
	project = project_1.id,
	type = "task-specific",
	name = "Semantic Tags Ranking",
	tokensPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/14ktrain.tok",
	labelsPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/14ktrain.sem"
)

project_1.store = {
	'activations': '/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-es-1.pt_train.tok.pt',
	'outputs': '/data/sls/qcri/mt/work/NeuroX/test_data/decoded_outputs/en-es-1.pt_train.tok.out'
}

project_1.save()

project_1_ranking_1.store = {
				'activations': [
					'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-es-1.pt_10ktrain.tok.pt',
					'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-es-2.pt_10ktrain.tok.pt',
					'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-es-3.pt_10ktrain.tok.pt'
				],
				'ranking': '/data/sls/qcri/mt/work/NeuroX/test_data/cross_correlations/en-es-10k-activations.json',
				'ablation_forward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-es/Model-2-3-Cross-Model-Ranking.txt',
				'ablation_backward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-es/Model-2-3-Cross-Model-Ranking-Reverse.txt'
			}
project_1_ranking_1.save()
project_1_ranking_2.store = {
				'activations': [
					'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-es-1.pt_10ktrain.tok.pt',
				],
				'ranking': '/data/sls/qcri/mt/work/NeuroX/test_data/linguistic_correlations_POS/en-es-1.pt_10ktrain.tok/top_neurons.json',
				'ablation_forward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-es/Part-of-Speech-Ranking.txt',
				'ablation_backward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-es/Part-of-Speech-Ranking-Reverse.txt'
			}
project_1_ranking_2.save()
project_1_ranking_3.store = {
				'activations': [
					'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-es-1.pt_10ktrain.tok.pt',
				],
				'ranking': '/data/sls/qcri/mt/work/NeuroX/test_data/univariate_POS/en-es-1.pt_10ktrain.tok.json',
				'ablation_forward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-es/Part-of-Speech-Univariate-Feature-Selection.txt',
				'ablation_backward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-es/Part-of-Speech-Univariate-Feature-Selection-Reverse.txt'
			}
project_1_ranking_3.save()
project_1_ranking_4.store = {
				'activations': [
					'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-es-1.pt_10ktrain.tok.pt',
				],
				'ranking': '/data/sls/qcri/mt/work/NeuroX/test_data/linguistic_correlations_SEM/en-es-1.pt_14ktrain.tok/top_neurons.json',
				'ablation_forward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-es/Semantic-Tags-Ranking.txt',
				'ablation_backward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-es/Semantic-Tags-Ranking-Reverse.txt'
			}
project_1_ranking_4.save()

project_2 = database.Project.create(
	id = uuid.uuid4(),
	projectName = "English-Arabic 2-layer model",
	creationDate = datetime.datetime.strptime("2018-09-09", '%Y-%m-%d'),
	modelPath = "/data/sls/qcri/mt/work/NeuroX/test_data/models/en-ar-1.pt",
	textPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/train.tok",
	mtTestPath = "/data/sls/qcri/mt/work/NeuroX/iwslt.en",
	mtReferencePath = "/data/sls/qcri/mt/work/NeuroX/iwslt.ar",
	outputStyler = '{"direction": "rtl", "fontFamily": "Roboto"}'
)

project_2_ranking_1 = database.Ranking.create(
	project = project_2.id,
	type = "cross-model",
	name = "Model 2/3 Cross-Model Ranking",
	crossModelPaths = "/data/sls/qcri/mt/work/NeuroX/test_data/models/en-ar-2.pt\n/data/sls/qcri/mt/work/NeuroX/test_data/models/en-ar-3.pt",
	tokensPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.tok"
)
project_2_ranking_2 = database.Ranking.create(
	project = project_2.id,
	type = "task-specific",
	name = "Part-of-Speech Ranking",
	tokensPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.tok",
	labelsPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.pos"
)
project_2_ranking_3 = database.Ranking.create(
	project = project_2.id,
	type = "univariate",
	name = "Part-of-Speech Univariate Feature Selection",
	tokensPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.tok",
	labelsPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/10ktrain.pos"
)
project_2_ranking_4 = database.Ranking.create(
	project = project_2.id,
	type = "task-specific",
	name = "Semantic Tags Ranking",
	tokensPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/14ktrain.tok",
	labelsPath = "/data/sls/qcri/mt/work/NeuroX/test_data/inputs/14ktrain.sem"
)

project_2.store = {
	'activations': '/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-ar-1.pt_train.tok.pt',
	'outputs': '/data/sls/qcri/mt/work/NeuroX/test_data/decoded_outputs/en-ar-1.pt_train.tok.out'
}

project_2.save()

project_2_ranking_1.store = {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-ar-1.pt_10ktrain.tok.pt',
						'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-ar-2.pt_10ktrain.tok.pt',
						'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-ar-3.pt_10ktrain.tok.pt'
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroX/test_data/cross_correlations/en-ar-10k-activations.json',
					'ablation_forward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-ar/Model-2-3-Cross-Model-Ranking.txt',
					'ablation_backward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-ar/Model-2-3-Cross-Model-Ranking-Reverse.txt'
				}
project_2_ranking_1.save()

project_2_ranking_2.store = {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-ar-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroX/test_data/linguistic_correlations_POS/en-ar-1.pt_10ktrain.tok/top_neurons.json',
					'ablation_forward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-ar/Part-of-Speech-Ranking.txt',
					'ablation_backward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-ar/Part-of-Speech-Ranking-Reverse.txt'
				}
project_2_ranking_2.save()

project_2_ranking_3.store = {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-ar-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroX/test_data/univariate_POS/en-ar-1.pt_10ktrain.tok.json',
					'ablation_forward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-ar/Part-of-Speech-Univariate-Feature-Selection.txt',
					'ablation_backward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-ar/Part-of-Speech-Univariate-Feature-Selection-Reverse.txt'
				}
project_2_ranking_3.save()

project_2_ranking_4.store =  {
					'activations': [
						'/data/sls/qcri/mt/work/NeuroX/test_data/decoded_activations/en-ar-1.pt_10ktrain.tok.pt',
					],
					'ranking': '/data/sls/qcri/mt/work/NeuroX/test_data/linguistic_correlations_SEM/en-ar-1.pt_14ktrain.tok/top_neurons.json',
					'ablation_forward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-ar/Semantic-Tags-Ranking.txt',
					'ablation_backward': '/data/sls/qcri/mt/work/NeuroX/test_data/ablation_results/en-ar/Semantic-Tags-Ranking-Reverse.txt'
				}
project_2_ranking_4.save()
print("Database:")
print("========")
for project in database.Project.select().order_by(database.Project.creationDate.desc()):
    print(project.id)
    print(project.projectName)
    print(project.store)

    ranking = database.Ranking.select().join(database.Project).where(database.Ranking.project == project.id)
    print("Rankings:")
    for r in ranking:
    	print("\t",r.id)
    	print("\t",r.type)
    	print("\t",r.name)
    	print("\t",r.store)
    print('----------------------')

database.deinit()