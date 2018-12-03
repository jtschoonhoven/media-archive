import React from 'react'; // eslint-disable-line no-unused-vars
import PropTypes from 'prop-types';
import { Link, Redirect, Route } from 'react-router-dom'; // eslint-disable-line no-unused-vars


class RestrictedRoute extends React.Component {
    isLoggedIn(props) {
        const state = props.store.getState();
        console.log(`STATE: ${JSON.stringify(state)}`);
        return state.user && state.user.isLoggedIn;
    }

    restrictedRender(props) {
        const Component = props.component; // eslint-disable-line no-unused-vars

        if (this.isLoggedIn(props)) {
            return <Component />;
        }
        return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
    }

    render() {
        // eslint-disable-next-line prefer-spread
        const { component, ...filteredProps } = this.props;
        return (
            <Route {...filteredProps} render={() => this.restrictedRender(this.props)} />
        );
    }
}

RestrictedRoute.propTypes = {
    store: PropTypes.object.isRequired,
};


export default RestrictedRoute;
