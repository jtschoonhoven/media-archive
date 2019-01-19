import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import { State } from './types';
import ArchiveApp from './components/routes';

interface Props {
    readonly location: string;
    readonly context: { [propName: string]: string };
    readonly initialState: State;
}

/*
 * This is the main entrypoint for the *server-rendered* React frontend.
 */
class ServerRouter extends React.Component<Props> {
    render() {
        const location = this.props.location;
        const context = this.props.context;
        const initialState = this.props.initialState;
        return (
            <StaticRouter location={ location } context={ context }>
                <ArchiveApp initialState={ initialState } />
            </StaticRouter>
        );
    }
}


export default ServerRouter;
