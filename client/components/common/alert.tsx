import * as React from 'react';
import Alert from 'react-bootstrap/Alert'

const ALERT_STYLES = {
    DANGER: 'danger',
    INFO: 'info',
    LIGHT: 'light',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    WARNING: 'warning',
};


export default (
    msg: string,
    { idx = -1, style = 'danger', centered = false, muted = false } = {},
) => {
    if (!Object.values(ALERT_STYLES).includes(style)) {
        throw new Error(`Alert created with invalid style argument "${style}".`);
    }
    return (
        <Alert
            id="archive-alert"
            // @ts-ignore: we independently validate the style above
            variant={ style }
            className={ `w-100 ${centered && 'text-center'} ${muted && 'text-muted'}` }
            key={ idx }
        >
            { msg }
        </Alert>
    );
};
