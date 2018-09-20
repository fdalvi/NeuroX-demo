import React from 'react';
import {render} from 'react-dom';
import update from 'immutability-helper';

import "@material/list/mdc-list";
import "@material/typography/mdc-typography";
import "./css/index.css";

import '@material/react-button/index.scss';
import Button from '@material/react-button';

import '@material/react-text-field/index.scss';
import TextField, {HelperText, Input} from '@material/react-text-field';

import "@material/dialog/mdc-dialog";
import {MDCDialog} from '@material/dialog';

import "@material/select/mdc-select";
import {MDCSelect} from '@material/select';

class NewProject extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			projectName: '',
			modelPath: '',
			textPath: '',
			rankings: [],
			current_ranking_type: undefined,
			rankingName: '',
			crossModelPaths: '',
			taskSpecificTokensPath: '',
			taskSpecificLabelsPath: '',
		}

		this.handleAddRanking = this.handleAddRanking.bind(this);
		this.dialog = undefined;
		this.select = undefined;
	}

	componentDidMount() {
		let self = this;
		this.dialog = new MDCDialog(document.querySelector('#rankings-dialog'));
		this.select = new MDCSelect(document.querySelector('#rankings-selector'));

		this.dialog.listen('MDCDialog:accept', function() {
			if (self.state.current_ranking_type == "cross-model") {
				let rankings = self.state.rankings;
				rankings = update(rankings, {$push: [{name: self.state.rankingName}]});
				self.setState({rankings: rankings});
			} else if(self.state.current_ranking_type == "task-specific") {
				let rankings = self.state.rankings;
				rankings = update(rankings, {$push: [{name: self.state.rankingName}]});
				self.setState({rankings: rankings});
			} else if(self.state.current_ranking_type == "univariate") {
				let rankings = self.state.rankings;
				rankings = update(rankings, {$push: [{name: self.state.rankingName}]});
				self.setState({rankings: rankings});
			} else if(self.state.current_ranking_type == "variance") {
			} else if(self.state.current_ranking_type == "mean") {
			}
		})

		this.dialog.listen('MDCDialog:cancel', function() {
			// do nothing
		})

		this.select.listen('change', function() {
			let defaultRankingName = ""
			if (self.select.value == "cross-model") {
				defaultRankingName = "Cross-Model ranking"
			} else if (self.select.value == "task-specific") {
				defaultRankingName = "Task-Specific ranking"
			} else if (self.select.value == "univariate") {
				defaultRankingName = "Univariate Feature selection"
			}
			self.setState({
				'current_ranking_type': self.select.value,
				'rankingName': defaultRankingName
			})
		});
	}

	handleAddRanking() {
		this.dialog.show()
	}

	render() {
		let ranking_specifics = ""
		if (this.state.current_ranking_type == "cross-model") {
			ranking_specifics = (
				<div style={{marginTop: '20px'}}>
					<TextField
						  label='Ranking Name'
						  helperText={<HelperText>Provide a custom name if you wish to do so</HelperText>}
						  outlined={true}
						  style={{width: '100%'}}
						>
					  <Input
						value={this.state.rankingName}
						onChange={(e) => this.setState({rankingName: e.target.value})}/>
					</TextField>
					<TextField
						  label='Comparative Model Paths'
						  helperText={<HelperText>Path to other similar models that the correlation will be computed against (Comma Separated)</HelperText>}
						  outlined={true}
						  style={{width: '100%'}}
						>
					  <Input
						value={this.state.crossModelPaths}
						onChange={(e) => this.setState({crossModelPaths: e.target.value})}/>
					</TextField>
				</div>
			)
		} else if(this.state.current_ranking_type == "task-specific") {
			ranking_specifics = (
				<div style={{marginTop: '20px'}}>
					<TextField
						  label='Ranking Name'
						  helperText={<HelperText>Provide a custom name if you wish to do so</HelperText>}
						  outlined={true}
						  style={{width: '100%'}}
						>
					  <Input
						value={this.state.rankingName}
						onChange={(e) => this.setState({rankingName: e.target.value})}/>
					</TextField>
					<TextField
						  label='Training tokens path'
						  helperText={<HelperText>Path to text file with the training tokens</HelperText>}
						  outlined={true}
						  style={{width: '100%'}}
						>
					  <Input
						value={this.state.taskSpecificTokensPath}
						onChange={(e) => this.setState({taskSpecificTokensPath: e.target.value})}/>
					</TextField>
					<TextField
						  label='Training labels path'
						  helperText={<HelperText>Path to text file with the training labels for the task at hand</HelperText>}
						  outlined={true}
						  style={{width: '100%'}}
						>
					  <Input
						value={this.state.taskSpecificLabelsPath}
						onChange={(e) => this.setState({taskSpecificLabelsPath: e.target.value})}/>
					</TextField>
				</div>
			)
		} else if(this.state.current_ranking_type == "univariate") {
			ranking_specifics = (
				<div style={{marginTop: '20px'}}>
					<TextField
						  label='Ranking Name'
						  helperText={<HelperText>Provide a custom name if you wish to do so</HelperText>}
						  outlined={true}
						  style={{width: '100%'}}
						>
					  <Input
						value={this.state.rankingName}
						onChange={(e) => this.setState({rankingName: e.target.value})}/>
					</TextField>
					<TextField
						  label='Training tokens path'
						  helperText={<HelperText>Path to text file with the training tokens</HelperText>}
						  outlined={true}
						  style={{width: '100%'}}
						>
					  <Input
						value={this.state.taskSpecificTokensPath}
						onChange={(e) => this.setState({taskSpecificTokensPath: e.target.value})}/>
					</TextField>
					<TextField
						  label='Training labels path'
						  helperText={<HelperText>Path to text file with the training labels for the task at hand</HelperText>}
						  outlined={true}
						  style={{width: '100%'}}
						>
					  <Input
						value={this.state.taskSpecificLabelsPath}
						onChange={(e) => this.setState({taskSpecificLabelsPath: e.target.value})}/>
					</TextField>
				</div>
			)
		} else if(this.state.current_ranking_type == "variance") {
		} else if(this.state.current_ranking_type == "mean") {
		}
		let ranking_dialog = (
			<aside id="rankings-dialog"
			  class="mdc-dialog"
			  role="alertdialog"
			  aria-labelledby="my-mdc-dialog-label"
			  aria-describedby="my-mdc-dialog-description">
			  <div class="mdc-dialog__surface">
				<header class="mdc-dialog__header">
				  <h2 id="my-mdc-dialog-label" class="mdc-dialog__header__title">
					Add a ranking:
				  </h2>
				</header>
				<section id="my-mdc-dialog-description" class="mdc-dialog__body">
					<div style={{height: '40vh', display: 'flex', flexDirection: 'column'}}>
						<div id="rankings-selector" style={{width: "100%"}} class="mdc-select mdc-select--outlined">
							<select class="mdc-select__native-control">
								<option value="" disabled selected></option>
								<option value="cross-model"> Cross-Model Correlation </option>
								<option value="task-specific"> Task-Specific Correlation </option>
								<option value="univariate"> Univariate Feature Selection </option>
								<option value="variance"> Ranking by Variance </option>
								<option value="mean"> Ranking by Distance to the mean </option>
							</select>
							<label class="mdc-floating-label">Choose a Analysis Type</label>
							<div class="mdc-notched-outline">
								<svg> <path class="mdc-notched-outline__path"></path> </svg>
							</div>
							<div class="mdc-notched-outline__idle"></div>
						</div>
						{ranking_specifics}
						<div style={{flexGrow: 2}}>
						</div>
					</div>
				</section>
				
				<footer class="mdc-dialog__footer">
				  <button type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--cancel">Cancel</button>
				  <button type="button" class="mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept">Add</button>
				</footer>
			  </div>
			  <div class="mdc-dialog__backdrop"></div>
			</aside>
		)
		return (
			<div id="new-project-container">
				<div>
					<h1 className="mdc-typography--headline5">New Project:</h1>
					<TextField
					  label='Project Name'
					  helperText={<HelperText>Choose a descriptive name for your project!</HelperText>}
					  outlined={true}
					  style={{'width': '500px'}}
					>
					  <Input
						value={this.state.projectName}
						onChange={(e) => this.setState({projectName: e.target.value})}/>
					</TextField>
					<TextField
					  label='Model Path'
					  helperText={<HelperText>Path to the model you would like to analyze</HelperText>}
					  outlined={true}
					  style={{'width': '500px'}}
					>
					  <Input
						value={this.state.modelPath}
						onChange={(e) => this.setState({modelPath: e.target.value})}/>
					</TextField>
					<TextField
					  label='Analysis Text Path'
					  helperText={<HelperText>Path to the text file containing the text you would like to analyze</HelperText>}
					  outlined={true}
					  style={{'width': '500px'}}
					>
					  <Input
						value={this.state.textPath}
						onChange={(e) => this.setState({textPath: e.target.value})}/>
					</TextField>
				</div>
				<div id="rankings-container">
					<h1 className="mdc-typography--subtitle1">Rankings:</h1>
					<div id="rankings-list">
						<ul className="mdc-list" aria-orientation="vertical">
							<li role="separator" className="mdc-list-divider"></li>
							{
								(this.state.rankings.length==0) ? "You have no rankings yet." : ""
							}
							{
								this.state.rankings.map((r, i) => (
									<li className={'mdc-list-item'}>
										{r.name}
									</li>
								))
							}
							<li role="separator" className="mdc-list-divider"></li>
						</ul>
					</div>
					<div id="ranking-controls">
						<Button outlined={true} 
						onClick={this.handleAddRanking}> Add a ranking </Button>
					</div>
					{ranking_dialog}
				</div>
			</div>
		)
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			projects: [
				{
					name: "English-Arabic bidirectonal model",
					date: "9 September, 2018"
				},
				{
					name: "English-Spanish bidirectonal model",
					date: "2 September, 2018"
				},
				{
					name: "German-English Analysis",
					date: "29 August 2018"
				}
			],
			selectedIndex: -1
		};

		this.handleProjectSelect = this.handleProjectSelect.bind(this);
		this.handleProjectCreate = this.handleProjectCreate.bind(this);
	}

	handleProjectSelect(index) {
		this.setState({selectedIndex: index});
	}

	handleProjectCreate() {
		let project_id = "4e763af331"
		window.location.href = "/analyze?project=" + project_id
	}

	render () {
		let project_info_elem = <div id="project-info-container">
									<NewProject/>
									<Button raised={true} onClick={this.handleProjectCreate}>
										Create new project
										</Button>
								</div>
		if (this.state.selectedIndex > -1) {
			project_info_elem = <div id="project-info-container">
				<h1 className="mdc-typography--headline5">{this.state.projects[this.state.selectedIndex].name}</h1>
			</div>
		}
		return (
			<div id="container">
				<div id="page-header">
					<h1 className="page-title"> <span style={{color: "#bb4848"}}>Neuro</span><span>Dissection</span> </h1>
				</div>
				<div id="page-content">
					<div id="existing-projects">
						<h1 className="mdc-typography--headline5">Projects:</h1>
						<ul className="mdc-list mdc-list--two-line mdc-list--avatar-list" aria-orientation="vertical">
							<li role="separator" className="mdc-list-divider"></li>
							<li className={'mdc-list-item ' + ((this.state.selectedIndex == -1)?'mdc-list-item--selected':'')}
								onClick={() => this.handleProjectSelect(-1)}>
								<span className="mdc-list-item__graphic material-icons dark-icon" aria-hidden="true">add</span>
								<span className="mdc-list-item__text">
									<span className="mdc-list-item__primary-text">Add new project</span>
									<span className="mdc-list-item__secondary-text"></span>
								</span>
							</li>
							<li role="separator" className="mdc-list-divider"></li>
							{
								this.state.projects.map((p, i) => (
									<li className={'mdc-list-item ' + ((this.state.selectedIndex == i)?'mdc-list-item--selected':'')}
										onClick={() => this.handleProjectSelect(i)}>
										<span className="mdc-list-item__graphic material-icons dark-icon" aria-hidden="true">folder</span>
										<span className="mdc-list-item__text">
											<span className="mdc-list-item__primary-text">{p.name}</span>
											<span className="mdc-list-item__secondary-text">{p.date}</span>
										</span>
									</li>
								))
							}
							<li role="separator" className="mdc-list-divider"></li>
						</ul>
					</div>
					<div id="page-divider"></div>
					{project_info_elem}
				</div>
				<div id="page-footer">
					<img src="http://futureofwork.mit.edu/sites/default/files/inline-images/MIT%20CSAIL%202017%20full%20color.png"></img>
					<img src="data:image/png;base64,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"></img>
				</div>
			</div>
		);
	}
}

render(<App/>, document.getElementById('app'));