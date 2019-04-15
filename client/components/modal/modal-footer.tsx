import React from 'react';


/*
 * Return the modal footer that contains confirm and cancel buttons.
 *
 * Return `false` from onConfirm to skip onClose handler.
 */
export default function ModalFooter(onClose, onConfirm = null, confirmIsDisabled = false) {
    if (onConfirm) {
        return (
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={ onClose }>
                    Cancel
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={ () => {
                        // return false from onConfirm to skip onClose handler
                        const success = onConfirm();
                        if (success !== false) {
                            onClose();
                        }
                    }}
                    disabled={ confirmIsDisabled }
                >
                    OK
                </button>
            </div>
        );
    }

    return (
        <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={ onClose }>
                OK
            </button>
        </div>
    );
}
