import * as React from 'react';
import { Redirect } from 'react-router';


interface Props {
    user: { isLoggedIn: boolean };
}

class ArchiveLogin extends React.Component<Props> {
    render() {
        // redirect if already logged in
        if (this.props.user.isLoggedIn) {
            return <Redirect to="/" />;
        }
        return (
            <div id="archive-login" className="jumbotron">
                <h1 className="display-4">Please log in</h1>
                <p className="lead">
                    Sign in with your
                    <a href="#">@leakeyfoundation.org</a>
                    Google Apps account to access the Archive.
                </p>
                <hr className="my-4" />
                <div className="form-group">
                    <a href="/auth/login" className="btn btn-lg btn-primary">
                        Sign in with Google Apps
                    </a>
                </div>
            </div>
        );
    }
}


export default ArchiveLogin;
