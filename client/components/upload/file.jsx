import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


export default (fileEntry) => {
    return (
        <div className="archive-upload-result" key={fileEntry.get('id')}>
            <div className="row">
                {/* filename */}
                <span className="col-12">
                    📄 <Link to={`/detail/${fileEntry.get('id')}`}>
                        { fileEntry.get('name') }
                    </Link>
                </span>
            </div>
            <hr />
        </div>
    );
};
