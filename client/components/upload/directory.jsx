import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


export default (directoryEntry) => { // eslint-disable-line
    return (
        <div className="archive-upload-result" key={directoryEntry.get('name')}>
            <div className="row">
                {/* filename */}
                <span className="col-12">
                    🗂️ <Link to={`${directoryEntry.get('path')}/${directoryEntry.get('name')}`}>
                        { directoryEntry.get('name') }
                    </Link>
                </span>
            </div>
            <hr />
        </div>
    );
};
