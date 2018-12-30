import React from 'react'; // eslint-disable-line no-unused-vars
import urlJoin from 'url-join';
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


export default (directoryModel) => { // eslint-disable-line
    return (
        <div className="archive-upload-result" key={directoryModel.get('name')}>
            <div className="row">
                {/* filename */}
                <span className="col-9 col-sm-10">
                    🗂️ <Link to={urlJoin('/files/', directoryModel.path, directoryModel.name)}>
                        { directoryModel.name }
                    </Link>
                </span>
                <span className="col-3 col-sm-2 small text-muted">
                    {directoryModel.numEntries} items
                </span>
            </div>
            <hr />
        </div>
    );
};
