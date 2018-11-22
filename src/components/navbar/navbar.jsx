import React from 'react';
import { Link } from '../common'; // eslint-disable-line no-unused-vars


class ArchiveNavbar extends React.Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <Link href="/" className="navbar-brand">Media Archive</Link>
                <div className="mr-auto mt-2 mt-lg-0" />
                <Link href="/login" className="btn btn-outline-dark">Login</Link>&nbsp;
                <Link href="/logout" className="btn btn-outline-dark">Logout</Link>
            </nav>
        );
    }
}


export default ArchiveNavbar;
