import React from 'react';
import {render} from 'react-dom';
import update from 'immutability-helper';

import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import Typography from '@material-ui/core/Typography';
import "./css/manipulate.css";
import "./css/vis_elements.css";

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import LinearProgress from '@material-ui/core/LinearProgress';

import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import DeleteForeverRoundedIcon from '@material-ui/icons/DeleteForeverRounded';

import WrapTextIcon from '@material-ui/icons/WrapText';
import Tooltip from '@material-ui/core/Tooltip';

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
			let color  = this.props.activation > 0 ? "rgba(0, 0, 255," : "rgba(255, 0, 0,";
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

class DiffSentence extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
				<span style={this.props.style} className={"sentence " + (this.props.wrap?"wrap":"nowrap")}>
					<span className="item-name">{this.props.name}</span>
					{this.props.tokens.map(token_info => <Token token={token_info[0]} activation={token_info[1]}/>)}
				</span>
			</div>
		);
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
						Select at least one neuron
					</Typography>
				</div>
				<div style={{width: "100%"}} className={contentClassNames}>
					{information_div}
				</div>
			</div>
		);
	}	
}

class NeuronController extends React.Component {
	constructor(props) {
		super(props);

  		this.handleChange = this.handleChange.bind(this);
	}

	handleChange(value) {
		this.props.onActivationChange(this.props.neuron['neuron'], value)
	}

	render() {
		return (
			<div className="neuron-controller">
				<Neuron position={this.props.neuron['neuron']} 
						onClick={(e) => {}}/>
				<div className="slider-controller">
					<Slider
	          			value={this.props.neuron['activation']}
	          			onChange={this.handleChange}
	          			min={-1}
	          			max={1}
	          			step={0.1}
	          			labels={{
	          				[this.props.neuron['mean']]: 'mean',
	          				[this.props.neuron['min']]: 'min',
	          				[this.props.neuron['max']]: 'max'
	          			}}
	          			tooltip={false}
	        		/>
        		</div>
        		<span className="activation-value">
        			{this.props.neuron['activation'].toFixed(1)}
        		</span>
				<DeleteForeverRoundedIcon
					className="neuron-controller-delete"
					onClick={() => this.props.onDelete(this.props.neuron['neuron'])}/>
			</div>
		);
	}
}

class NeuronAdder extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className="neuron-controller pulse"
				style={{borderStyle: 'dashed', cursor: 'pointer'}}
				onClick={() => this.props.onNeuronSetAdd(this.props.neuron)}>
				<Neuron position={this.props.neuron} 
						onClick={(e) => {}}/>
				<div style={{fontFamily: 'Roboto', fontSize: '0.8rem', textAlign: 'center', alignSelf: 'center'}}>
					Click to add neuron to set
        		</div>
			</div>
		);
	}
}

class ManipulationControls extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selectedIdx: 0,
			sets: [[]],
			manipulationInProgess: false
		};

		this.handleSetAdd = this.handleSetAdd.bind(this);
		this.handleSetSelect = this.handleSetSelect.bind(this);
		this.handleSetDelete = this.handleSetDelete.bind(this);
		this.handleNeuronAdd = this.handleNeuronAdd.bind(this);
		this.handleNeuronDelete = this.handleNeuronDelete.bind(this);
		this.handleNeuronActivationChange = this.handleNeuronActivationChange.bind(this);
		this.handleManipulate = this.handleManipulate.bind(this);
	}

	handleSetAdd() {
		let current_sets = this.state.sets;
		current_sets = update(current_sets, {$push: [[]]});
		this.setState({sets: current_sets});
	}

	handleSetSelect(index) {
		if (this.state.manipulationInProgess) {
			return;
		}
		this.setState({selectedIdx: index})
	}

	handleSetDelete() {
		let current_sets = this.state.sets;
		let selectedIdx = this.state.selectedIdx;
		current_sets = update(current_sets, {$splice: [[selectedIdx, 1]]})

		// Handle deletion of last set
		if (selectedIdx == current_sets.length) {
			selectedIdx -= 1;
		}

		// Also delete modification outputs
		this.props.onSetDelete(this.state.selectedIdx);

		// Update state
		this.setState({sets: current_sets, selectedIdx: selectedIdx});
	}

	handleNeuronAdd(neuron) {
		let self = this;
		let xhr = new XMLHttpRequest();
		xhr.open("POST", "/getNeuronStats", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
			'project_id': project_info['id'],
			'neuron': neuron
		}))

		xhr.onload = function(e) {
			let response =  JSON.parse(xhr.response);
			response['activation'] = 0;
			let current_sets = self.state.sets
			current_sets = update(current_sets, {[self.state.selectedIdx]: {$push: [response]}});
			self.setState({sets: current_sets});	
		}
	}

	handleNeuronDelete(neuron) {
		let current_sets = this.state.sets
		let current_set = current_sets[this.state.selectedIdx]

		let idxToDelete = -1;
		for (var i = current_set.length - 1; i >= 0; i--) {
			if (current_set[i]['neuron'] == neuron) {
				idxToDelete = i;
				break;
			}
		}

		current_sets = update(current_sets, {[this.state.selectedIdx]: {$splice: [[idxToDelete, 1]]}});
		this.setState({sets: current_sets});
	}

	handleNeuronActivationChange(neuron, activation_value) {
		let current_sets = this.state.sets
		let current_set = current_sets[this.state.selectedIdx]
		let idx = -1;
		for (var i = current_set.length - 1; i >= 0; i--) {
			if (current_set[i]['neuron'] == neuron) {
				idx = i;
				break;
			}
		}

		current_sets = update(current_sets, {[this.state.selectedIdx]: {[idx]: {activation: {$set: activation_value}}}});
		this.setState({sets: current_sets});	
	}

	handleManipulate() {
		let self = this;

		self.setState({manipulationInProgess: true});

		// Collect neurons
		let current_set = self.state.sets[self.state.selectedIdx];
		let neurons_to_modify = current_set.map((e) => [e['neuron'], e['activation']])

		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/getModifiedTranslation", true);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify({
		  	'project_id': project_info['id'],
		  	'neurons': neurons_to_modify
		}))
		xhr.onload = function(e) {
			self.setState({manipulationInProgess: false});
			let response = JSON.parse(xhr.response);
			// TODO: Robustness

			self.props.onManipulation(self.state.selectedIdx, response['message']);
		}
		
	}

	render() {
		let list_elements = this.state.sets.map((s, i) => (
				<ListItem key={i} button
					selected={this.state.selectedIdx === i}
					onClick={() => this.handleSetSelect(i)}>
					<ListItemText
						primary={`Manipulation Set ${i + 1}`}
						primaryTypographyProps={{style: {fontSize: '0.9rem'}}}/>
				</ListItem>
			)
		)

		let neuron_set_elements = (
			<div style={{marginLeft: '10px', color: '#555'}}>
				<Typography variant="body1">
					Select at least one neuron to manipulate the model
				</Typography>
			</div>
		)

		if (this.state.sets[this.state.selectedIdx].length > 0 || this.props.selected_neuron != undefined) {
			neuron_set_elements = this.state.sets[this.state.selectedIdx].map(v => <NeuronController 
						neuron={v} 
						onActivationChange={this.handleNeuronActivationChange}
						onDelete={this.handleNeuronDelete}/>)
		}

		let neuron_add_element = ""
		if (this.props.selected_neuron != undefined) {
			let already_added = false;
			for (var i = this.state.sets[this.state.selectedIdx].length - 1; i >= 0; i--) {
				if (this.state.sets[this.state.selectedIdx][i]['neuron'] == this.props.selected_neuron)
				{
					already_added = true;
					break;
				}
			}
			if (!already_added) {
				neuron_add_element = <NeuronAdder
								neuron={this.props.selected_neuron}
								onNeuronSetAdd={this.handleNeuronAdd} />
			}
		}

		return (
			<div id="manipulation-controls">
				<List component="nav" style={{flexGrow: '0', flexShrink: '0', overflow: 'scroll'}}>
					<ListItem button onClick={this.handleSetAdd}>
						<ListItemIcon>
							<AddIcon />
						</ListItemIcon>
						<ListItemText primary="New Set" primaryTypographyProps={{style: {fontSize: '0.9rem'}}}/>
					</ListItem>
					<Divider />
					{list_elements}
				</List>
				<div className="neuron-set">
					{neuron_set_elements}
					{neuron_add_element}
				</div>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '10px'}}>
					<div style={{color: '#555'}}>
						<Typography variant="button" gutterBottom>
							Legend
						</Typography>
					</div>
					<div className="legend">
						<div className="legend-entry"> <Typography variant="body1"> Minimum </Typography> </div>
						<div className="legend-entry"> <Typography variant="body1"> Mean </Typography> </div>
						<div className="legend-entry"> <Typography variant="body1"> Maximum </Typography> </div>
					</div>
					<Button onClick={this.handleManipulate}
						variant={"raised"}
						color="primary"
						disabled={this.state.manipulationInProgess || this.state.sets[this.state.selectedIdx].length == 0}
						style={{margin: "5px", width: "150px", height: "40px"}}>
						Manipulate
					</Button>
					<Button onClick={this.handleSetDelete}
						variant={"raised"}
						color="outline"
						disabled={this.state.manipulationInProgess || this.state.sets.length <= 1}
						style={{margin: "5px", width: "150px", height: "40px"}}>
						Delete
						<DeleteIcon />
					</Button>
					{this.state.manipulationInProgess?<div style={{width: '100%'}}><LinearProgress/></div>:""}
				</div>
			</div>
		);
	}
}

class Manipulation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			'wrap': true,
			'sentences': [],
			'rankings': [],
			'selected_ranking': -1,
			'selected_neuron': undefined,
			'loadingSentences': true,
			'loadingRankings': true
		}

		this.handleRankingSelect = this.handleRankingSelect.bind(this);
		this.handleNeuronClick = this.handleNeuronClick.bind(this);
		this.handleUpdateSentences = this.handleUpdateSentences.bind(this);
		this.handleDeleteSet = this.handleDeleteSet.bind(this);
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
					'pred': pred[i],
					'mods': []
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

		var xhr_modifier = new XMLHttpRequest();
		xhr_modifier.open("POST", "/startModifiedTranslation", true);
		xhr_modifier.setRequestHeader('Content-Type', 'application/json');
		xhr_modifier.send(JSON.stringify({
		    'project_id': project_info['id']
		}))
	}

	handleUpdateSentences(setIdx, manipulated_sentences) {
		let current_sentences = this.state.sentences;

		for (var i = 0; i < current_sentences.length; i++) {
			let new_sentence = manipulated_sentences[i].map(token => [token, (current_sentences[i]['pred'].indexOf(token) == -1)?-0.5:0])
			current_sentences = update(current_sentences, {[i]: {mods: {[setIdx]: {$set: new_sentence}}}});
		}

		this.setState({sentences: current_sentences});
	}

	handleDeleteSet(setIdx) {
		let current_sentences = this.state.sentences;

		for (var i = 0; i < current_sentences.length; i++) {
			current_sentences = update(current_sentences, {[i]: {mods: {$splice: [[setIdx, 1]]}}});
		}

		this.setState({sentences: current_sentences});
	}

	handleRankingSelect(index) {
		this.setState({'selected_ranking': index});
	}

	handleNeuronClick(neuron) {
		if (neuron === this.state.selected_neuron) {
			this.setState({'selected_neuron': undefined});
		}
		else {
			this.setState({'selected_neuron': neuron});
		}
	}

	render() {
		let sentences = [];

		for (var i = 0; i < this.state.sentences.length; i++) {
			sentences.push(
				<div style={{margin: '7px', borderBottom: '1px dashed #ccc'}}>
					<Sentence name="source" tokens={this.state.sentences[i].source} style={{direction: 'ltr', fontFamily: 'monospace'}} wrap={this.state.wrap}/>
					<Sentence name="translation" tokens={this.state.sentences[i].pred} style={this.props.outputStyler} wrap={this.state.wrap}/>
					{this.state.sentences[i]["mods"].map((e, j) => <DiffSentence name={"Set " + (j+1)} tokens={this.state.sentences[i]["mods"][j]} style={this.props.outputStyler} wrap={this.state.wrap}/> )}
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
				        	<IconButton color={this.state.wrap?"primary":""} onClick={() => this.setState({wrap: !this.state.wrap})}>
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
				<div id="manipulation-controls-container">
					<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem'}}>
						<Typography variant="button">
							Manipulation Controls
						</Typography>
					</h1>
					
					<ManipulationControls
						selected_neuron={this.state.selected_neuron}
						onManipulation={this.handleUpdateSentences}
						onSetDelete={this.handleDeleteSet}/>
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
					<NeuronList neurons={neurons} selected_neuron={this.state.selected_neuron} onNeuronClick={this.handleNeuronClick}/>
				</div>
				<div id="neuron-info-container">
					<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem'}}>
						<Typography variant="button">
							Neuron Information
						</Typography>
					</h1>
					<NeuronInformation project_id={this.props.project_id} neuron={this.state.selected_neuron}/>
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
			active_mode: 'manipulation',
			ready: false
		};

		this.handleChangeMode = this.handleChangeMode.bind(this);
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

	handleChangeMode(mode) {
		if (mode == 'analysis') 
			window.location.href = '/analyze?project=' + this.state.project_info.id;
		this.setState({'active_mode': mode});
	}

	render () {
		if (this.state.ready) {
			return (
				<MuiThemeProvider theme={theme}>
					<div id="container">
						<div id="page-header">
							<div>
								<Typography variant="h5">
									{this.state.project_info.projectName}
								</Typography>
							</div>
							<Button href={'/analyze?project=' + this.state.project_info.id}
								variant="outlined"
								color="primary"
								style={{marginLeft: '10px'}}>
								Neuron Analysis
							</Button>
							<Button href={'/analyze?project=' + this.state.project_info.id}
								variant="outlined"
								color="primary"
								style={{marginLeft: '10px'}}>
								Model Ablation
							</Button>
							<Button href="#"
								variant="raised"
								color="primary"
								style={{marginLeft: '10px'}}>
								Neuron Manipulation
							</Button>
						</div>
						<Manipulation
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