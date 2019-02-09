import * as React from 'react';

import { MODAL_SHOW_CONFIRM, MODAL_SHOW_TEXT, MODAL_HIDE } from '../actions/modal';
import { Action } from '../types';

export const MODAL_TYPES = {
    CONFIRM: 'confirm',
    TEXT: 'text',
};

export interface ModalConfirm {
    type: string;
    title: string;
    message: React.ReactElement<any>;
    onClose: () => void;
    onConfirm: (string) => void;
}

export interface ModalTextModel {
    type: string;
    title: string;
    placeholder: string;
    message: React.ReactElement<any>;
    onClose: () => void;
    onConfirm: (string) => void;
    validator: (string) => void;
}

export type ModalModel = ModalConfirm | ModalTextModel;

export interface ModalState {
    modal?: ModalModel;
}

const INITIAL_STATE: ModalState = {
    modal: null,
};


export default function modalReducer(state = INITIAL_STATE, action: Action): ModalState {
    const payload = action.payload;

    switch (action.type) {
        case MODAL_SHOW_CONFIRM: {
            return Object.assign({}, state, payload);
        }

        case MODAL_SHOW_TEXT: {
            return Object.assign({}, state, payload);
        }

        case MODAL_HIDE: {
            return Object.assign({}, state, { modal: null });
        }

        default: {
            return state;
        }
    }
}
