import React from 'react';
import {render} from 'react-dom';
import update from 'immutability-helper';

import Typography from '@material-ui/core/Typography';
import "./css/analyze.css";
import "../manipulate/css/vis_elements.css";

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';

import WrapTextIcon from '@material-ui/icons/WrapText';
import Tooltip from '@material-ui/core/Tooltip';

import AddIcon from '@material-ui/icons/Add'

import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';

import Neuron from '../neuron/Neuron'

const theme = createMuiTheme({
	palette: {
		primary: {
			main: '#6200ee'
		},
		secondary: {
			main: '#018786'
		},
	},
});

class Token extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		let style = {}
		if (this.props.activation != undefined) {
			let color  = this.props.activation > 0 ? "rgba(255, 0, 0," : "rgba(0, 0, 255,";
			// square-root gives better color contrasts
			style = {backgroundColor: color + Math.abs(this.props.activation) ** .5 + ")"};
		}
		return (
			<span className={"token"} style={style}>
				{this.props.token}
			</span>
		);
	}
}

class Sentence extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<span style={this.props.style} className={"sentence " + (this.props.wrap?"wrap":"nowrap")}>
					<span className="item-name">{this.props.name}</span>
					{this.props.tokens.map(token => <Token token={token}/>)}
				</span>
			</div>
		);
	}
}

class SentenceMap extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.tokens == undefined) {
			return (
				<div>
					<span className={"sentence-spacer"}></span>
				</div>
			);
		} else {
			return (
				<div>
					<span style={{fontFamily: 'monospace'}} className={"sentence " + (this.props.wrap?"wrap":"nowrap")}>
						<span className="item-name"> {this.props.name} </span>
						{this.props.tokens.map(token => <Token token={token.text} activation={token.activation}/>)}
					</span>
				</div>
			);
		}
	}
}

class NeuronList extends React.Component {
	constructor(props) {
		super(props);
	}

	getAddFunction(pool, neuron, cb) {
		if (pool.indexOf(neuron) >= 0) {
			return undefined
		} else {
			return cb
		}
	}

	getDeleteFunction(pool, neuron, cb) {
		if (pool.indexOf(neuron) >= 0) {
			return cb
		} else {
			return undefined
		}
	}

	render() {
		if (this.props.neurons.length == 0) {
			return (
				<div id="neuron-list" 
					style={{marginLeft: '10px', color: '#555'}}>
					<Typography variant="body1">
						Select a ranking to see the neuron ordering
					</Typography>
				</div>
			);
		} else {
			return (
				<div id="neuron-list">
					{this.props.neurons.map(x => <Neuron position={x} 
						selected={this.props.selected_neuron === x}
						onClick={this.props.onNeuronClick}
						onAdd={this.getAddFunction(this.props.selected_neurons_pool, x, this.props.onNeuronAction)}
						onDelete={this.getDeleteFunction(this.props.selected_neurons_pool, x, this.props.onNeuronAction)}/>)}
				</div>
			);
		}
	}
}

class NeuronPool extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.neurons.length == 0) {
			return (
				<div id="neuron-pool"
					style={{marginLeft: '10px', color: '#555'}}>
					<Typography variant="body1" style={{display: 'flex', alignItems: 'center'}}>
						Select a neuron from an ordering using the
						<span className={"neuron-add-icon"} aria-label="Add neuron to set"> <AddIcon /> </span>
						button
					</Typography>
				</div>
			);
		} else {
			return (
				<div id="neuron-pool">
					{this.props.neurons.map(x => <Neuron position={x}
						selected={this.props.selected_neuron == x}
						onClick={this.props.onNeuronClick}
						onDelete={this.props.onNeuronAction}/>)}
				</div>
			);
		}
	}
}

class NeuronInformation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			neuron_information: undefined
		};

		this.loadNeuronInformation = this.loadNeuronInformation.bind(this);
	}

	loadNeuronInformation(project_id, neuron) {
		let self = this;
		let xhr = new XMLHttpRequest();
		xhr.open("POST", "/getTopWords", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			'project_id': project_id,
			'neuron': neuron
		}))

		xhr.onload = function(e) {
			let response =  JSON.parse(xhr.response);
			self.setState({
				neuron_information: response
			})
		}
	}

	componentDidUpdate(prevProps) {
		if (this.props.neuron !== prevProps.neuron) {
			if (this.props.neuron != undefined) {
				this.loadNeuronInformation(this.props.project_id, this.props.neuron)
			}
		}
	}

	render() {
		let messageClassNames = ""
		let contentClassNames = ""
		if (this.props.neuron == undefined) {
			contentClassNames = "hidden";
		} else {
			messageClassNames = "hidden";
		}

		let information_div = "";
		let neuron_information= this.state.neuron_information;
		if (neuron_information != undefined) {
			information_div = <div id="neuron-specific-info">
				<Typography variant="caption"> Neuron #: </Typography>
				<Typography variant="body1" gutterBottom> {neuron_information.neuron} </Typography>
				<Typography variant="caption"> Mean: </Typography>
				<Typography variant="body1" gutterBottom> {Number.parseFloat(neuron_information.mean).toFixed(3)} </Typography>
				<Typography variant="caption"> Standard Deviation: </Typography>
				<Typography variant="body1" gutterBottom>  {Number.parseFloat(neuron_information.std).toFixed(3)} </Typography>

				<Typography variant="caption"> Top words: </Typography>
				{neuron_information.top_words.map(x => <Token token={x.token} activation={x.activation}/>)}
			</div>
		}

		return (
			<div id="neuron-list">
				<div className={messageClassNames}
					style={{marginLeft: '10px', color: '#555'}}>
					<Typography variant="body1">
						Choose at least one neuron
					</Typography>
				</div>
				<div style={{width: "100%"}} className={contentClassNames}>
					{information_div}
				</div>
			</div>
		);
	}	
}

class ActivationsMap extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			'activations': [],
			'loadingActivations': false
		}

		this.loadActivations = this.loadActivations.bind(this);
	}

	loadActivations(project_id, neurons) {
		let self = this;

		self.setState({loadingActivations: true});
		let xhr = new XMLHttpRequest();
		xhr.open("POST", "/getActivations", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			'project_id': project_id,
			'neurons': neurons
		}))

		xhr.onload = function(e) {
			let response =  JSON.parse(xhr.response);

			self.setState({
				'activations': response['activations'],
				loadingActivations: false
			})
		}
	}

	componentDidMount() {
		this.loadActivations(this.props.project_id, this.props.selected_neurons)
	}

	componentDidUpdate(prevProps) {
		if (this.props.selected_neurons !== prevProps.selected_neurons) {
			this.loadActivations(this.props.project_id, this.props.selected_neurons)
		}
	}

	render() {
		let processed_neurons = this.state.activations.map(x => x.neuron)
		let processed_activations = this.state.activations.map(x => x.activations)
		if (processed_neurons.length == 0) {
			return (
				<div id="neuron-list" 
					className="mdc-typography--body1"
					style={{marginLeft: '10px', color: '#555'}}>
					Select at least one neuron to visualize the activations of those neurons
					{this.state.loadingActivations ? (
							<div style={{height: '80%', display:'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
								<div id="progressbar" role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate">
									<div class="mdc-linear-progress__buffering-dots"></div><div class="mdc-linear-progress__buffer"></div><div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"><span class="mdc-linear-progress__bar-inner"></span></div><div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar"><span class="mdc-linear-progress__bar-inner"></span></div>
								</div>
							</div>):""
					}
				</div>
			);
		} else {
			let sentences = []
			for (var i = 0; i < this.props.sentences.length; i++) {
				for (var n = 0; n < processed_neurons.length; n++) {
					let curr_tokens = []
					for (var j = 0; j < this.props.sentences[i].source.length; j++) {
						curr_tokens.push({
							'text': this.props.sentences[i].source[j],
							'activation': processed_activations[n][i][j]
						})
					}
					sentences.push({
						'name': 'neuron ' + processed_neurons[n],
						'tokens': curr_tokens
					})
				}
				sentences.push({
					'name': 'spacer',
					'tokens': undefined
				})
			}
			return (
				<div id="neuron-list">
					{this.state.loadingActivations ? (
							<div style={{height: '80%', display:'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
								<div id="progressbar" role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate">
									<div class="mdc-linear-progress__buffering-dots"></div><div class="mdc-linear-progress__buffer"></div><div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"><span class="mdc-linear-progress__bar-inner"></span></div><div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar"><span class="mdc-linear-progress__bar-inner"></span></div>
								</div>
							</div>):""
					}
					{sentences.map(t => <SentenceMap name={t.name} tokens={t.tokens} wrap={this.props.wrap}/>)}
				</div>
			);
		}
	}
}

class Analysis extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			'sentence_wrap': true,
			'results_wrap': true,
			'sentences': [],
			'rankings': [],
			'selected_ranking': -1,
			'current_selected_neuron': undefined,
			'selected_neurons_pool': [],
			'loadingSentences': true,
			'loadingRankings': true
		}

		this.handleRankingSelect = this.handleRankingSelect.bind(this);
		this.handleNeuronClick = this.handleNeuronClick.bind(this);
		this.handleNeuronAction = this.handleNeuronAction.bind(this);
	}

	componentDidMount() {
		let self = this;
		let xhr = new XMLHttpRequest();
		xhr.open("POST", "/getText", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			'project_id': this.props.project_id
		}))

		xhr.onload = function(e) {
			let response =  JSON.parse(xhr.response);
			let source = response['source'];
			let pred = response['pred'];

			let sentences = []
			for (var i = 0; i < source.length; i++) {
				sentences.push({
					'source': source[i],
					'pred': pred[i]
				})
			}

			self.setState({
				'sentences': sentences,
				'loadingSentences': false
			})
		}

		let xhr_rankings = new XMLHttpRequest();
		xhr_rankings.open("POST", "/getRankings", true);
		xhr_rankings.setRequestHeader('Content-Type', 'application/json');
		xhr_rankings.send(JSON.stringify({
			'project_id': this.props.project_id
		}))

		xhr_rankings.onload = function(e) {
			let response =  JSON.parse(xhr_rankings.response);
			let flat_rankings = []
			for (var i = 0; i < response['rankings'].length; i++) {
				response['rankings'][i].level = 1;
				flat_rankings.push(response['rankings'][i])
				if (response['rankings'][i].sub_rankings != undefined) {
					for (var j = 0; j < response['rankings'][i].sub_rankings.length; j++) {
						response['rankings'][i].sub_rankings[j].level = 2;
						flat_rankings.push(response['rankings'][i].sub_rankings[j])
					}
				}
			}

			self.setState({
				'rankings': flat_rankings,
				'loadingRankings': false
			})
		}
	}

	handleRankingSelect(index) {
		this.setState({'selected_ranking': index});
	}

	handleNeuronClick(neuron) {
		if (neuron === this.state.current_selected_neuron) {
			this.setState({'current_selected_neuron': undefined});
		}
		else {
			this.setState({'current_selected_neuron': neuron});
		}
	}

	handleNeuronAction(neuron) {
		let selected_neurons = this.state.selected_neurons_pool;
		const index = selected_neurons.indexOf(neuron);
		let new_selected_neurons = null
		if (index >= 0) {
			new_selected_neurons = update(selected_neurons, {$splice: [[index, 1]]});
		} else {
			new_selected_neurons = update(selected_neurons, {$push: [neuron]});
		}
		
		this.setState({'selected_neurons_pool': new_selected_neurons});
	}

	render() {
		let sentences = [];

		for (var i = 0; i < this.state.sentences.length; i++) {
			sentences.push(
				<div style={{margin: '7px', borderBottom: '1px dashed #ccc'}}>
					<Sentence name="source" tokens={this.state.sentences[i].source} style={{direction: 'ltr', fontFamily: 'monospace'}} wrap={this.state.sentence_wrap}/>
					<Sentence name="translation" tokens={this.state.sentences[i].pred} style={this.props.outputStyler}  wrap={this.state.sentence_wrap}/>
				</div>
			)
		}

		let rankings = []
		for (let i = 0; i < this.state.rankings.length; i++) {
			let ranking = this.state.rankings[i];
			let ranking_classes = ""

			if (ranking.level == 1) {
				ranking_classes += "ranking-item ";
			} else {
				ranking_classes += "sub-ranking-item ";
			}

			if (i == this.state.selected_ranking) {
				ranking_classes += "ranking-selected";
			}

			rankings.push(
				<div className={ranking_classes} onClick={() => this.handleRankingSelect(i)}>
					{ranking.name}
				</div>
			)
		}

		let neurons = []
		if (this.state.selected_ranking > -1) {
			neurons = this.state.rankings[this.state.selected_ranking].ranking;
		}
		return (
			<div id="page-content">
				<div id="sentences-container">
					<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
						<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem', flexGrow: '2'}}>
							<Typography variant="button"> Translations </Typography>
						</h1>
						<Tooltip title="Wrap Sentences">
							<IconButton color={this.state.sentence_wrap?"primary":""} onClick={() => this.setState({sentence_wrap: !this.state.sentence_wrap})}>
								<WrapTextIcon/>
							</IconButton>
						</Tooltip>
					</div>
					<div style={{overflow: 'scroll', height: 'calc(100% - 50px)'}}>
						{	this.state.loadingSentences ? (
							<div style={{height: '80%', display:'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
								<div style={{marginLeft: '15%', width: '70%'}}>
									<LinearProgress/>
								</div>
							</div>):""
						}
						{sentences}
					</div>
				</div>
				<div id="results-container">
					<div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
						<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem', flexGrow: '2'}}>
							<Typography variant="button"> Activations Map </Typography>
						</h1>
						<Tooltip title="Wrap Sentences">
							<IconButton color={this.state.results_wrap?"primary":""} onClick={() => this.setState({results_wrap: !this.state.results_wrap})}>
								<WrapTextIcon/>
							</IconButton>
						</Tooltip>
					</div>
					<ActivationsMap project_id={this.props.project_id} sentences={this.state.sentences} selected_neurons={this.state.selected_neurons_pool} wrap={this.state.results_wrap}/>
				</div>
				<div id="rankings-container">
					<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem'}}>
						<Typography variant="button">
							Rankings
						</Typography>
					</h1>
					{	this.state.loadingRankings ? (
						<div style={{height: '80%', display:'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
							<div style={{marginLeft: '15%', width: '70%'}}>
								<LinearProgress/>
							</div>
						</div>):""
					}
					{rankings}
				</div>
				<div id="neurons-container">
					<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem'}}>
						<Typography variant="button">
							Neuron Ordering
						</Typography>
					</h1>
					<NeuronList
						neurons={neurons}
						selected_neuron={this.state.current_selected_neuron}
						selected_neurons_pool={this.state.selected_neurons_pool}
						onNeuronClick={this.handleNeuronClick}
						onNeuronAction={this.handleNeuronAction}/>
				</div>
				<div id="neuron-info-container">
					<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem'}}>
						<Typography variant="button">
							Neuron Information
						</Typography>
					</h1>
					<NeuronInformation project_id={this.props.project_id} neuron={this.state.current_selected_neuron}/>
				</div>
				<div id="selected-neurons-pool">
					<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem'}}>
						<Typography variant="button">
							Selected Neurons
						</Typography>
					</h1>
					<NeuronPool
						neurons={this.state.selected_neurons_pool}
						selected_neuron={this.state.current_selected_neuron}
						onNeuronClick={this.handleNeuronClick}
						onNeuronAction={this.handleNeuronAction}/>
				</div>
			</div>
		)
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			project_info: project_info,
			ready: false
		};
	}

	componentDidMount() {
		let self = this;

		let xhr = new XMLHttpRequest();
		xhr.open("POST", "/initializeProject", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			'project_id': self.state.project_info.id
		}))

		xhr.onload = function(e) {
			let response =  JSON.parse(xhr.response);
			self.setState({
				ready: true
			})
		}
	}

	render () {
		if (this.state.ready) {
			return (
				<MuiThemeProvider theme={theme}>
					<div id="container">
						<div id="page-header">
							<div>
								<Typography component="h2" variant="h3">
									{this.state.project_info.projectName}
								</Typography>
							</div>
							<Button href="#"
								variant="raised"
								color="primary"
								style={{marginLeft: '10px'}}>
								Neuron Analysis
							</Button>
							<Button href={'/ablate?project=' + this.state.project_info.id}
								variant="outlined"
								color="primary"
								style={{marginLeft: '10px'}}>
								Model Ablation
							</Button>
							<Button href={'/manipulate?project=' + this.state.project_info.id}
								variant="outlined"
								color="primary"
								style={{marginLeft: '10px'}}>
								Neuron Manipulation
							</Button>
						</div>
						<Analysis
							project_id={this.state.project_info.id}
							outputStyler={JSON.parse(this.state.project_info.outputStyler)} />
					</div>
				</MuiThemeProvider>
			);
		} else {
			return (
				<MuiThemeProvider theme={theme}>
					<div id="cloak">
						<h1 className="page-title"> <span style={{color: "#bb4848"}}>Neuro</span><span>Dissection</span> </h1>
						<div style={{marginBottom: "30px"}}>
							<Typography variant="h6">
								Hang on while we crunch the numbers for you...
							</Typography>
						</div>
						<div style={{width: '70%'}}>
							<LinearProgress/>
						</div>
					</div>
				</MuiThemeProvider>
			);
		}
	}
}

render(<App/>, document.getElementById('app'));