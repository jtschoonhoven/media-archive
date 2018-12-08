import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars


export default (fileObj) => {
    return (
        <div className="archive-upload-result" key={fileObj.id}>
            <div className="row">
                {/* filename */}
                <span className="col-12">
                    📄 <Link to={`/detail/${fileObj.id}`}>
                        { fileObj.name }
                    </Link>
                </span>
            </div>
            <hr />
        </div>
    );
};
