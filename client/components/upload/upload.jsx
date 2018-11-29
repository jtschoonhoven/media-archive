import React from 'react';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import './style.scss';
import FileUpload from './file.jsx'; // eslint-disable-line no-unused-vars
import { UPLOAD_STATUS } from '../../constants';


const EXAMPLE_DATA = [
    {
        filename: 'file_1.jpg',
        progress: 0,
        status: UPLOAD_STATUS.PENDING,
    },
    {
        filename: 'file_2.pdf',
        progress: 20,
        status: UPLOAD_STATUS.RUNNING,
    },
    {
        filename: 'file_3.png',
        progress: 50,
        status: UPLOAD_STATUS.ABORTED,
    },
    {
        filename: 'file_4.mp4',
        progress: 100,
        status: UPLOAD_STATUS.SUCCESS,
    },
    {
        filename: 'file_5.doc',
        progress: 100,
        status: UPLOAD_STATUS.FAILURE,
    },
];


class ArchiveUpload extends React.Component {
    render() {
        const fileUploads = EXAMPLE_DATA.map(
            (fileInfo, index) => <FileUpload {...fileInfo} key={index} />,
        );
        return (
            <div id="archive-upload">
                <h2>File Uploader</h2>
                <br />
                <div className="custom-file">
                    <input type="file" className="custom-file-input" id="archive-upload-input" multiple />
                    <label className="custom-file-label" htmlFor="archive-upload-input">Add files</label>
                </div>
                <div id="archive-upload-files">
                    <hr />
                    { fileUploads }
                </div>
            </div>
        );
    }

    handleClick(e) {
        e.preventDefault();
        console.log('UPLOAD');
    }
}


export default ArchiveUpload;
export { UPLOAD_STATUS };
