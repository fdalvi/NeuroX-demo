import React from 'react';
import {render} from 'react-dom';
import update from 'immutability-helper';

import "@material/typography/mdc-typography";
import "./css/analyze.css";
import "./css/vis_elements.css";

import '@material/react-button/index.scss';
import Button from '@material/react-button';

import '@material/react-select/index.scss';
import Select from '@material/react-select';

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

		this.state = {selectedIdx: 0};
	}

	render() {
		if (this.props.neurons.length == 0) {
			return (
				<div id="neuron-list" 
					className="mdc-typography--body1"
					style={{marginLeft: '10px', color: '#555'}}>
					Select at least one neuron
				</div>
			);
		} else {
			return (
				<div id="neuron-list">
					<Select label='Choose Neuron' value={this.state.selectedIdx} outlined={true} onChange={(evt) => this.setState({selectedIdx: evt.target.value})}>
						<option value='' disabled>Choose Neuron</option>

						{this.props.neurons.map((x,idx) => <option value={idx}>Neuron {x}</option>)}
					</Select>
				</div>
			);
		}
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

		console.log(new_selected_neurons)
		
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
						<NeuronInformation neurons={this.state.selected_neurons}/>
					</div>
				</div>
			</div>
			)
	}
}


class Ablation extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
			Ablation
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
			active_mode: 'analysis'
		};

		this.handleChangeMode = this.handleChangeMode.bind(this);
	}

	handleChangeMode(mode) {
		this.setState({'active_mode': mode});
	}

	render () {
		let main_content = <Analysis project_id={this.state.project_info.id}/>

		if (this.state.active_mode == 'ablation')
			main_content = <Ablation/>;
		if (this.state.active_mode == 'manipulation')
			main_content = <Manipulation/>;

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
	}
}

render(<App/>, document.getElementById('app'));