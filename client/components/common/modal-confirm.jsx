import React from 'react'; // eslint-disable-line no-unused-vars

import { showModal } from './modal.jsx';


/*
 * Render a confirmation dialog with the given title and message.
 */
export function showConfirmModal(title, message, onConfirm = null) {
    const modalBody = <p>message</p>;
    return showModal(title, modalBody, onConfirm);
}
