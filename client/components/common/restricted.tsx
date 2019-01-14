import * as React from 'react';
import { Link, Redirect, Route } from 'react-router-dom';

interface Props {
    readonly component: any; // FIXME
    readonly exact: boolean;
    readonly location?: string;
    readonly path: string;
    readonly store: any; // FIXME
}


export default class RestrictedRoute extends React.Component<Props> {
    isLoggedIn(props: Props) {
        const state = props.store.getState();
        return state.user && state.user.isLoggedIn;
    }

    restrictedRender(props: Props) {
        const Component = props.component;

        if (this.isLoggedIn(props)) {
            return <Component />;
        }
        return <Redirect to={{ pathname: '/login', state: { from: props.location } }} />;
    }

    render() {
        const { component, location, ...filteredProps } = this.props;
        return (
            <Route {...filteredProps} render={ this.restrictedRender.bind(null, this.props) } />
        );
    }
}
