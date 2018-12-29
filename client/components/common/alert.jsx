import React from 'react'; // eslint-disable-line no-unused-vars

const ALERT_STYLES = {
    DANGER: 'danger',
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
};


export default (message, style = ALERT_STYLES.DANGER) => {
    if (!Object.values(ALERT_STYLES).includes(style)) {
        throw new Error(`Alert created with invalid style argument "${style}".`);
    }
    return (
        <div id="archive-alert" className={`alert alert-${style}`} role="alert" key={message}>
            { message }
        </div>
    );
};
