const ELEMENT_SHIM = {
    setAttribute: () => undefined,
    appendChild: () => undefined,
};

const DOCUMENT_SHIM = {
    createElement: () => Object.assign({}, ELEMENT_SHIM),
    createTextNode: () => Object.assign({}, ELEMENT_SHIM),
    querySelector: () => Object.assign({}, ELEMENT_SHIM),
};

const WINDOW_SHIM = { document: DOCUMENT_SHIM };

(function ensureWindow() {
    if (typeof window === 'undefined') { // eslint-disable-line
        window = WINDOW_SHIM; // eslint-disable-line
    }
    if (typeof document === 'undefined') { // eslint-disable-line
        document = DOCUMENT_SHIM; // eslint-disable-line
    }
}());
