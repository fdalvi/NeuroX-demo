import React from 'react';
import {render} from 'react-dom';
import update from 'immutability-helper';

import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';

import Typography from '@material-ui/core/Typography';
import "./css/ablate.css";
import "../manipulate/css/vis_elements.css";

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

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

import {Line} from "react-chartjs-2";

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

class AblationResults extends React.Component {
	constructor(props) {
		super(props)

		this.createDataset = this.createDataset.bind(this);

		this.chartOptions = {
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: {
					left: 50,
					right: 0,
					top: 0,
					bottom: 0
				}
			},
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

	createDataset(label, data, color) {
		return {
					label: label,
					borderColor: color,
					backgroundColor: color,
					fill: false,
					pointBackgroundColor: color,
					pointBorderColor: color,
					pointRadius: 5,
					pointHoverRadius: 7,
					data: data
				};
	}

	componentWillMount() {
		Chart.defaults.global.defaultFontSize = 16;
	}

	render() {
		let colors = [
			["rgba(116, 200, 103, 1)", "rgba(116, 200, 103, 0.5)"],
			["rgba(255, 137,  79, 1)", "rgba(255, 137,  79, 0.5)"],
			["rgba(246, 237,  47, 1)", "rgba(246, 237,  47, 0.5)"],
			["rgba(151, 187, 205, 1)", "rgba(151, 187, 205, 0.5)"]
		]
		if (this.props.selected_rankings.length == 0) {
			return (
				<div style={{marginLeft: '10px', color: '#555'}}>
					<Typography variant="body1"> Select at least one ranking to visualize the ablation results </Typography>
				</div>
			);
		} else {
			let datasets = []
			for (var i = 0; i < this.props.selected_rankings.length; i++) {
				if (this.props.selected_rankings[i][0]) {
					datasets.push(this.createDataset(this.props.rankings[i].name + ' Top-to-Bottom',
									this.props.rankings[i].forward_ablation_results,
									colors[i % colors.length][0]))
				}
				if (this.props.selected_rankings[i][1]) {
					datasets.push(this.createDataset(this.props.rankings[i].name + ' Bottom-to-Top',
									this.props.rankings[i].backward_ablation_results,
									colors[i % colors.length][1]))
				}
				
			}
			var data = {
				labels : [0,50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400,1450,1500,1550,1600,1650,1700,1750,1800,1850,1900,1950,2000],
				datasets: datasets
			};
			return (
				<div class="chart-container" style={{position: 'relative', flexGrow: '2'}}>
					<Line data={data} options={this.chartOptions}/>
				</div>
			);
		}
	}
}

class Ablation extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			'wrap': true,
			'sentences': [],
			'rankings': [],
			'selected_rankings': [],
			'loadingSentences': true,
			'loadingRankings': true
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
			let selected_rankings = []
			for (var i = 0; i < response['rankings'].length; i++) {
				flat_rankings.push(response['rankings'][i])
				selected_rankings.push([false, false]);
			}

			self.setState({
				'rankings': flat_rankings,
				'selected_rankings': selected_rankings,
				'loadingRankings': false
			})
		}
	}

	handleRankingSelect(idx, subIdx) {
		let selected_rankings = this.state.selected_rankings;
		let current_state = selected_rankings[idx][subIdx];
		selected_rankings = update(selected_rankings, {[idx]: {[subIdx]: {$set: !current_state}}})
		this.setState({'selected_rankings': selected_rankings});
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
			let rankingIdx = i;

			rankings.push(
				<div style={{borderBottom: '#777777 solid 1px'}}>
					<Typography variant="body2"> {ranking.name} </Typography>
					<FormGroup row>
						<FormControlLabel
							control={
							<Checkbox
								checked={this.state.selected_rankings[rankingIdx][0]}
								onChange={() => this.handleRankingSelect(rankingIdx, 0)}
							/>
							}
							label="Top-to-Bottom"
						/>
						<FormControlLabel
							control={
							<Checkbox
								checked={this.state.selected_rankings[rankingIdx][1]}
								onChange={() => this.handleRankingSelect(rankingIdx, 1)}
							/>
							}
							label="Bottom-to-Top"
						/>
					</FormGroup>
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
				<div id="ablation-results-container">
					<h1 style={{margin: '10px', padding: '0px', lineHeight: '1.5rem'}}>
						<Typography variant="button">
							Ablation Results
						</Typography>
					</h1>
					
					<AblationResults rankings={this.state.rankings} selected_rankings={this.state.selected_rankings}/>
				</div>
				<div id="rankings-container">
					<h1 style={{margin: '0px', padding: '0px', lineHeight: '1.5rem'}}>
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
							<Button href="#"
								variant="raised"
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
						<Ablation
							project_id={this.state.project_info.id}
							outputStyler={JSON.parse(this.state.project_info.outputStyler)} />
					</div>
				</MuiThemeProvider>
			);
		} else {
			return (
				<MuiThemeProvider theme={theme}>
					<div id="cloak">
						<h1 className="page-title"> <span style={{color: "#bb4848"}}>Neuro</span><span>X</span> </h1>
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