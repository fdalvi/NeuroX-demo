import React from 'react'

import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'

import "./neuron.css"

export default class Neuron extends React.Component {
	constructor(props) {
		super(props)
	}

	handleClick(event, cb) {
		event.stopPropagation()
		cb()
	}

	render() {
		let action_button = ""

		if (this.props.onAdd) {
			action_button = <span className={"action-icon"} aria-label="Add neuron to set" onClick={(e) => this.handleClick(e, () => this.props.onAdd(this.props.position))}> <AddIcon /> </span>
		}

		if (this.props.onDelete) {
			action_button = <span className={"action-icon"} aria-label="Add neuron to set" onClick={(e) => this.handleClick(e, () => this.props.onDelete(this.props.position))}> <RemoveIcon /> </span>
		}

		return (
			<span className={"neuron" + (this.props.selected?" neuron-selected":"")} onClick={() => this.props.onClick(this.props.position)}>
				{action_button}
				<span className={"label"}> neuron </span>
				{this.props.position}
			</span>
		);
	}
}