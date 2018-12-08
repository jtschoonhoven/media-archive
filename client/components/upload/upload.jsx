import './style.scss';

import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import Breadcrumb from './breadcrumb.jsx'; // eslint-disable-line no-unused-vars
import FileUpload from './file-old.jsx'; // eslint-disable-line no-unused-vars
import File from './file.jsx'; // eslint-disable-line no-unused-vars
import Directory from './directory.jsx'; // eslint-disable-line no-unused-vars
import { UPLOAD_STATUS } from '../../constants';


const EXAMPLE_DATA = [ // eslint-disable-line no-unused-vars
    // {
    //     filename: 'file_1.jpg',
    //     progress: 0,
    //     status: UPLOAD_STATUS.PENDING,
    // },
    // {
    //     filename: 'file_2.pdf',
    //     progress: 20,
    //     status: UPLOAD_STATUS.RUNNING,
    // },
    // {
    //     filename: 'file_3.png',
    //     progress: 50,
    //     status: UPLOAD_STATUS.ABORTED,
    // },
    // {
    //     filename: 'file_4.mp4',
    //     progress: 100,
    //     status: UPLOAD_STATUS.SUCCESS,
    // },
    // {
    //     filename: 'file_5.doc',
    //     progress: 100,
    //     status: UPLOAD_STATUS.FAILURE,
    // },
];


class ArchiveUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.loadDir();
    }

    componentDidUpdate() {
        this.loadDir();
    }

    render() {
        // const fileUploads = EXAMPLE_DATA.map(
        //     (fileInfo, index) => <FileUpload {...fileInfo} key={index} />,
        // );
        const props = this.props;
        const currentUrl = props.location.pathname;
        const pathArray = currentUrl.slice(1).split('/');
        const BreadCrumbs = pathArray.map((dirname, idx) => Breadcrumb(pathArray, dirname, idx));
        const Files = props.results.map((fileObj) => {
            return fileObj.type === 'file' ? File(fileObj) : Directory(fileObj, currentUrl);
        });
        return (
            <div id="archive-upload">
                {/* breadcrumbs */}
                <nav id="archive-upload-breadcrumbs" aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <strong>Path:</strong> &nbsp; / &nbsp; { BreadCrumbs }
                    </ol>
                </nav>
                {/* errors */}
                <div id="archive-upload-errors" className="alert alert-danger" role="alert" style={{ display: props.error ? 'block' : 'none' }}>
                    {props.error && props.error.toString()}
                </div>
                {/* uploader */}
                <div className="custom-file">
                    <input type="file" className="custom-file-input" id="archive-upload-input" multiple />
                    <label className="custom-file-label" htmlFor="archive-upload-input">Add files</label>
                </div>
                {/* browse */}
                <div id="archive-upload-browse">
                    <hr />
                    { Files }
                </div>
                {/* uploads */}
                <div id="archive-upload-files">
                    { /* <hr /> */ }
                    { /* fileUploads */ }
                </div>
            </div>
        );
    }

    loadDir() {
        const currentPath = this.props.location.pathname.replace('/files', '');
        if (currentPath !== this.state.currentPath) {
            this.setState({ currentPath });
            this.props.onLoad(currentPath);
        }
    }

    handleClick(e) {
        e.preventDefault();
    }
}


export default ArchiveUpload;
export { UPLOAD_STATUS };
