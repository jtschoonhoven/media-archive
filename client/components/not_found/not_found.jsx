import React from 'react';
import { Link } from '../common'; // eslint-disable-line no-unused-vars


class ArchiveNotFound extends React.Component {
    render() {
        return (
            <div className="jumbotron">
                <h1 className="display-4">Not Found</h1>
                <p className="lead">
                    The given URL does not exist.
                </p>
                <hr className="my-4" />
                <p>
                    Click this button to go back to safety.
                </p>
                <Link className="btn btn-primary btn-lg" href="#" role="button">Go home</Link>
            </div>
        );
    }
}


export default ArchiveNotFound;
