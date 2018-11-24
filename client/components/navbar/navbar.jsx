import React from 'react';
import { Link } from '../common'; // eslint-disable-line no-unused-vars


class ArchiveNavbar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-light bg-light">
                <div className="col">
                    {/* logo */}
                    <Link href="/" className="navbar-brand d-none d-sm-inline">Media Archive</Link>
                    {/* login */}
                    <div className="btn-group float-right archive-btn-nav">
                        <Link href="/login" className="btn btn-outline-dark">Login</Link>
                    </div>
                    {/* logout */}
                    <div className="btn-group float-right archive-btn-nav">
                        <Link href="/logout" className="btn btn-outline-dark">Logout</Link>
                    </div>
                    {/* upload */}
                    <div className="btn-group float-right archive-btn-nav d-none d-sm-block">
                        <Link href="/upload" className="btn btn-outline-dark">Upload</Link>
                    </div>
                </div>
            </nav>
        );
    }
}


export default ArchiveNavbar;