import React from 'react';
import {render} from 'react-dom';

import "@material/button/mdc-button";

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			title: 'Hello Index'
		};
	}

	render () {
		return (
			<div>
				<h1>{this.state.title}></h1>
				<a href="/analyze"> See all the analysis </a>
				<button class="mdc-button mdc-button--outlined">
					Button
				</button>
			</div>
		);
	}
}

render(<App/>, document.getElementById('app'));