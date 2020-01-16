import * as React from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import Form from 'react-bootstrap/Form';
import { DetailsModel } from '../../reducers/detail';


export default () => {
    const formikContett = useFormikContext();
    const detailsModel = (formikContett.values as DetailsModel);
    return (
        <div>
            {/* title */}
            <Form.Group controlId="title">
                <Form.Label><strong>Title:</strong></Form.Label>
                <Field type="text" name="title" className="form-control" value={ undefined } defaultValue={ detailsModel.title } />
                <ErrorMessage name="title">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </Form.Group>

            {/* description */}
            <Form.Group controlId="description">
                <Form.Label><strong>Description:</strong></Form.Label>
                <Field type="text" name="description" as="textarea" rows="3" className="form-control" value={ undefined } defaultValue={ detailsModel.description } />
                <ErrorMessage name="description">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </Form.Group>

            {/* transcript */}
            <Form.Group controlId="transcript">
                <Form.Label><strong>Transcript:</strong></Form.Label>
                <Field type="text" name="transcript" as="textarea" rows="3" className="form-control" value={ undefined } defaultValue={ detailsModel.transcript } />
                <ErrorMessage name="transcript">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </Form.Group>

            {/* tags */}
            <div className="form-group">
                <label htmlFor="detail-editor-tags"><strong>Tags:</strong></label>
                <Field type="text" name="tags" className="form-control" value={ undefined } defaultValue={ detailsModel.tags } />
                <small className="form-text text-muted">Tags are short, comma-separated keywords.</small>
                <ErrorMessage name="tags">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </div>

            {/* isConfidential */}
            <Form.Group controlId="isConfidential">
                <Form.Label><strong>Confidential:</strong></Form.Label>
                <Field as="select" name="isConfidential" className="form-control" value={ undefined } defaultValue={ typeof detailsModel.isConfidential === 'boolean' ? String(detailsModel.isConfidential) : '' }>
                    <option value="">Unknown</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </Field>
                <ErrorMessage name="isConfidential">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </Form.Group>

            {/* canLicense */}
            <Form.Group controlId="canLicense">
                <Form.Label><strong>Licensable:</strong></Form.Label>
                <Field as="select" name="canLicense" className="form-control" value={ undefined } defaultValue={ typeof detailsModel.canLicense === 'boolean' ? String(detailsModel.canLicense) : '' }>
                    <option value="">Unknown</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </Field>
                <ErrorMessage name="canLicense">
                    { errorMessage => <div className="alert alert-danger" role="alert">{ errorMessage }</div> }
                </ErrorMessage>
            </Form.Group>
        </div>
    );
};
