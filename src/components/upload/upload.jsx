import React from 'react';

import { Link } from '../common'; // eslint-disable-line no-unused-vars


class ArchiveUpload extends React.Component {
    render() {
        return (
            <div id="archive-upload">
                <h2>File Uploader</h2>
                <hr />
                <button type="submit" className="btn btn-primary btn-lg" onClick={this.handleClick}>
                    Add files
                </button>
            </div>
        );
    }

    handleClick(e) {
        e.preventDefault();
        console.log('UPLOAD');
    }
}


export default ArchiveUpload;
