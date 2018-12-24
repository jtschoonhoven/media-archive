import React from 'react';


class ArchiveDetail extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = { isExpanded: false };
    }

    componentDidMount() {
        this.fetchData();
    }

    render() {
        const isExpanded = this.state.isExpanded;
        const isFetching = this.props.isFetching;

        const details = this.props.details || {};
        const title = details.media_name;
        const description = details.media_description;
        const tags = details.media_tags;
        const url = details.media_url;
        const filename = details.media_file_name;

        // FIXME: better behavior while loading
        return (
            <div id="archive-detail">
                <div className="row">
                    {/* content */}
                    <div className={ `col-12 ${isExpanded || 'col-lg-6 order-lg-last'}` }>
                        <h2>{ isFetching ? 'loading...' : title }</h2>
                        <p>{ description }</p>
                        <p><strong>Tags: </strong>{ tags }</p>
                    </div>
                    {/* img */}
                    <div className={ `col-12 ${isExpanded || 'col-lg-6'}` }>
                        <a href={ url } target="_blank">
                            <img src={ url } className="img-fluid border rounded" alt={ title } />
                        </a>
                        <p>
                            <a href={ url } download={ filename } target="_blank">Download</a>
                            <span className="text-muted d-none d-lg-inline"> • </span>
                            <a href="#" onClick={ this.handleClick } className="d-none d-lg-inline">
                                { isExpanded ? 'View smaller' : 'View larger' }
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    getFileId() {
        const idStr = this.props.location.pathname.replace('/detail/', '');
        return parseInt(idStr, 10);
    }

    fetchData() {
        const fileId = this.getFileId();
        this.props.onGetFileDetail(fileId);
    }

    handleClick() {
        this.setState({ isExpanded: !this.state.isExpanded });
    }
}


export default ArchiveDetail;
