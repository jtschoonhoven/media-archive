import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


export default (directoryEntry) => { // eslint-disable-line
    return (
        <div className="archive-upload-result" key={directoryEntry.get('name')}>
            <div className="row">
                {/* filename */}
                <span className="col-9 col-sm-10">
                    🗂️ <Link to={`/files/${directoryEntry.path}`}>
                        { directoryEntry.name }
                    </Link>
                </span>
                <span className="col-3 col-sm-2 small text-muted">
                    {directoryEntry.numEntries} items
                </span>
            </div>
            <hr />
        </div>
    );
};
