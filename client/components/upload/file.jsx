import PropTypes from 'prop-types';
import React from 'react';

import { UPLOAD_STATUS } from '../../constants';

const SUCCESS_STATES = [UPLOAD_STATUS.SUCCESS];
const FAILURE_STATES = [UPLOAD_STATUS.ABORTED, UPLOAD_STATUS.FAILURE];


class FileUpload extends React.Component {
    render() {
        const status = this.props.status;
        const progress = this.props.progress;

        // defaults apply to "pending" states (not success or failure)
        let isAnimated = true;
        let isStriped = true;
        let styleName = 'info';
        let actionName = 'cancel';

        // progress bars are not animated on success, no "retry" or "cancel" option
        if (SUCCESS_STATES.includes(status)) {
            isAnimated = false;
            isStriped = false;
            styleName = 'success';
            actionName = '';
        }

        // progress bars are not animated on failure, show "retry" option
        else if (FAILURE_STATES.includes(status)) {
            isAnimated = false;
            styleName = 'danger';
            actionName = 'retry';
        }

        return (
            <div className="archive-upload-file">
                <div className="row">
                    {/* filename */}
                    <span className="col-sm-6 col-md-4">
                        { this.props.filename }
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
                        <span>{ status }</span>
                    </div>
                    {/* button */}
                    <div className="col-sm-2 col-md-1">
                        <a href="#">{ actionName }</a>
                    </div>
                </div>
                <hr />
            </div>
        );
    }
}

FileUpload.propTypes = {
    filename: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    status: PropTypes.oneOf(Object.values(UPLOAD_STATUS)).isRequired,
};


export default FileUpload;
