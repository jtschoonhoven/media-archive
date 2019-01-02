import './style.scss';

import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import Breadcrumbs from '../common/breadcrumbs.jsx';
import Directory from './directory.jsx';
import File from './file.jsx';
import SETTINGS from '../../settings';
import Upload from './upload.jsx'; // eslint-disable-line no-unused-vars
import Alert from '../common/alert.jsx';
import { showNewDirectoryModal } from './modal-new-directory.jsx';

const VALID_EXTENSIONS = Object.keys(SETTINGS.FILE_EXT_WHITELIST);


export default class ArchiveFiles extends React.Component {
    constructor(props) {
        super(props);
        this.handleUploadClick = this.handleUploadClick.bind(this);
    }

    componentDidMount() {
        this.loadDir();
    }

    componentDidUpdate() {
        this.loadDir();
    }

    render() {
        const props = this.props;
        const filesState = props.filesState;
        const uploadsState = props.uploadsState;
        const currentUrl = props.location.pathname;
        const pathArray = currentUrl.replace('/files', '').split('/');

        const BreadCrumbs = pathArray.map((dirname, idx) => {
            return Breadcrumbs(pathArray, dirname, idx);
        });

        const Errors = [];
        filesState.errors.concat(uploadsState.errors).forEach((msg, idx) => {
            Errors.push(Alert(msg, idx));
        });

        const Directories = [];
        filesState.directoriesByName.forEach((directoryModel) => {
            Directories.push(Directory(directoryModel));
        });

        const Files = [];
        filesState.filesById.forEach((fileModel) => {
            if (fileModel.isDeleted) {
                return;
            }
            if (uploadsState.uploadsById.get(fileModel.id)) {
                return; // skip files that are also included in uploads
            }
            Files.push(File(fileModel));
        });

        const Uploads = [];
        uploadsState.uploadsById.forEach((uploadModel) => {
            if (uploadModel.isDeleted) {
                return;
            }
            if (uploadModel.directoryPath === filesState.path) {
                Uploads.push(Upload(uploadModel));
            }
        });

        return (
            <div id="archive-files">
                {/* breadcrumbs */}
                <nav id="archive-upload-breadcrumbs" aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <strong>Archive</strong> &nbsp; / &nbsp; { BreadCrumbs }
                    </ol>
                </nav>
                {/* errors */}
                <div id="archive-files-errors">
                    {Errors}
                </div>
                {/* uploader */}
                <div className="row">
                    <div className="col-6 custom-file">
                        <input
                            id="archive-files-input"
                            type="file"
                            className="custom-file-input"
                            onChange={this.handleUploadClick}
                            accept={VALID_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                            disabled={!pathArray.join('')}
                            multiple
                        />
                        <label className="custom-file-label" htmlFor="archive-files-input">
                            Upload files
                        </label>
                    </div>
                    <div className="col-6">
                        <button
                            className="btn btn-outline-dark w-100"
                            onClick={ () => showNewDirectoryModal(currentUrl, this.props.history) }
                        >
                            New folder
                        </button>
                    </div>
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

    /*
     * Get the path to the current directory in the virtual filesystem.
     * The URL maps 1:1 to the virtual filesystem, but we have to strip the `/files` prefix.
     */
    getFilePath() {
        let path = this.props.location.pathname.replace('/files', '');
        path = path.startsWith('/') ? path.slice(1) : path;
        path = path.endsWith('/') ? path.slice(0, -1) : path;
        return path;
    }

    /*
     * Reload the directory contents when the URL changes.
     */
    loadDir() {
        const filesState = this.props.filesState;
        const path = this.getFilePath();
        if (path !== filesState.path) {
            this.props.actions.load(path);
        }
    }

    /*
     * Event handler for the "upload" button.
     */
    handleUploadClick(event) {
        event.preventDefault();
        const path = this.getFilePath();
        const fileList = event.target.files;
        this.props.actions.upload(path, fileList);
    }
}
