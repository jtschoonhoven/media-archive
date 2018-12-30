import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import SETTINGS from '../../settings';

const UPLOAD_STATUSES = SETTINGS.UPLOAD_STATUSES;
const FAILURE_STATES = [UPLOAD_STATUSES.ABORTED, UPLOAD_STATUSES.FAILURE];


export default class Upload extends React.Component {
    constructor(props) {
        super(props);
        this.handleUploadCancel = this.handleUploadCancel.bind(this);
    }


    render() {
        const uploadModel = this.props.uploadModel;

        // defaults apply to "pending" states (not success or failure)
        let isAnimated = true;
        let isStriped = true;
        let styleName = 'info';
        let ActionLink = <a href="#" onClick={ this.handleUploadCancel }>cancel</a>; // eslint-disable-line no-unused-vars

        if (uploadModel.isDeleted) {
            return '';
        }

        if (uploadModel.isDeleting) {
            isAnimated = false;
            styleName = 'danger';
            ActionLink = <span className="text-muted">canceling</span>;
        }

        // progress bars are not animated on success, no "retry" or "cancel" option
        if (uploadModel.status === UPLOAD_STATUSES.SUCCESS) {
            isAnimated = false;
            isStriped = false;
            styleName = 'success';
            ActionLink = '';
        }

        // progress bars are not animated on failure, show "retry" option
        else if (FAILURE_STATES.includes(uploadModel.status)) {
            isAnimated = false;
            styleName = 'danger';
            ActionLink = <a href="#" onClick={ this.handleUploadCancel }>remove</a>;
        }

        return (
            <div className="archive-upload-pending">
                <div className="row">
                    {/* filename */}
                    <span className="col-sm-6 col-md-4">
                        📄 <Link to={`/detail/${uploadModel.id}`}>
                            { uploadModel.name }
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
                                style={{ width: `${uploadModel.uploadPercent}%` }}
                                aria-valuenow={ uploadModel.uploadPercent }
                                aria-valuemin="0"
                                aria-valuemax="100"
                                role="progressbar"
                            >
                            </div>
                        </div>
                    </div>
                    {/* status */}
                    <div className="col-sm-2 col-md-2 text-muted">
                        <span>{ uploadModel.status }</span>
                    </div>
                    {/* button */}
                    <div className="col-sm-2 col-md-1">
                        { ActionLink }
                    </div>
                </div>
                <div className="row">
                    {uploadModel.error ? <span className="text-danger">{uploadModel.error}</span> : ''}
                </div>
                <hr />
            </div>
        );
    }

    handleUploadCancel(event) {
        event.preventDefault();
        this.props.uploadModel.cancel();
    }
}
