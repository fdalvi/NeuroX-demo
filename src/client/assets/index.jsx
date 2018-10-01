import React from 'react';
import {render} from 'react-dom';
import update from 'immutability-helper';

import "./css/index.css";

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import FolderIcon from '@material-ui/icons/Folder';
import AddIcon from '@material-ui/icons/Add';

import Typography from '@material-ui/core/Typography';

import Button from '@material-ui/core/Button';

import TextField from '@material-ui/core/TextField';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';

import Popover from '@material-ui/core/Popover';

import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';

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

class RankingItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			anchorEl: null
		};

		this.handlePopoverOpen = this.handlePopoverOpen.bind(this)
		this.handlePopoverClose = this.handlePopoverClose.bind(this)
	}

	handlePopoverOpen(event) {
		this.setState({ anchorEl: event.currentTarget });
	}

	handlePopoverClose() {
		this.setState({ anchorEl: null });
	}

	render() {
		const open = Boolean(this.state.anchorEl);
		let ranking = this.props.ranking;
		let popover_content

		switch(ranking.type) {
			case "cross-model":
				popover_content = (
					<div style={{padding: '20px'}}>
						<div>
							<span style={theme.typography.body2}> Name: </span> 
							<span style={theme.typography.body1}> {ranking.name} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Type: </span> 
							<span style={theme.typography.body1}> {"Cross-Model Correlation"} </span>
						</div>
						<div>
							<div style={theme.typography.body2}> Comparative Model paths: </div> 
							{ranking.crossModelPaths.split('\n').map(x => <div><code>{x}</code></div>)}
						</div>
						<div>
							<span style={theme.typography.body2}> Tokens path:  </span> 
							<code> {ranking.tokensPath} </code>
						</div>
					</div>
				)
				break;
			case "task-specific":
				popover_content = (
					<div style={{padding: '20px'}}>
						<div>
							<span style={theme.typography.body2}> Name: </span> 
							<span style={theme.typography.body1}> {ranking.name} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Type: </span> 
							<span style={theme.typography.body1}> {"Task-Specific Correlation"} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Tokens path:  </span> 
							<code> {ranking.tokensPath} </code>
						</div>
						<div>
							<span style={theme.typography.body2}> Labels path:  </span> 
							<code> {ranking.labelsPath} </code>
						</div>
					</div>
				)
				break;
			case "univariate":
				popover_content = (
					<div style={{padding: '20px'}}>
						<div>
							<span style={theme.typography.body2}> Name: </span> 
							<span style={theme.typography.body1}> {ranking.name} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Type: </span> 
							<span style={theme.typography.body1}> {"Univariate Feature Selection"} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Tokens path:  </span> 
							<code> {ranking.tokensPath} </code>
						</div>
						<div>
							<span style={theme.typography.body2}> Labels path:  </span> 
							<code> {ranking.labelsPath} </code>
						</div>
					</div>
				)
				break;
			case "variance":
				popover_content = (
					<div style={{padding: '20px'}}>
						<div>
							<span style={theme.typography.body2}> Name: </span> 
							<span style={theme.typography.body1}> {ranking.name} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Type: </span> 
							<span style={theme.typography.body1}> {"Ranking by Variance"} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Tokens path:  </span> 
							<code> {ranking.tokensPath} </code>
						</div>
					</div>
				)
				break;
			case "mean":
				popover_content = (
					<div style={{padding: '20px'}}>
						<div>
							<span style={theme.typography.body2}> Name: </span> 
							<span style={theme.typography.body1}> {ranking.name} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Type: </span> 
							<span style={theme.typography.body1}> {"Ranking by distance to the Mean"} </span>
						</div>
						<div>
							<span style={theme.typography.body2}> Tokens path:  </span> 
							<code> {ranking.tokensPath} </code>
						</div>
					</div>
				)
				break;
		}

		return (
			<div>
				<ListItem button
					onMouseEnter={this.handlePopoverOpen}
					onMouseLeave={this.handlePopoverClose}>
					<ListItemText primary={ranking.name} />
				</ListItem>
				<Popover open={open} anchorEl={this.state.anchorEl}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'center',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'center',
						}}
						onClose={this.handlePopoverClose}
						disableRestoreFocus
						style={{pointerEvents: 'none', padding: '10px'}}
						>
						{popover_content}
				</Popover>
				<Divider />
			</div>
		);
	}
}

class RankingSelector extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			ranking: "",
			rankingName: "",
			rankingNameError: false,
			crossModelPaths: "",
			crossModelPathsError: false,
			rankingTokensPath: "",
			rankingTokensPathError: false,
			rankingLabelsPath: "",
			rankingLabelsPathError: false
		}

		this.resetDialog = this.resetDialog.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleAdd = this.handleAdd.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	resetDialog() {
		this.setState({
			ranking: "",
			rankingName: "",
			rankingNameError: false,
			crossModelPaths: "",
			crossModelPathsError: false,
			rankingTokensPath: "",
			rankingTokensPathError: false,
			rankingLabelsPath: "",
			rankingLabelsPathError: false
		})
	}

	handleCancel() {
		this.resetDialog();
		this.props.onCancel();
	}

	handleAdd() {
		// First check if required information is available
		let fieldsComplete = true;
		let ranking = {
			type: this.state.ranking,
			name: this.state.rankingName,
			tokensPath: this.state.rankingTokensPath
		};
		let errors = {
			rankingNameError: false,
			crossModelPathsError: false,
			rankingTokensPathError: false,
			rankingLabelsPathError: false
		}

		// Check general properties
		if (this.state.rankingName.length == 0) {
			errors['rankingNameError'] = true;
			fieldsComplete = false;
		}
		if (this.state.rankingTokensPath.length == 0) {
			errors['rankingTokensPathError'] = true;
			fieldsComplete = false;	
		}

		// Check ranking-specific properties
		switch(this.state.ranking) {
			case "cross-model":
				ranking['crossModelPaths'] = this.state.crossModelPaths;
				if (this.state.crossModelPaths.length == 0) {
					errors['crossModelPathsError'] = true;
					fieldsComplete = false;
				}
				break;
			case "task-specific":
			case "univariate":
				ranking['labelsPath'] = this.state.rankingLabelsPath;
				if (this.state.rankingLabelsPath.length == 0) {
					errors['rankingLabelsPathError'] = true;
					fieldsComplete = false;	
				}
				break;
			case "variance":
			case "mean":
				break;
			default:
				break;
		}

		if (fieldsComplete) {
			this.props.onAdd(ranking);
			this.resetDialog();
		} else {
			this.setState(errors);
		}
	}

	handleChange(event) {
		let selectedRanking = event.target.value;
		this.resetDialog()
		if (selectedRanking != '') {
			let defaultRankingName = ""
			switch(selectedRanking) {
				case "cross-model":
					defaultRankingName = "Cross-Model Correlation Ranking"
					break;
				case "task-specific":
					defaultRankingName = "Task-Specific Ranking"
					break;
				case "univariate":
					defaultRankingName = "Univariate Feature Selection"
					break;
				case "variance":
					defaultRankingName = "Ranking by Variance"
					break;
				case "mean":
					defaultRankingName = "Ranking by distance to the mean"
					break;
				default:
					break;
			}
			this.setState({
				ranking: selectedRanking,
				rankingName: defaultRankingName
			})
		}
		
	}

	render() {
		let rankingSpecificDOM = ""
		switch(this.state.ranking) {
			case "cross-model":
				rankingSpecificDOM = (
					<div style={{marginTop: '20px'}}>
						<TextField
							label="Ranking Name"
							margin="normal"
							variant="outlined"
							value={this.state.rankingName}
							onChange={(e) => this.setState({rankingName: e.target.value})}
							helperText="Provide a custom name if you wish to do so"
							style={{width: '100%'}}
							error={this.state.rankingNameError}
						/>
						<TextField
							label="Comparative Model Paths"
							margin="normal"
							variant="outlined"
							value={this.state.crossModelPaths}
							onChange={(e) => this.setState({crossModelPaths: e.target.value})}
							helperText="Path to other similar models that the correlation will be computed against (One per line)"
							multiline
							rows="4"
							style={{width: '100%'}}
							error={this.state.crossModelPathsError}
						/>
						<TextField
							label="Analysis Text Path"
							margin="normal"
							variant="outlined"
							value={this.state.rankingTokensPath}
							onChange={(e) => this.setState({rankingTokensPath: e.target.value})}
							helperText="Path to analysis text file to extract neuron activations"
							style={{width: '100%'}}
							error={this.state.rankingTokensPathError}
						/>
					</div>
				)
				break;
			case "task-specific":
			case "univariate":
				rankingSpecificDOM = (
					<div style={{marginTop: '20px'}}>
						<TextField
							label="Ranking Name"
							margin="normal"
							variant="outlined"
							value={this.state.rankingName}
							onChange={(e) => this.setState({rankingName: e.target.value})}
							helperText="Provide a custom name if you wish to do so"
							style={{width: '100%'}}
							error={this.state.rankingNameError}
						/>
						<TextField
							label="Training tokens path"
							margin="normal"
							variant="outlined"
							value={this.state.rankingTokensPath}
							onChange={(e) => this.setState({rankingTokensPath: e.target.value})}
							helperText="Path to text file with the training tokens"
							style={{width: '100%'}}
							error={this.state.rankingTokensPathError}
						/>
						<TextField
							label="Training labels path"
							margin="normal"
							variant="outlined"
							value={this.state.rankingLabelsPath}
							onChange={(e) => this.setState({rankingLabelsPath: e.target.value})}
							helperText="Path to text file with the training labels"
							style={{width: '100%'}}
							error={this.state.rankingLabelsPathError}
						/>
					</div>
				)
				break;
			case "variance":
			case "mean":
				rankingSpecificDOM = (
					<div style={{marginTop: '20px'}}>
						<TextField
							label="Ranking Name"
							margin="normal"
							variant="outlined"
							value={this.state.rankingName}
							onChange={(e) => this.setState({rankingName: e.target.value})}
							helperText="Provide a custom name if you wish to do so"
							style={{width: '100%'}}
							error={this.state.rankingNameError}
						/>
						<TextField
							label="Analysis Text Path"
							margin="normal"
							variant="outlined"
							value={this.state.rankingTokensPath}
							onChange={(e) => this.setState({rankingTokensPath: e.target.value})}
							helperText="Path to analysis text file to extract neuron activations"
							style={{width: '100%'}}
							error={this.state.rankingTokensPathError}
						/>
					</div>
				)
				break;
			default:
				break;
		}

		return (
			<Dialog
				fullWidth
				open={this.props.open}
				onClose={this.handleCancel}
				aria-labelledby="form-dialog-title"
				>
				<DialogTitle id="form-dialog-title">Add a ranking:</DialogTitle>
				<DialogContent style={{minHeight: '450px'}}>
					<FormControl fullWidth>
						<InputLabel htmlFor="ranking-list">Choose an Analysis type</InputLabel>
						<Select
							value={this.state.ranking}
							onChange={this.handleChange}
							inputProps={{
								name: 'ranking',
								id: 'ranking-list',
							}}
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							<MenuItem value={"cross-model"}> Cross-Model Correlation </MenuItem>
							<MenuItem value={"task-specific"}> Task-Specific Correlation </MenuItem>
							<MenuItem value={"univariate"}> Univariate Feature Selection </MenuItem>
							<MenuItem value={"variance"}> Ranking by variance </MenuItem>
							<MenuItem value={"mean"}> Ranking by distance to the mean </MenuItem>
						</Select>
					</FormControl>
					{rankingSpecificDOM}
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleCancel} color="primary">
						Cancel
					</Button>
					<Button onClick={this.handleAdd}
							disabled={this.state.ranking == ''}
							variant="raised"
							color="primary">
						Add
					</Button>
				</DialogActions>
			</Dialog>
		)
	}
}

class NewProject extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			projectName: '',
			projectNameError: false,
			modelPath: '',
			modelPathError: false,
			textPath: '',
			textPathError: false,
			mtTestPath: '',
			mtTestPathError: false,
			mtReferencePath: '',
			mtReferencePathError: false,
			rankings: [],
			rankingSelectorOpen: false
		}

		this.handleOpenRankingSelector = this.handleOpenRankingSelector.bind(this);
		this.handleCloseRankingSelector = this.handleCloseRankingSelector.bind(this);
		this.handleAddRanking = this.handleAddRanking.bind(this);
		this.handleProjectCreate = this.handleProjectCreate.bind(this);
	}

	handleOpenRankingSelector() {
		this.setState({rankingSelectorOpen: true})
	}

	handleCloseRankingSelector() {
		this.setState({rankingSelectorOpen: false})
	}

	handleAddRanking(ranking) {
		this.setState({
			rankingSelectorOpen: false,
			rankings: update(this.state.rankings, {$push: [ranking]})
		})
	}

	handleProjectCreate() {
		let fieldsComplete = true;
		let errors = {
			projectNameError: false,
			modelPathError: false,
			textPathError: false,
			mtTestPathError: false,
			mtReferencePathError: false
		}
		if (this.state.projectName.length == 0) {
			errors['projectNameError'] = true;
			fieldsComplete = false;
		}
		if (this.state.modelPath.length == 0) {
			errors['modelPathError'] = true;
			fieldsComplete = false;
		}
		if (this.state.textPath.length == 0) {
			errors['textPathError'] = true;
			fieldsComplete = false;
		}
		if (this.state.mtTestPath.length == 0) {
			errors['mtTestPathError'] = true;
			fieldsComplete = false;
		}
		if (this.state.mtReferencePath.length == 0) {
			errors['mtReferencePathError'] = true;
			fieldsComplete = false;
		}

		if (fieldsComplete) {
			let project_id = "4e763af331"
			window.location.href = "/analyze?project=" + project_id;
		} else {
			this.setState(errors);
		}
	}

	render() {
		return (
			<div>
				<Typography variant="headline" gutterBottom>
					New Project:
				</Typography>
				<div id="new-project-items-container">
					<div style={{'width': '500px', marginLeft: '20px', display: 'flex', flexDirection: 'column'}} >
						<TextField
							id="outlined-dense"
							label="Project Name"
							margin="normal"
							variant="outlined"
							value={this.state.projectName}
							onChange={(e) => this.setState({projectName: e.target.value})}
							helperText="Choose a descriptive name for your project"
							fullWidth
							error={this.state.projectNameError}
						/>
						<TextField
							id="outlined-dense"
							label="Model Path"
							margin="normal"
							variant="outlined"
							value={this.state.modelPath}
							onChange={(e) => this.setState({modelPath: e.target.value})}
							helperText="Path to the model you would like to analyze"
							fullWidth
							error={this.state.modelPathError}
						/>
						<TextField
							id="outlined-dense"
							label="Analysis Text Path"
							margin="normal"
							variant="outlined"
							value={this.state.textPath}
							onChange={(e) => this.setState({textPath: e.target.value})}
							helperText="Path to the text file containing the text you would like to analyze"
							fullWidth
							error={this.state.textPathError}
						/>
						<TextField
							id="outlined-dense"
							label="Machine Translation Test Path"
							margin="normal"
							variant="outlined"
							value={this.state.mtTestPath}
							onChange={(e) => this.setState({mtTestPath: e.target.value})}
							helperText="Path to a test set to compute MT performance"
							fullWidth
							error={this.state.mtTestPathError}
						/>
						<TextField
							id="outlined-dense"
							label="Machine Translation Reference Path"
							margin="normal"
							variant="outlined"
							value={this.state.mtReferencePath}
							onChange={(e) => this.setState({mtReferencePath: e.target.value})}
							helperText="Path to the coresponding reference set"
							fullWidth
							error={this.state.mtReferencePathError}
						/>
					</div>
					<div id="rankings-container">
						<h1 className="subtitle">
							Rankings:
						</h1>
						<div id="rankings-list">
							<List component="nav">
								<Divider />
								{
									(this.state.rankings.length==0) ? <div>
											<ListItem>
												<ListItemText
													primary="You have no rankings yet."
												/>
											</ListItem>
											<Divider />
										</div> : ""
								}
								{
									this.state.rankings.map((r, i) => (
										<RankingItem ranking={r} />
									))
								}
							</List>
						</div>
						<div id="ranking-controls">
							<Button variant="outlined" color="primary" onClick={this.handleOpenRankingSelector}>
								Add a ranking
							</Button>
						</div>
						<RankingSelector open={this.state.rankingSelectorOpen} onAdd={this.handleAddRanking} onCancel={this.handleCloseRankingSelector}/>
					</div>
				</div>
				<div style={{display: 'flex', flexWrap: 'wrap'}}>
					<div style={{'width': '500px', 'marginLeft': '20px', height: '10px'}}></div>
					<div style={{'width': '500px', 'marginLeft': '20px', marginBottom: '40px', display: 'flex', justifyContent: 'flex-end'}}>
						<Button variant="raised" color="primary" onClick={this.handleProjectCreate}>
							Create new project
						</Button>
					</div>
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
					name: "English-Arabic bidirectional model",
					date: "9 September, 2018"
				},
				{
					name: "English-Spanish 2 Layer",
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
	}

	handleProjectSelect(index) {
		this.setState({selectedIndex: index});
	}

	render () {
		let project_info_elem = (
			<div id="project-info-container">
				<NewProject/>
			</div>
		)
		if (this.state.selectedIndex > -1) {
			project_info_elem = <div id="project-info-container">
				<Typography variant="headline" gutterBottom>
					{this.state.projects[this.state.selectedIndex].name}
				</Typography>
			</div>
		}
		return (
			<MuiThemeProvider theme={theme}>
	
			<div id="container">
				<div id="page-header">
					<h1 className="page-title"> <span style={{color: "#bb4848"}}>Neuro</span><span>Dissection</span> </h1>
				</div>
				<div id="page-content">
					<div id="existing-projects">
						<Typography variant="headline" gutterBottom>
							Projects:
						</Typography>
						<List component="nav">
							<Divider />
							<ListItem selected={this.state.selectedIndex == -1} onClick={() => this.handleProjectSelect(-1)} button>
								<Avatar> <AddIcon /> </Avatar>
								<ListItemText
								  primary="Add new project"
								  secondary=" "
								/>
							</ListItem>
							<Divider />
							{
								this.state.projects.map((p, i) => (
									<ListItem selected={this.state.selectedIndex == i} onClick={() => this.handleProjectSelect(i)} button>
										<Avatar> <FolderIcon /> </Avatar>
										<ListItemText
								  			primary={p.name}
								  			secondary={p.date}
										/>
									</ListItem>
								))
							}
							<Divider />
						</List>
					</div>
					<div id="page-divider"></div>
					{project_info_elem}
				</div>
				<div id="page-footer">
					<img src="http://futureofwork.mit.edu/sites/default/files/inline-images/MIT%20CSAIL%202017%20full%20color.png"></img>
					<img src="data:image/png;base64,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"></img>
				</div>
			</div>
			</MuiThemeProvider>
		);
	}
}

render(<App/>, document.getElementById('app'));