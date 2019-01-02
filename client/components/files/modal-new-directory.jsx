import React from 'react'; // eslint-disable-line no-unused-vars
import urlJoin from 'url-join';

import { showModal } from '../common/modal.jsx';


export function showNewDirectoryModal(currentUrl, historyObj) {
    let dirname = '';
    const title = 'Create Folder';
    const onChange = (e) => {
        dirname = e.target.value;
    };
    const onSubmit = () => {
        const newUrl = urlJoin(currentUrl, dirname);
        historyObj.push(newUrl);
    };
    const body = (
        <div className="input-group">
            <input
                type="text"
                className="form-control"
                placeholder="Folder name"
                onChange={ onChange }
            />
        </div>
    );
    return showModal(title, body, onSubmit);
}
