import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


class ArchiveNavbar extends React.Component {
    render() {
        return (
            <div id="archive-navbar">
                <nav className="navbar navbar-light bg-light">
                    <div className="col">
                        {/* logo */}
                        <Link to="/" className="navbar-brand d-none d-sm-inline">Media Archive</Link>
                        {/* login */}
                        <div className="btn-group float-right archive-btn-nav">
                            <a href="/login" className="btn btn-outline-dark">Login</a>
                        </div>
                        {/* logout */}
                        <div className="btn-group float-right archive-btn-nav">
                            <a href="/logout" className="btn btn-outline-dark">Logout</a>
                        </div>
                        {/* upload */}
                        <div className="btn-group float-right archive-btn-nav d-none d-sm-block">
                            <Link to="/upload" className="btn btn-outline-dark">Upload</Link>
                        </div>
                    </div>
                </nav>
            </div>
        );
    }
}


export default ArchiveNavbar;
