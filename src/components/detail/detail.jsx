import React from 'react';


const EXAMPLE_DATA = {
    id: 'aaabbbccc',
    fileName: 'a_search_result.png',
    title: 'A Search Result',
    description: 'Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.',
    imgUrl: 'https://i.imgur.com/gn2JN3f.jpg',
    fileUrl: 'https://i.imgur.com/gn2JN3f.jpg',
    tags: ['lorem', 'ipsum', 'dolor'],
};


class ArchiveDetail extends React.Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.state = {
            isExpanded: false,
            fileInfo: EXAMPLE_DATA,
        };
    }

    render() {
        const fileInfo = this.state.fileInfo;
        const isExpanded = this.state.isExpanded;

        const fileName = fileInfo.fileName;
        const title = fileInfo.title || fileName;
        const description = fileInfo.description;
        const imgUrl = fileInfo.imgUrl;
        const fileUrl = fileInfo.fileUrl;
        const tags = fileInfo.tags || [];

        return (
            <div id="archive-detail">
                <div className="row">
                    {/* content */}
                    <div className={ `col-12 ${isExpanded || 'col-lg-6 order-lg-last'}` }>
                        <h2>{ title }</h2>
                        <p>{ description }</p>
                        <p><strong>Tags: </strong>{ tags.join(', ') }</p>
                    </div>
                    {/* img */}
                    <div className={ `col-12 ${isExpanded || 'col-lg-6'}` }>
                        <a href={ fileUrl } target="_blank">
                            <img src={ imgUrl } className="img-fluid border rounded" alt={this.state.title} />
                        </a>
                        <p>
                            <a href={ fileUrl } download={ fileName } target="_blank">Download</a>
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

    handleClick() {
        this.setState({ isExpanded: !this.state.isExpanded });
    }
}


export default ArchiveDetail;
