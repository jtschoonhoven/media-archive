import * as React from 'react';

import ModalFooter from './modal-footer';


/*
 * Return a bootstrap modal that calls the passed-in function on confirm.
 */
export default function ModalWrapper(
    title,
    bodyJSX,
    onClose,
    onConfirm = null,
    confirmIsDisabled = false,
) {
    return (
        <div
            className="modal show"
            tabIndex={ -1 }
            role="dialog"
            style={{
                display: 'block',
                position: 'absolute',
                background: 'rgba(0, 0, 0, 0.5)',
            }}
            onClick={ onClose }
        >
            <div className="modal-dialog" role="document" onClick={ e => e.stopPropagation() }>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{ title }</h5>
                        <button type="button" className="close" onClick={ onClose }>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        { bodyJSX }
                    </div>
                    { ModalFooter(onClose, onConfirm, confirmIsDisabled) }
                </div>
            </div>
        </div>
    );
}
