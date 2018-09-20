import React from 'react';
import {render} from 'react-dom';
import update from 'immutability-helper';

import "@material/typography/mdc-typography";
import "./css/analyze.css";
import "./css/vis_elements.css";

import '@material/react-button/index.scss';
import Button from '@material/react-button';

import "@material/select/mdc-select";
import {MDCSelect} from '@material/select';

import "@material/linear-progress/mdc-linear-progress";
import {MDCLinearProgress} from '@material/linear-progress';

import "@material/form-field/mdc-form-field";
import {MDCFormField} from '@material/form-field';
import "@material/checkbox/mdc-checkbox";
import {MDCCheckbox} from '@material/checkbox';

import {Line} from "react-chartjs";

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
				<span className={"sentence"}>
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
					<span className={"sentence"}>
						<span className="item-name"> {this.props.name} </span>
						{this.props.tokens.map(token => <Token token={token.text} activation={token.activation}/>)}
					</span>
				</div>
			);
		}
	}
}

class Neuron extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<span className={"neuron" + (this.props.selected?" neuron-selected":"")} onClick={() => this.props.onClick(this.props.position)}>
				<span> neuron </span>
				{this.props.position}
			</span>
		);
	}
}

class NeuronList extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.neurons.length == 0) {
			return (
				<div id="neuron-list" 
					className="mdc-typography--body1"
					style={{marginLeft: '10px', color: '#555'}}>
					Select a ranking to see the neuron ordering
				</div>
			);
		} else {
			return (
				<div id="neuron-list">
					{this.props.neurons.map(x => <Neuron position={x} 
						selected={this.props.selected_neurons.indexOf(x) >= 0}
						onClick={this.props.onNeuronClick}/>)}
				</div>
			);
		}
	}
}

class NeuronInformation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedIdx: 0,
			neuron_information: undefined
		};

		this.select = undefined;

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

	componentDidMount() {
		let self = this;
		this.select = new MDCSelect(document.querySelector('.mdc-select'));
		this.select.listen('change', () => this.loadNeuronInformation(this.props.project_id, self.props.neurons[self.select.value]));
	}

	componentDidUpdate(prevProps) {
		if (this.props.neurons !== prevProps.neurons) {
			let neuron = this.props.neurons[this.select.value];
			if (neuron != undefined) {
				if (this.state.neuron_information != undefined &&
					neuron != this.state.neuron_information.neuron) {
					this.loadNeuronInformation(this.props.project_id, neuron)
				}
			}
		}
	}

	render() {
		let messageClassNames = "mdc-typography--body1"
		let contentClassNames = ""
		if (this.props.neurons.length == 0) {
			contentClassNames = "hidden";
		} else {
			messageClassNames = "hidden";
		}

		let information_div = "";
		let neuron_information= this.state.neuron_information;
		if (neuron_information != undefined) {
			information_div = <div id="neuron-specific-info">
				<span className="mdc-typography--caption"> Mean: </span>
				<span className="mdc-typography--body1">{Number.parseFloat(neuron_information.mean).toFixed(3)} </span>
				<span className="mdc-typography--caption"> Standard Deviation: </span>
				<span className="mdc-typography--body1"> {Number.parseFloat(neuron_information.std).toFixed(3)} </span>

				<span className="mdc-typography--caption"> Top words: </span>
				{neuron_information.top_words.map(x => <Token token={x.token} activation={x.activation}/>)}
			</div>
		}

		return (
			<div id="neuron-list">
				<div className={messageClassNames}
					style={{marginLeft: '10px', color: '#555'}}>
					Select at least one neuron
				</div>
				<div style={{width: "100%"}} className={contentClassNames}>
					<div style={{width: "100%"}} class="mdc-select mdc-select--outlined">
						<select class="mdc-select__native-control">
							<option value="" disabled selected></option>
							{this.props.neurons.map((x,idx) => <option value={idx}>Neuron {x}</option>)}
						</select>
						<label class="mdc-floating-label">Choose a Neuron</label>
						<div class="mdc-notched-outline">
							<svg> <path class="mdc-notched-outline__path"></path> </svg>
						</div>
						<div class="mdc-notched-outline__idle"></div>
					</div>
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
			'activations': []
		}

		this.loadActivations = this.loadActivations.bind(this);
	}

	loadActivations(project_id, neurons) {
		let self = this;

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
				'activations': response['activations']
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
					{sentences.map(t => <SentenceMap name={t.name} tokens={t.tokens}/>)}
				</div>
			);
		}
	}
}

class Analysis extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			'sentences': [],
			'rankings': [],
			'selected_ranking': -1,
			'selected_neurons': []
		}

		this.handleRankingSelect = this.handleRankingSelect.bind(this);
		this.handleNeuronClick = this.handleNeuronClick.bind(this);
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
				'sentences': sentences
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
				'rankings': flat_rankings
			})
		}
	}

	handleRankingSelect(index) {
		this.setState({'selected_ranking': index});
	}

	handleNeuronClick(neuron) {
		let selected_neurons = this.state.selected_neurons;
		const index = selected_neurons.indexOf(neuron);
		let new_selected_neurons = null
		if (index >= 0) {
			new_selected_neurons = update(selected_neurons, {$splice: [[index, 1]]});
		} else {
			new_selected_neurons = update(selected_neurons, {$push: [neuron]});
		}
		
		this.setState({'selected_neurons': new_selected_neurons});
	}

	render() {
		let sentences = [];

		for (var i = 0; i < this.state.sentences.length; i++) {
			sentences.push(
				<div style={{margin: '7px', borderBottom: '1px dashed #ccc'}}>
					<Sentence name="source" tokens={this.state.sentences[i].source} />
					<Sentence name="translation" tokens={this.state.sentences[i].pred} />
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
				<div id="top-row">
					<div id="sentences-container">
						<h1 style={{marginLeft: '10px', padding: '0px', lineHeight: '1rem'}}
							className="mdc-typography--button">
							Translations
						</h1>
						{sentences}
					</div>
					<div id="rankings-container">
						<h1 style={{marginLeft: '10px', padding: '0px', lineHeight: '1rem'}}
							className="mdc-typography--button">
							Rankings
						</h1>
						{rankings}
					</div>
				</div>
				<div id="bottom-row">
					<div id="results-container">
						<h1 style={{marginLeft: '10px', padding: '0px', lineHeight: '1rem'}}
							className="mdc-typography--button">
							Activations Map
						</h1>
						<ActivationsMap project_id={this.props.project_id} sentences={this.state.sentences} selected_neurons={this.state.selected_neurons} />
					</div>
					<div id="neurons-container">
						<h1 style={{marginLeft: '10px', padding: '0px', lineHeight: '1rem'}}
							className="mdc-typography--button">
							Neuron Ordering
						</h1>
						<NeuronList neurons={neurons} selected_neurons={this.state.selected_neurons} onNeuronClick={this.handleNeuronClick}/>
					</div>
					<div id="neuron-info-container">
						<h1 style={{marginLeft: '10px', padding: '0px', lineHeight: '1rem'}}
							className="mdc-typography--button">
							Neuron Information
						</h1>
						<NeuronInformation project_id={this.props.project_id} neurons={this.state.selected_neurons}/>
					</div>
				</div>
			</div>
			)
	}
}


class AblationResults extends React.Component {
	constructor(props) {
		super(props)
		this.mockdata = [
				{
					label: "Cross-Model Correlation Top",
					fillColor: "rgba(151,187,205,0.2)",
					strokeColor: "rgba(151,187,205,1)",
					pointColor: "rgba(151,187,205,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(151,187,205,1)",
					data: [34.75,19.82,16.48,14.21,11.46,10.57,9.33,8.38,7.62,6.13,5.22,4.72,4,3.6,3.55,2.9,2.52,1.98,1.93,1.6,1.36,0.69,0.47,0.49,0.14,0.09,0.06,0.04,0,0,0,0,0,0,0,0,0,0,0,0,0],
				},
				{
					label: "Cross-Model Correlation Bottom",
					fillColor: "rgba(255,255,255,0.0)",
					strokeColor: "rgba(220,220,220,1)",
					pointColor: "rgba(220,220,220,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(220,220,220,1)",
					data: [34.75,34.43,33.43,32.32,30.79,28.8,26.4,23.61,20.57,17.16,14.08,11.27,9.28,7.53,6.15,5.03,4.15,3.42,3.1,2.76,2.43,2.14,2.01,1.9,1.74,1.5,1.23,1.04,0.96,0.81,0.8,0.45,0.14,0.01,0,0,0,0,0,0,0]
				},
				{
					label: "Task-Specific (POS) Ranking Top",
					fillColor: "rgba(151,187,205,0.0)",
					strokeColor: "rgba(255,137,79,1)",
					pointColor: "rgba(255, 102, 25,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(255, 102, 25	,1)",
					data: [34.75,33.69,31.69,30.1,27.74,24.05,19.77,16.3,13.53,11.08,8.65,6.66,5.52,4.43,3.39,2.47,2.12,2.22,1.52,1.36,1.16,1.1,0.65,0.48,0.33,0.05,0.01,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
				},
				{
					label: "Task-Specific (SEM) Ranking Top",
					fillColor: "rgba(151,187,205,0.0)",
					strokeColor: "rgba(116, 200, 103,1)",
					pointColor: "rgba(40, 201, 14,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(151,187,205,1)",
					data: [34.75,33.3,31.01,27.7,24.36,20.3,15.83,12.08,9.56,7.54,5.75,4.73,4,3.32,2.88,2.64,2.45,2.33,2.14,1.9,1.64,1.44,1.34,1.34,1.17,0.95,0.91,1.09,0.93,0.62,0.64,0.06,0.09,0.01,0,0,0,0,0,0,0]
				},
			]
		this.chartOptions = {
			responsive: true,
			scales: {
				xAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'Number of Ablated Neurons'
					}
				}],
				yAxes: [{
					scaleLabel: {
						display: true,
						labelString: 'BLEU (Translation Performance)'
					}
				}]
			}
		}
	}

	render() {
		if (this.props.selected_rankings.length == 0) {
			return (
				<div
						className="mdc-typography--body1"
						style={{marginLeft: '10px', color: '#555'}}>
						Select at least one ranking to visualize the ablation results
				</div>
			);
		} else {
			let datasets = []
			for (var i = 0; i < this.props.selected_rankings.length; i++) {
				datasets.push(this.mockdata[i])
			}
			var data = {
				labels : [0,50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400,1450,1500,1550,1600,1650,1700,1750,1800,1850,1900,1950,2000],
				datasets: datasets
			};
			return (
				<div class="chart-container" style={{position: 'relative', height:'50%', width:'80%'}}>
					<Line data={data} options={this.chartOptions} redraw/>
				</div>
			);
		}
	}
}

class Checkbox extends React.Component {
	constructor(props) {
		super(props)

		this.checkbox = undefined;
	}

	componentDidMount() {
		this.checkbox = new MDCCheckbox(document.querySelector("#checkbox-" + this.props.id));
		const formField = new MDCFormField(document.querySelector("#formfield-" + this.props.id));
		formField.input = this.checkbox;
	}

	render() {
		return (
			<div id={"formfield-" + this.props.id} class="mdc-form-field">
				<div id={"checkbox-" + this.props.id} class="mdc-checkbox">
				    <input type="checkbox"
				           class="mdc-checkbox__native-control"
				           id={"checkbox-input-"+ this.props.id}
				           onClick={() => this.props.onClick(this.props.id, this.checkbox.checked)}/>
				    <div class="mdc-checkbox__background">
				      <svg class="mdc-checkbox__checkmark"
				           viewBox="0 0 24 24">
				        <path class="mdc-checkbox__checkmark-path"
				              fill="none"
				              d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
				      </svg>
				      <div class="mdc-checkbox__mixedmark"></div>
				    </div>
				  </div>
				  <label for={"checkbox-input-"+ this.props.id}>{this.props.label}</label>
			</div>
		)
	}
}


class Ablation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			'sentences': [],
			'rankings': [],
			'selected_rankings': []
		}

		this.handleRankingSelect = this.handleRankingSelect.bind(this);
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
				'sentences': sentences
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
				'rankings': flat_rankings
			})
		}
	}

	handleRankingSelect(checkboxID, selected) {
		let index = checkboxID.split('-')[0];
		let direction = checkboxID.split('-')[1];
		let selected_rankings = this.state.selected_rankings;
		if (selected) {
			selected_rankings = update(selected_rankings, {$push: [checkboxID]})
		} else {
			selected_rankings = update(selected_rankings, {$splice: [[selected_rankings.indexOf(checkboxID), 1]]});
		}
		this.setState({'selected_rankings': selected_rankings});
	}

	render() {
		let sentences = [];

		for (var i = 0; i < this.state.sentences.length; i++) {
			sentences.push(
				<div style={{margin: '7px', borderBottom: '1px dashed #ccc'}}>
					<Sentence name="source" tokens={this.state.sentences[i].source} />
					<Sentence name="translation" tokens={this.state.sentences[i].pred} />
				</div>
			)
		}

		let rankings = []
		for (let i = 0; i < this.state.rankings.length; i++) {
			let ranking = this.state.rankings[i];
			let ranking_classes = ""

			if (ranking.level == 1) {
				ranking_classes += "ranking-item ";
				if (i == this.state.selected_ranking) {
					ranking_classes += "ranking-selected";
				}

				rankings.push(
					<div className={ranking_classes} style={{display: 'flex', flexDirection: 'column'}}>
						{ranking.name}
						<span>
							<Checkbox id={i + "-top"} label="Top" onClick={this.handleRankingSelect}/>
							<Checkbox id={i + "-bottom"} label="Bottom" onClick={this.handleRankingSelect}/>
						</span>
					</div>
				)
			} else {
				// Ignore subrankings for ablation
			}
		}

		let neurons = []
		if (this.state.selected_ranking > -1) {
			neurons = this.state.rankings[this.state.selected_ranking].ranking;
		}
		return (
			<div id="page-content">
				<div id="top-row">
					<div id="sentences-container" style={{width: '100%'}}>
						<h1 style={{marginLeft: '10px', padding: '0px', lineHeight: '1rem'}}
							className="mdc-typography--button">
							Translations
						</h1>
						{sentences}
					</div>
				</div>
				<div id="bottom-row">
					<div id="results-container">
						<h1 style={{marginLeft: '10px', padding: '0px', lineHeight: '1rem'}}
							className="mdc-typography--button">
							Ablation Results
						</h1>
						<div style={{display: 'flex', justifyContent: 'center', marginTop: '20px'}}>
						<AblationResults rankings={this.state.rankings} selected_rankings={this.state.selected_rankings}/>
						</div>
					</div>
					<div id="rankings-container">
						<h1 style={{marginLeft: '10px', padding: '0px', lineHeight: '1rem'}}
							className="mdc-typography--button">
							Rankings
						</h1>
						{rankings}
					</div>
				</div>
			</div>
			)
	}
}


class Manipulation extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
			Manipulation
			</div>
			)
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			project_info: project_info,
			active_mode: 'analysis',
			ready: false
		};

		this.handleChangeMode = this.handleChangeMode.bind(this);
	}

	componentDidMount() {
		let self = this;

		const progressbar = new MDCLinearProgress(document.querySelector("#progressbar"))
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

	handleChangeMode(mode) {
		this.setState({'active_mode': mode});
	}

	render () {
		if (this.state.ready) {
			let main_content = <Analysis project_id={this.state.project_info.id}/>

			if (this.state.active_mode == 'ablation')
				main_content = <Ablation project_id={this.state.project_info.id}/>;
			if (this.state.active_mode == 'manipulation')
				main_content = <Manipulation project_id={this.state.project_info.id}/>;

			return (
				<div id="container">
					<div id="page-header">
						<h1 className="mdc-typography--headline5">
							{this.state.project_info.name}
						</h1>
						<Button outlined={this.state.active_mode != 'analysis'} 
								raised={this.state.active_mode == 'analysis'}
								onClick={() => this.handleChangeMode('analysis')}>
								Neuron Analysis
						</Button>
						<Button outlined={this.state.active_mode != 'ablation'} 
								raised={this.state.active_mode == 'ablation'}
								onClick={() => this.handleChangeMode('ablation')}>
								Model Ablation
						</Button>
						<Button outlined={this.state.active_mode != 'manipulation'} 
								raised={this.state.active_mode == 'manipulation'}
								onClick={() => this.handleChangeMode('manipulation')}>
								Neuron Manipulation
						</Button>
					</div>
					{main_content}
				</div>
			);
		} else {
			return (
				<div id="cloak">
					<h1 className="page-title"> <span style={{color: "#bb4848"}}>Neuro</span><span>Dissection</span> </h1>
					<div className="mdc-typography--headline6" style={{marginBottom: "30px"}}>
						Hang on while we crunch the numbers for you...
					</div>
					<div id="progressbar" role="progressbar" class="mdc-linear-progress mdc-linear-progress--indeterminate">
					<div class="mdc-linear-progress__buffering-dots"></div><div class="mdc-linear-progress__buffer"></div><div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar"><span class="mdc-linear-progress__bar-inner"></span></div><div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar"><span class="mdc-linear-progress__bar-inner"></span></div>
					</div>
				</div>
			);
		}
	}
}

render(<App/>, document.getElementById('app'));