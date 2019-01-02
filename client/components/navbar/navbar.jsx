import './style.scss';

import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


class ArchiveNavbar extends React.Component {
    isLoggedIn() {
        return !!this.props.userState.isLoggedIn;
    }

    render() {
        let logoLinkTo = '/';
        let buttonLinkTo = '/files';
        let buttonLinkText = 'Browse';

        if (this.props.location.pathname.startsWith('/files')) {
            logoLinkTo = '/files';
            buttonLinkTo = '/';
            buttonLinkText = 'Search';
        }

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
                        <Link to={ buttonLinkTo } className="btn btn-outline-dark">{ buttonLinkText }</Link>
                    </div>
                </span>
            );
        }

        return (
            <div id="archive-navbar">
                <nav className="navbar">
                    <div className="col">
                        {/* logo */}
                        <Link to={ logoLinkTo } className="navbar-brand d-none d-sm-inline">
                            Media Archive
                        </Link>
                        {/* buttons */}
                        { NavButtons }
                    </div>
                </nav>
            </div>
        );
    }
}


export default ArchiveNavbar;
