import React from 'react';
import {render} from 'react-dom';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			title: 'Hello Analyze'
		};
	}

	render () {
		return (
			<div>
				<h1>{this.state.title}></h1>
				<a href="/"> Go back to home </a>
			</div>
		);
	}
}

render(<App/>, document.getElementById('app'));