import * as React from 'react';
import { Form, Field, ErrorMessage } from 'formik';


export default () => {
    return (
        <Form>
            {/* title */}
            <div className="form-group">
                <label htmlFor="detail-editor-title"><strong>Title:</strong></label>
                <Field type="text" id="detail-editor-title" name="title" className="form-control" />
                <ErrorMessage name="title">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </div>

            {/* description */}
            <div className="form-group">
                <label htmlFor="detail-editor-description"><strong>Description:</strong></label>
                <Field type="text" id="detail-editor-description" name="description" className="form-control" />
                <ErrorMessage name="description">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </div>

            {/* tags */}
            <div className="form-group">
                <label htmlFor="detail-editor-description"><strong>Tags:</strong></label>
                <Field type="text" id="detail-editor-tags" name="tags" className="form-control" />
                <small className="form-text text-muted">Tags are short, comma-separated keywords.</small>
                <ErrorMessage name="tags">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </div>
        </Form>
    );
};
