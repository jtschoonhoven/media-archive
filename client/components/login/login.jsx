import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik'; // eslint-disable-line no-unused-vars
import { history as backboneHistory } from 'backbone';


class ArchiveLogin extends React.Component {
    render() {
        return (
            <div id="archive-login" className="jumbotron">
                <h1 className="display-4">Please log in</h1>
                <p className="lead">
                    Sign in with your <a href="#">@leakeyfoundation.org</a> Google Apps account to access the Archive.
                </p>
                <hr className="my-4" />
                <div className="form-group">
                    <button className="btn btn-lg btn-primary">
                        Sign in with Google Apps
                    </button>
                </div>
                {/*
                <Formik
                    initialValues={{ email: '', password: '' }}
                    onSubmit={this.handleSubmit}
                    render={this.renderLoginForm}
                />
                */}
            </div>
        );
    }

    handleSubmit(values, actions) { // eslint-disable-line no-unused-vars
        backboneHistory.navigate('/search', { trigger: true });
    }

    // renderLoginForm({ isSubmitting }) {
    //     return (
    //         <Form id="archive-login-form">
    //             {/* email */}
    //             <div className="form-group">
    //                 <label htmlFor="archive-login-email">Email address</label>
    //                 <Field
    //                     id="archive-login-email"
    //                     type="email" name="email"
    //                     className="form-control"
    //                     placeholder="Your email"
    //                     autoComplete="email"
    //                 />
    //                 <ErrorMessage name="email" component="div" />
    //             </div>
    //             {/* password */}
    //             <div className="form-group">
    //                 <label htmlFor="archive-login-password">Password</label>
    //                 <Field
    //                     id="archive-login-password"
    //                     type="password"
    //                     name="password"
    //                     className="form-control"
    //                     autoComplete="current-password"
    //                 />
    //                 <ErrorMessage name="password" component="div" />
    //             </div>
    //             <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
    //                 Submit
    //             </button>
    //         </Form>
    //     );
    // }
}


export default ArchiveLogin;
