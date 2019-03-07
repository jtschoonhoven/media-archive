import _ from 'lodash';

import { SEARCH_START, SEARCH_COMPLETE, SEARCH_RESET } from '../actions/search';

interface Filters {
    document?: number;
    image?: number;
    video?: number;
    audio?: number;
    nextKey?: string;
    prevKey?: string;
}

export class FiltersModel {
    constructor(
        public readonly document: number = 0,
        public readonly image: number = 0,
        public readonly video: number = 0,
        public readonly audio: number = 0,
        public readonly nextKey: string = null,
        public readonly prevKey: string = null,
    ) {}

    /*
     * Return a plain JS object containing only truthy values.
     */
    toFilteredObject(): Filters {
        const filters: Filters = {
            document: this.document,
            image: this.image,
            video: this.video,
            audio: this.audio,
            nextKey: this.nextKey,
            prevKey: this.prevKey,
        };
        const active = _.pickBy(filters, x => x);
        if (active.document && active.image && active.video && active.audio) {
            const { document, image, video, audio, ...rest } = active;
            return rest;
        }
        return active;
    }

    /*
     * Return a new FiltersModel that merges the current filters with those passed in.
     */
    update(newFilters: Filters): FiltersModel {
        const oldFilters = this.toFilteredObject();
        const updatedFilters = Object.assign(oldFilters, newFilters);
        return FiltersModel.fromObject(updatedFilters);
    }

    /*
     * Return a new FiltersModel from a plain object.
     */
    static fromObject({ document, image, video, audio, nextKey, prevKey }: Filters): FiltersModel {
        return new FiltersModel(document, image, video, audio, nextKey, prevKey);
    }
}

export interface SearchResult {
    readonly id: number;
    readonly name: string;
    readonly type: string;
    readonly description: string;
    readonly url: string;
    readonly thumbnailUrl: string;
    readonly extension: string;
    readonly relevance: number;
}

export interface SearchState {
    readonly errors: ReadonlyArray<string>;
    readonly searchTerm: string;
    readonly filters: FiltersModel;
    readonly results: ReadonlyArray<SearchResult>;
    readonly isFetching: boolean;
}

const INITIAL_STATE = {
    errors: [],
    searchTerm: '',
    filters: new FiltersModel(),
    results: [],
    isFetching: false,
};

export default function searchReducer(state = INITIAL_STATE, action): SearchState {
    const payload = action.payload;

    switch (action.type) {
        case SEARCH_START: {
            const update = {
                isFetching: true,
                filters: new FiltersModel(),
                results: [], // clear any results from previous search
                errors: [], // clear any errors from previous search
            };
            return Object.assign({}, state, update);
        }

        case SEARCH_COMPLETE: {
            if (action.error) {
                const update = {
                    isFetching: false,
                    errors: [action.payload.message],
                };
                return Object.assign({}, state, update);
            }
            const update = { isFetching: false };
            return Object.assign({}, state, payload, update);
        }

        case SEARCH_RESET: {
            return INITIAL_STATE;
        }

        default: {
            return state;
        }
    }
}
