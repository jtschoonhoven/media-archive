import * as React from 'react';
import { FormikValues } from 'formik';
import { Dispatch } from 'redux';

import { ModalConfirmConfig, ModalEditableConfig, ModalTextConfig, ModalInfoConfig } from '../reducers/modal';
import { Action } from '../types';

export const MODAL_SHOW_INFO = 'MODAL_SHOW_INFO';
export const MODAL_SHOW_CONFIRM = 'MODAL_SHOW_CONFIRM';
export const MODAL_SHOW_EDITABLE = 'MODAL_SHOW_EDITABLE';
export const MODAL_SHOW_TEXT = 'MODAL_SHOW_TEXT';
export const MODAL_HIDE = 'MODAL_HIDE';


/*
 * Display an informational modal with only a "close" button.
 */
export function showInfoModal(
    title: string,
    message: React.ReactElement<HTMLElement>,
    dispatch: Dispatch,
): Action {
    const modal: ModalInfoConfig = {
        title,
        message,
        type: 'info',
        onClose: () => dispatch(hideModal()),
    };
    return {
        type: MODAL_SHOW_INFO,
        payload: { modal },
    };
}

/*
 * Display a confirmation modal with an "OK" button.
 */
export function showConfirmModal(
    title: string,
    message: React.ReactElement<HTMLElement>,
    onConfirm: (string) => void,
    dispatch: Dispatch,
): Action {
    const modal: ModalConfirmConfig = {
        title,
        message,
        onConfirm,
        type: 'confirm',
        onClose: () => dispatch(hideModal()),
    };
    return {
        type: MODAL_SHOW_CONFIRM,
        payload: { modal },
    };
}

/*
 * Display a modal with one text input.
 */
export function showTextModal(
    title: string,
    message: React.ReactElement<HTMLElement> | string,
    placeholder: string,
    onConfirm: (string) => void,
    validator: (string) => void,
    dispatch: Dispatch,
): Action {
    const modal: ModalTextConfig = {
        title,
        message,
        placeholder,
        validator,
        onConfirm,
        type: 'text',
        onClose: () => dispatch(hideModal()),
    };
    return {
        type: MODAL_SHOW_TEXT,
        payload: { modal },
    };
}

export function showEditableModal(
    title: string,
    getFormikJsx: () => React.ReactElement<HTMLFormElement>,
    initialValues: FormikValues,
    validator: (values: FormikValues) => { [fieldName: string]: string },
    onConfirm: (FormikValues) => void,
    dispatch: Dispatch,
): Action {
    const type = 'editable';
    const modalEditableConfig: ModalEditableConfig = {
        type,
        title,
        getFormikJsx,
        initialValues,
        validator,
        onConfirm,
        onClose: () => dispatch(hideModal()),
    };
    return {
        type: MODAL_SHOW_EDITABLE,
        payload: { modal: modalEditableConfig },
    };
}

/*
 * Hide the current modal if exists.
 */
export function hideModal(): Action {
    return {
        type: MODAL_HIDE,
        payload: {},
    };
}
