import * as React from 'react';
import urlJoin from 'url-join';
import { Link } from 'react-router-dom';

import { DirectoryModel } from '../../reducers/files';


export default (directoryModel: DirectoryModel): React.ReactElement<HTMLDivElement> => {
    return (
        <div className="archive-upload-result" key={ directoryModel.name }>
            <div className="row">
                {/* filename */}
                <span className="col-9 col-sm-10">
                    🗂️ <Link to={ urlJoin('/files/', directoryModel.path, directoryModel.name) }>
                        { directoryModel.name }
                    </Link>
                </span>
                <span className="col-3 col-sm-2 small text-muted">
                    { directoryModel.numEntries } items
                </span>
            </div>
            <hr />
        </div>
    );
};
