import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';


/*
 * Helper method to render (and clean up) the modal at its own top-level element.
 * Bootstrap modals must be rendered at the top of the HTML doc, so we engage in some behavior
 * that would *usually* be an anti-pattern.
 */
export function showModal(title, BodyComponent, onConfirm = null) {
    const el = document.getElementById('archive-modal');
    const onClose = ReactDOM.unmountComponentAtNode.bind(null, el);
    const modal = Modal(title, BodyComponent, onClose, onConfirm);
    ReactDOM.render(modal, el);
}

/*
 * Return a bootstrap modal that calls the passed-in function on confirm.
 */
export default function Modal(title, BodyComponent, onClose, onConfirm = null) {
    return (
        <div
            className="modal show"
            tabIndex="-1"
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
                        <button
                            type="button"
                            className="close"
                            aria-label="Close"
                            onClick={ onClose }
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        { BodyComponent }
                    </div>
                    { ModalFooter(onClose, onConfirm) }
                </div>
            </div>
        </div>
    );
}

/*
 * Return the modal footer that contains confirm and cancel buttons.
 */
function ModalFooter(onClose, onConfirm = null) {
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
