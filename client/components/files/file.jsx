import React from 'react'; // eslint-disable-line no-unused-vars
import { Link } from 'react-router-dom'; // eslint-disable-line no-unused-vars

import Alert from '../common/alert.jsx';


export default (fileModel, showTextModal) => {
    const confirmDeleteTitle = `Delete file "${fileModel.name}"?`;
    const confirmDeleteMsg = 'Are you sure? This cannot be undone.';
    const onConfirmDelete = fileModel.delete.bind(fileModel);
    const onDelete = () => showTextModal(confirmDeleteTitle, confirmDeleteMsg, onConfirmDelete);

    return (
        <div className="archive-upload-result" key={ fileModel.id }>
            <div className="row">
                {/* filename */}
                <span className="col-10 col-md-11">
                    📄 <Link to={`/detail/${fileModel.id}`}>
                        { fileModel.name }
                    </Link>
                </span>
                {/* button */}
                <div className="col-2 col-md-1">
                    {
                        fileModel.isDeleting
                            ? <span className="text-muted">deleting</span>
                            : <a href="#" onClick={ onDelete }>delete</a>
                    }
                </div>
            </div>
            {/* error */}
            <div className="row">
                { fileModel.error ? Alert(fileModel.error) : '' }
            </div>
            <hr />
        </div>
    );
};
