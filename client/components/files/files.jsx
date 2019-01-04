import './style.scss';

import React from 'react';
import urlJoin from 'url-join';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import Breadcrumbs from '../common/breadcrumbs.jsx';
import Directory from './directory.jsx';
import File from './file.jsx';
import SETTINGS from '../../settings';
import Upload from './upload.jsx'; // eslint-disable-line no-unused-vars
import Alert from '../common/alert.jsx';

const VALID_EXTENSIONS = Object.keys(SETTINGS.FILE_EXT_WHITELIST);
const FILENAME_BLACKLIST = new RegExp(SETTINGS.REGEX.FILENAME_BLACKLIST);
const DUPLICATE_BLACKLIST = new RegExp(SETTINGS.REGEX.DUPLICATE_BLACKLIST);
const TRIM_ENDS_BLACKLIST = new RegExp(SETTINGS.REGEX.TRIM_ENDS_BLACKLIST);


export default class ArchiveFiles extends React.Component {
    constructor(props) {
        super(props);
        this.handleUploadClick = this.handleUploadClick.bind(this);
        this.showCreateDirectoryModal = this.showCreateDirectoryModal.bind(this);
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
        const showConfirmModal = this.props.actions.showConfirmModal;
        const pathArray = currentUrl.replace('/files', '').split('/');
        const isRootDir = !pathArray.join('');

        const BreadCrumbs = pathArray.map((dirname, idx) => {
            return Breadcrumbs(pathArray, dirname, idx);
        });

        const Errors = [];
        filesState.errors.concat(uploadsState.errors).forEach((msg, idx) => {
            Errors.push(Alert(msg, { idx }));
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
            Files.push(File(fileModel, showConfirmModal));
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

        const Notifications = [];
        if (filesState.isFetching) {
            const alert = Alert(
                'Loading...',
                { idx: 0, style: 'secondary', centered: true, muted: true },
            );
            Notifications.push(alert);
        }
        if (isRootDir) {
            const alert = Alert(
                'Note: Uploads are not permitted in the root folder.',
                { idx: 1, style: 'secondary', centered: true, muted: true },
            );
            Notifications.push(alert);
        }
        if (this.isEmpty(Directories, Files, Uploads)) {
            const alert = Alert(
                'Folder is empty.',
                { idx: 2, style: 'secondary', centered: true, muted: true },
            );
            Notifications.push(alert);
        }

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
                    { Errors }
                </div>
                {/* buttons */}
                <div className="row">
                    {/* upload */}
                    <div className="col-6">
                        <label
                            className={
                                `btn btn-primary w-100 ${isRootDir ? 'disabled' : ''}`
                            }
                        >
                            <strong>▲ Upload Files</strong>
                            <input
                                type="file"
                                onChange={ this.handleUploadClick }
                                accept={ VALID_EXTENSIONS.map(ext => `.${ext}`).join(',') }
                                disabled={ isRootDir }
                                multiple
                                hidden
                            />
                        </label>
                    </div>
                    {/* new folder */}
                    <div className="col-6">
                        <button
                            className="btn btn-outline-dark w-100"
                            onClick={ this.showCreateDirectoryModal }
                        >
                            ➕ Create Folder
                        </button>
                    </div>
                </div>
                {/* browse */}
                <div id="archive-upload-browse">
                    <hr />
                    { Notifications }
                    { Uploads }
                    { Directories }
                    { Files }
                </div>
            </div>
        );
    }

    /*
     * Display a modal with an input to allow creating a new directory.
     */
    showCreateDirectoryModal() {
        const showTextModal = this.props.actions.showTextModal;
        const currentUrl = this.props.location.pathname;
        const title = 'Create a New Folder';
        // const message = `Add your folder to the "${currentUrl.split('/').pop()}" directory.`;
        const message = (
            <span className="text-muted">
                Note: empty folders are not saved until at least one file is added.
            </span>
        );
        const placeholder = 'folder-name';

        const onConfirm = (value) => {
            const history = this.props.history;
            const newUrl = urlJoin(currentUrl, value);
            history.push(newUrl);
        };

        const validator = (value) => {
            if (value.match(FILENAME_BLACKLIST)) {
                throw new Error('Folder name may only contain letters, numbers, and dashes.');
            }
            if (value.match(DUPLICATE_BLACKLIST)) {
                throw new Error('Folder name cannot contain duplicate special characters.');
            }
            if (value.match(TRIM_ENDS_BLACKLIST)) {
                throw new Error('Special characters not allowed at start or end of folder name.');
            }
        };

        showTextModal(title, message, placeholder, onConfirm, validator);
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

    /*
     * True if successful load returned no files, dirs, or uploads for this directory.
     * False if directory is empty to to an error or unfinished request.
     */
    isEmpty(directoriesList, filesList, uploadsList) {
        const filesState = this.props.filesState;
        if (filesState.isFetching) {
            return false;
        }
        if (!filesState.hasFetched) {
            return false;
        }
        if (filesState.errors.length) {
            return false;
        }
        if (directoriesList.length) {
            return false;
        }
        if (filesList.length) {
            return false;
        }
        if (uploadsList.length) {
            return false;
        }
        return true;
    }
}
