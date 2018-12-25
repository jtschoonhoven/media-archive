import './style.scss';

import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import Breadcrumb from './breadcrumb.jsx'; // eslint-disable-line no-unused-vars
import FileUpload from './file-old.jsx'; // eslint-disable-line no-unused-vars
import File from './file.jsx'; // eslint-disable-line no-unused-vars
import Directory from './directory.jsx'; // eslint-disable-line no-unused-vars
import Upload from './file-upload.jsx'; // eslint-disable-line no-unused-vars
import { UPLOAD_STATUS } from '../../constants';

const VALID_EXTENSIONS = [
    '.PDF',
    '.DOC',
    '.DOCX',
    '.TIFF',
    '.JPG',
    '.PNG',
].join(',');


class ArchiveUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = { currentPath: undefined };
        this.handleUploadSelect = this.handleUploadSelect.bind(this);
    }

    componentDidMount() {
        this.loadDir();
    }

    componentDidUpdate() {
        this.loadDir();
    }

    render() {
        const props = this.props;
        const currentUrl = props.location.pathname;
        const pathArray = currentUrl.slice(1).split('/');
        const BreadCrumbs = pathArray.map((dirname, idx) => Breadcrumb(pathArray, dirname, idx));

        // parse results objects to generate JSX for files, directories and uploads
        const Files = [];
        const Directories = [];
        const Uploads = [];
        props.results.forEach((fileObj) => {
            if (fileObj.type === 'upload') {
                window.f = fileObj;
                Uploads.push(<Upload fileObj={ fileObj } onUploadCancel={ this.props.onUploadCancel } key={ fileObj.id } />); // eslint-disable-line max-len
            }
            if (fileObj.type === 'file') {
                Files.push(File(fileObj));
            }
            if (fileObj.type === 'directory') {
                Directories.push(Directory(fileObj, currentUrl));
            }
        });
        return (
            <div id="archive-upload">
                {/* breadcrumbs */}
                <nav id="archive-upload-breadcrumbs" aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <strong>Archive</strong> &nbsp; / &nbsp; { BreadCrumbs }
                    </ol>
                </nav>
                {/* errors */}
                <div id="archive-upload-errors" className="alert alert-danger" role="alert" style={{ display: props.error ? 'block' : 'none' }}>
                    { props.error }
                </div>
                {/* uploader */}
                <div className="custom-file">
                    <input id="archive-upload-input" type="file" className="custom-file-input" onChange={this.handleUploadSelect} accept={VALID_EXTENSIONS} multiple />
                    <label className="custom-file-label" htmlFor="archive-upload-input">
                        Upload
                    </label>
                </div>
                {/* browse */}
                <div id="archive-upload-browse">
                    <hr />
                    { Uploads }
                    { Directories }
                    { Files }
                </div>
            </div>
        );
    }

    loadDir() {
        const currentPath = this.getFilePath();
        const stateUpdate = {};

        // reload when URL changes
        if (currentPath !== this.state.currentPath) {
            stateUpdate.currentPath = currentPath;
        }
        // set new state and reload results on change
        if (Object.keys(stateUpdate).length) {
            this.setState(stateUpdate);
            this.props.onLoad(currentPath);
        }
    }

    getFilePath() {
        return this.props.location.pathname.replace('/files', '');
    }

    handleUploadSelect(event) {
        event.preventDefault();
        const path = this.getFilePath();
        const fileList = event.target.files || [];
        this.props.onUpload(path, fileList);
    }
}


export default ArchiveUpload;
export { UPLOAD_STATUS };
