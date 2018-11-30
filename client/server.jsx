import PropTypes from 'prop-types';
import React from 'react';
import { StaticRouter } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import ArchiveApp from './main.jsx'; // eslint-disable-line no-unused-vars


class ArchiveServerApp extends React.Component {
    render() {
        const location = this.props.location;
        const context = this.props.context;
        const initialState = this.props.initialState;

        return (
            <StaticRouter location={location} context={context}>
                <ArchiveApp initialState={initialState} />
            </StaticRouter>
        );
    }
}

ArchiveServerApp.propTypes = {
    context: PropTypes.objectOf(PropTypes.string).isRequired,
    location: PropTypes.string.isRequired,
    initialState: PropTypes.object.isRequired,
};


export default ArchiveServerApp;
