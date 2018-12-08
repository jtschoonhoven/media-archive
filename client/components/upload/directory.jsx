import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


export default (fileObj, currentUrl) => { // eslint-disable-line
    if (currentUrl.endsWith('/')) {
        currentUrl = currentUrl.slice(0, -1); // strip trailing slash
    }
    return (
        <div className="archive-upload-result" key={fileObj.id}>
            <div className="row">
                {/* filename */}
                <span className="col-12">
                    🗂️ <Link to={`${currentUrl}/${fileObj.name}`}>
                        { fileObj.name }
                    </Link>
                </span>
            </div>
            <hr />
        </div>
    );
};
