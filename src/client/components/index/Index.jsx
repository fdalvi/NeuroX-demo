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
			let project_id = "4e763af332"
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

class ExistingProject extends React.Component {
	constructor(props) {
		super(props);

		this.handleProjectLoad = this.handleProjectLoad.bind(this);
	}

	handleProjectLoad() {
		window.location.href = "/analyze?project=" + this.props.project.id;
	}

	render() {
		let project = this.props.project;
		return (
			<div>
				<Typography variant="headline" gutterBottom>
					Existing Project:
				</Typography>
				<div id="new-project-items-container">
					<div style={{'width': '500px', marginLeft: '20px', display: 'flex', flexDirection: 'column'}} >
						<TextField
							id="outlined-dense"
							label="Project Name"
							margin="normal"
							variant="outlined"
							value={project.projectName}
							fullWidth
						/>
						<TextField
							id="outlined-dense"
							label="Model Path"
							margin="normal"
							variant="outlined"
							value={project.modelPath}
							fullWidth
						/>
						<TextField
							id="outlined-dense"
							label="Analysis Text Path"
							margin="normal"
							variant="outlined"
							value={project.textPath}
							fullWidth
						/>
						<TextField
							id="outlined-dense"
							label="Machine Translation Test Path"
							margin="normal"
							variant="outlined"
							value={project.mtTestPath}
							fullWidth
						/>
						<TextField
							id="outlined-dense"
							label="Machine Translation Reference Path"
							margin="normal"
							variant="outlined"
							value={project.mtReferencePath}
							fullWidth
						/>
					</div>
					<div id="rankings-container" style={{height: '374px'}}>
						<h1 className="subtitle">
							Rankings:
						</h1>
						<div id="rankings-list">
							<List component="nav">
								<Divider />
								{
									(project.rankings.length==0) ? <div>
											<ListItem>
												<ListItemText
													primary="You have no rankings yet."
												/>
											</ListItem>
											<Divider />
										</div> : ""
								}
								{
									project.rankings.map((r, i) => (
										<RankingItem ranking={r} />
									))
								}
							</List>
						</div>
					</div>
				</div>
				<div style={{display: 'flex', flexWrap: 'wrap'}}>
					<div style={{'width': '500px', 'marginLeft': '20px', height: '10px'}}></div>
					<div style={{'width': '500px', 'marginLeft': '20px', marginBottom: '40px', display: 'flex', justifyContent: 'flex-end'}}>
						<Button variant="raised" color="primary" onClick={this.handleProjectLoad}>
							Load project
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
			projects: project_list,
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
				<ExistingProject project={this.state.projects[this.state.selectedIndex]} />
			</div>
		}
		return (
			<MuiThemeProvider theme={theme}>
				<div id="container">
					<div id="page-header">
						<h1 className="page-title"> <span style={{color: "#bb4848"}}>Neuro</span><span>X</span> </h1>
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
									  			primary={p.projectName}
									  			secondary={p.creationDate}
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
						<img src="/img/mit-csail-logo.png"></img>
						<img src="/img/qcri-logo.png"></img>
					</div>
				</div>
			</MuiThemeProvider>
		);
	}
}

render(<App/>, document.getElementById('app'));