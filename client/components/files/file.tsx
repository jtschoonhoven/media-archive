import * as React from 'react';
import { Link } from 'react-router-dom';

import Alert from '../common/alert';
import { FileModel } from '../../reducers/files';


export default (
    fileModel: FileModel,
    showTextModal: (
        confirmDeleteTitle: string,
        confirmDeleteMsg: React.ReactElement<HTMLElement> | string,
        onConfirmDelete: () => void,
    ) => void,
): React.ReactElement<HTMLDivElement> => {
    const confirmDeleteTitle = `Delete file "${fileModel.name}"?`;
    const confirmDeleteMsg = 'Are you sure? This cannot be undone.';
    const onConfirmDelete = fileModel.delete.bind(fileModel);
    const onDelete = () => showTextModal(confirmDeleteTitle, confirmDeleteMsg, onConfirmDelete);

    return (
        <div className="archive-upload-result" key={ fileModel.id }>
            <div className="row">
                {/* filename */}
                <span className="col-10 col-md-11">
                    📄
                    <Link to={`/detail/${fileModel.id}`}>
                        { fileModel.name }
                    </Link>
                </span>
                {/* button */}
                <div className="col-2 col-md-1">
                    {
                        fileModel.isDeleting
                            ? <span className="text-muted">deleting</span>
                            : <button onClick={ onDelete }>delete</button>
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
