import React from 'react'; // eslint-disable-line no-unused-vars

const ALERT_STYLES = {
    DANGER: 'danger',
    INFO: 'info',
    LIGHT: 'light',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    WARNING: 'warning',
};


export default (msg, { idx = -1, style = 'danger', centered = false, muted = false } = {}) => {
    if (!Object.values(ALERT_STYLES).includes(style)) {
        throw new Error(`Alert created with invalid style argument "${style}".`);
    }
    return (
        <div
            id="archive-alert"
            className={`\
                w-100\
                alert\
                alert-${style}\
                ${centered ? 'text-center' : ''}\
                ${muted ? 'text-muted' : ''}\
            `}
            role="alert"
            key={idx}
        >
            { msg }
        </div>
    );
};
