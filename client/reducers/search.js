import { List, Map, Record } from 'immutable';

import { SEARCH_START, SEARCH_COMPLETE, SEARCH_RESET } from '../actions/search';

export class FiltersModel extends Record({
    document: 0,
    image: 0,
    video: 0,
    audio: 0,
    nextKey: null,
    prevKey: null,
}) {
    /*
     * Return a plain JS object containing only truthy values.
     */
    toFilteredObject() {
        const obj = Map(this).filter(val => !!val).toObject();
        if (obj.document && obj.image && obj.video && obj.audio) {
            const { document, image, video, audio, ...rest } = obj;
            return rest;
        }
        return obj;
    }
}

export class ResultModel extends Record({
    id: null,
    name: null,
    type: null,
    description: null,
    url: null,
    thumbnailUrl: null,
    extension: null,
    relevance: 0,
}) {}

export class SearchState extends Record({
    errors: List(),
    searchTerm: '',
    filters: new FiltersModel(),
    results: List(),
    isFetching: false,
}) {}

export default function searchReducer(state = new SearchState(), action) {
    const payload = action.payload;

    switch (action.type) {
        case SEARCH_START: {
            const update = Map({
                isFetching: true,
                filters: new FiltersModel(),
                results: List(), // clear any results from previous search
                errors: List(), // clear any errors from previous search
            });
            return state.merge(update, payload);
        }

        case SEARCH_COMPLETE: {
            if (action.error) {
                return state.merge({
                    isFetching: false,
                    errors: List([action.error]),
                });
            }
            const update = Map({ isFetching: false });
            return state.merge(update, payload);
        }

        case SEARCH_RESET: {
            return new SearchState();
        }

        default: {
            return state;
        }
    }
}
