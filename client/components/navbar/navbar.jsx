import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import './style.scss';


class ArchiveNavbar extends React.Component {
    isLoggedIn() {
        return this.props.user && this.props.user.isLoggedIn;
    }

    render() {
        let NavButtons = ( // eslint-disable-line no-unused-vars
            <span>
                {/* login */}
                <div className="btn-group float-right archive-btn-nav">
                    <a href="/auth/login" className="btn btn-primary">Login</a>
                </div>
            </span>
        );

        if (this.isLoggedIn()) {
            NavButtons = (
                <span>
                    {/* logout */}
                    <div className="btn-group float-right archive-btn-nav">
                        <a href="/auth/logout" className="btn btn-outline-dark">Logout</a>
                    </div>
                    {/* upload */}
                    <div className="btn-group float-right archive-btn-nav d-none d-sm-block">
                        <Link to="/upload" className="btn btn-outline-dark">Upload</Link>
                    </div>
                </span>
            );
        }

        return (
            <div id="archive-navbar">
                <nav className="navbar navbar-light bg-light">
                    <div className="col">
                        {/* logo */}
                        <Link to="/" className="navbar-brand d-none d-sm-inline">Media Archive</Link>
                        {/* buttons */}
                        {NavButtons}
                    </div>
                </nav>
            </div>
        );
    }
}


export default ArchiveNavbar;
