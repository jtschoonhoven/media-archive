import './style.scss';

import _ from 'lodash';
import * as React from 'react';
import urlJoin from 'url-join';
import { Link } from 'react-router-dom';

import Breadcrumbs from '../common/breadcrumbs.jsx';
import Directory from './directory.jsx';
import File from './file.jsx';
import SETTINGS from '../../settings';
import Upload from './upload.jsx';
import Alert from '../common/alert';
import { DirectoryModel, FileModel, FilesState } from '../../reducers/files';
import { UploadsState } from '../../reducers/uploads';
import { FilesActions } from '../../containers/files';

const VALID_EXTENSIONS = Object.keys(SETTINGS.FILE_EXT_WHITELIST);
const FILENAME_BLACKLIST = new RegExp(SETTINGS.REGEX.FILENAME_BLACKLIST);
const DUPLICATE_BLACKLIST = new RegExp(SETTINGS.REGEX.DUPLICATE_BLACKLIST);
const TRIM_ENDS_BLACKLIST = new RegExp(SETTINGS.REGEX.TRIM_ENDS_BLACKLIST);

interface Props {
    actions: FilesActions;
    filesState: FilesState;
    history: string[];
    uploadsState: UploadsState;
    location: {
        pathname: string;
    };
}


export default class ArchiveFiles extends React.Component<Props> {
    constructor(props: Props) {
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
        const currentUrl = this.props.location.pathname;
        const pathArray = currentUrl.replace('/files', '').split('/').filter(item => item);
        const isRootDir = !pathArray.length;

        return (
            <div id="archive-files">

                {/* breadcrumbs */}
                <nav id="archive-upload-breadcrumbs" aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <strong>
                            { isRootDir ? 'Files' : <Link to="/files">Files</Link> }
                        </strong> &nbsp; / &nbsp;
                        { this.getBreadcrumbs(pathArray) }
                    </ol>
                </nav>

                {/* errors */}
                <div id="archive-files-errors">
                    { this.getErrors() }
                </div>
                <div className="row">

                    {/* upload button */}
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
                                multiple={ true }
                                hidden={ true }
                            />
                        </label>
                    </div>

                    {/* new folder button */}
                    <div className="col-6">
                        <button
                            className="btn btn-outline-dark w-100"
                            onClick={ this.showCreateDirectoryModal }
                        >
                            ➕ Create Folder
                        </button>
                    </div>
                </div>

                {/* file browser */}
                <div id="archive-upload-browse">
                    <hr />
                    <div id="archive-upload-browse-notifications">
                        { this.getNotifications(isRootDir) }
                    </div>
                    <div id="archive-upload-browse-uploads">
                        { this.getUploads() }
                    </div>
                    <div id="archive-upload-browse-directories">
                        { this.getDirectories(pathArray) }
                    </div>
                    <div id="archive-upload-browse-files">
                        { this.getFiles() }
                    </div>
                </div>
            </div>
        );
    }

    getErrors() {
        const filesState = this.props.filesState;
        const uploadsState = this.props.uploadsState;
        return filesState.errors.concat(uploadsState.errors).map((msg, idx) => {
            return Alert(msg, { idx });
        });
    }

    getBreadcrumbs(pathArray) {
        return pathArray.map((dirname, idx) => Breadcrumbs(pathArray, dirname, idx));
    }

    getDirectories(pathArray) {
        const Directories = [];
        const uploadsListByDirname = {};
        const filesState = this.props.filesState;
        const uploadsState = this.props.uploadsState;

        // create a Directory component for each directory in filesState
        Object.values(filesState.directoriesByName).forEach((directoryModel) => {
            Directories.push(Directory(directoryModel));
        });

        // populate uploadsListByDirname
        // needed in case a file is uploaded to a new directory not included in filesState
        Object.values(uploadsState.uploadsById).forEach((uploadModel) => {
            if (!uploadModel.directoryPath.startsWith(filesState.path)) {
                return; // check that upload model is in same path as current dir
            }
            if (uploadModel.pathArray.length <= pathArray.length + 1) {
                return; // check that upload model is in child folder of the current directory
            }
            if (uploadModel.isDeleting || uploadModel.isDeleted) {
                return; // check that upload model has not been deleted
            }
            const dirname = uploadModel.pathArray[pathArray.length];
            if (_.has(filesState.directoriesByName, dirname)) {
                return; // check that upload directory is not already included in directoriesByName
            }
            if (uploadsListByDirname[dirname]) {
                uploadsListByDirname[dirname].push(uploadModel);
            }
            else {
                uploadsListByDirname[dirname] = [uploadModel];
            }
        });

        // create a directory component for each dirname in uploadsListByDirname
        Object.keys(uploadsListByDirname).forEach((dirname) => {
            const uploadsList = uploadsListByDirname[dirname];
            const directoryModel = new DirectoryModel({
                name: dirname,
                path: filesState.path,
                numEntries: uploadsList.length,
            });
            Directories.push(Directory(directoryModel));
        });

        return Directories;
    }

    getFiles() {
        const Files = [];
        const filesState = this.props.filesState;
        const uploadsState = this.props.uploadsState;
        const showConfirmModal = this.props.actions.showConfirmModal;

        Object.values(filesState.filesById).forEach((fileModel: FileModel) => {
            if (fileModel.isDeleted) {
                return;
            }
            if (uploadsState.uploadsById.get(fileModel.id)) {
                return; // skip files that are also included in uploads
            }
            Files.push(File(fileModel, showConfirmModal));
        });
        return Files;
    }

    getUploads() {
        const Uploads = [];
        const filesState = this.props.filesState;
        const uploadsState = this.props.uploadsState;

        Object.values(uploadsState.uploadsById).forEach((uploadModel) => {
            if (uploadModel.isDeleted) {
                return;
            }
            if (uploadModel.directoryPath === filesState.path) {
                Uploads.push(Upload(uploadModel));
            }
        });
        return Uploads;
    }

    getNotifications(isRootDir) {
        const Notifications = [];
        if (isRootDir) {
            const alert = Alert(
                'Note: Uploads are not permitted in the root folder.',
                { idx: 1, style: 'secondary', centered: true, muted: true },
            );
            Notifications.push(alert);
        }
        if (this.isEmpty()) {
            const alert = Alert(
                'Folder is empty.',
                { idx: 2, style: 'secondary', centered: true, muted: true },
            );
            Notifications.push(alert);
        }
        return Notifications;
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
    isEmpty() {
        const filesState = this.props.filesState;
        const uploadsState = this.props.uploadsState;

        if (filesState.isFetching) {
            return false;
        }
        if (!filesState.hasFetched) {
            return false;
        }
        if (filesState.errors.length) {
            return false;
        }
        if (!_.isEmpty(filesState.directoriesByName)) {
            return false;
        }
        if (!_.isEmpty(filesState.filesById)) {
            return false;
        }
        if (!_.isEmpty(uploadsState.uploadsById)) {
            return false;
        }
        return true;
    }
}
