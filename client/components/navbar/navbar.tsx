import './style.scss';

import * as React from 'react';
import { Link } from 'react-router-dom';

interface Props {
    userState: { isLoggedIn: boolean };
    location: { pathname: string };
}

class ArchiveNavbar extends React.Component<Props> {
    isLoggedIn() {
        return !!this.props.userState.isLoggedIn;
    }

    render() {
        let logoLinkTo = '/files';
        let buttonLinkTo = '/';
        let buttonLinkText = 'Search';

        // navbar button should link to search unless we're already on that page
        if (this.props.location.pathname.trim() === '/') {
            logoLinkTo = '/';
            buttonLinkTo = '/files';
            buttonLinkText = 'Browse';
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
                    <div className="btn-group float-right archive-btn-nav">
                        <Link to={ buttonLinkTo } className="btn btn-outline-dark">
                            { buttonLinkText }
                        </Link>
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
