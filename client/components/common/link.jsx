import React from 'react';
import { history as backboneHistory } from 'backbone';


class Link extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    render() {
        return (
            <a {...this.props} onClick={this.handleClick}>
                {this.props.children}
            </a>
        );
    }

    handleClick(e) {
        e.preventDefault();
        backboneHistory.navigate(this.props.href, { trigger: true });
    }
}


export default Link;
