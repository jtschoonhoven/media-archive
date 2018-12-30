import React from 'react'; // eslint-disable-line no-unused-vars

const ALERT_STYLES = {
    DANGER: 'danger',
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
};


export default (msg, idx, style = ALERT_STYLES.DANGER) => {
    if (!Object.values(ALERT_STYLES).includes(style)) {
        throw new Error(`Alert created with invalid style argument "${style}".`);
    }
    return (
        <div id="archive-alert" className={`alert alert-${style} w-100`} role="alert" key={idx}>
            { msg }
        </div>
    );
};
