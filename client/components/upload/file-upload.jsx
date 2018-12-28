import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import SETTINGS from '../../settings';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;
const FAILURE_STATES = [UPLOAD_STATUSES.ABORTED, UPLOAD_STATUSES.FAILURE];


class FileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = { progress: 50 };
        this.handleUploadCancel = this.handleUploadCancel.bind(this);
    }


    render() {
        const uploadEntry = this.props.uploadEntry;
        const progress = this.state.progress;

        // defaults apply to "pending" states (not success or failure)
        let isAnimated = true;
        let isStriped = true;
        let styleName = 'info';
        let ActionLink = <a href="#" onClick={ this.handleUploadCancel }>cancel</a>; // eslint-disable-line no-unused-vars

        if (uploadEntry.isDeleted) {
            return '';
        }

        if (uploadEntry.isDeleting) {
            isAnimated = false;
            styleName = 'danger';
            ActionLink = <span className="text-muted">canceling</span>;
        }

        // progress bars are not animated on success, no "retry" or "cancel" option
        if (uploadEntry.status === UPLOAD_STATUSES.SUCCESS) {
            isAnimated = false;
            isStriped = false;
            styleName = 'success';
            ActionLink = '';
        }

        // progress bars are not animated on failure, show "retry" option
        else if (FAILURE_STATES.includes(uploadEntry.status)) {
            isAnimated = false;
            styleName = 'danger';
            ActionLink = <a href="#" onClick={ this.handleUploadCancel }>remove</a>;
        }

        return (
            <div className="archive-upload-pending">
                <div className="row">
                    {/* filename */}
                    <span className="col-sm-6 col-md-4">
                        📄 <Link to={`/detail/${uploadEntry.id}`}>
                            { uploadEntry.name }
                        </Link>
                    </span>
                    {/* progress */}
                    <div className="col-sm-2 col-md-5">
                        <div className="progress">
                            <div
                                className={`
                                    progress-bar
                                    ${isStriped && 'progress-bar-striped'}
                                    ${isAnimated && 'progress-bar-animated'}
                                    bg-${styleName}
                                `}
                                style={{ width: `${progress}%` }}
                                aria-valuenow={ progress }
                                aria-valuemin="0"
                                aria-valuemax="100"
                                role="progressbar"
                            >
                            </div>
                        </div>
                    </div>
                    {/* status */}
                    <div className="col-sm-2 col-md-2">
                        <span>{ uploadEntry.status }</span>
                    </div>
                    {/* button */}
                    <div className="col-sm-2 col-md-1">
                        { ActionLink }
                    </div>
                </div>
                <hr />
            </div>
        );
    }

    handleUploadCancel(event) {
        event.preventDefault();
        this.props.onUploadCancel(this.props.uploadEntry);
    }
}

export default FileUpload;
