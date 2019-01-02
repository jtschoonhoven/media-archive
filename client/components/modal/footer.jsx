import React from 'react'; // eslint-disable-line no-unused-vars


/*
 * Return the modal footer that contains confirm and cancel buttons.
 */
export default function ModalFooter(onClose, onConfirm = null) {
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
                        onConfirm();
                        onClose();
                    }}
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
