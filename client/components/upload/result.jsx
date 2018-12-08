import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


export default (idx, fileObj) => { // eslint-disable-line arrow-body-style
    return (
        <div className="archive-upload-result" key={idx}>
            <div className="row">
                {/* filename */}
                <span className="col-12">
                    📁 { fileObj.name }
                </span>
            </div>
            <hr />
        </div>
    );
};
