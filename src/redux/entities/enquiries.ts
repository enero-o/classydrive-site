import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { produce } from 'immer';
import { combineEpics } from 'redux-observable';
import { ofType, catchError, switchMap, of } from 'storejars-react-toolkit/dist/operators';
import { Actions, entitiesMeta, entities, responder, metas } from 'storejars-react-toolkit';

import { api } from '../helpers';
import namespaces from '../namespaces';

export const action = new Actions(namespaces.ENQUIRIES);

export const selector = createSelector(entities, (state) => state.enquiries);
export const metaSelector = createSelector(entitiesMeta, (state) => state.enquiries);

export const reducer = handleActions(
  {
    [action.read.success]: (state, action$) =>
      produce(state, (draft) => {
        draft = action$.payload;
        return draft;
      }),
  },
  [],
);

export const metaReducer = metas(action);

function createEpic(action$) {
  return action$.pipe(
    ofType(action.create.loading),
    switchMap(({ payload }) => {
      return api.post$('/rent-requests', payload).pipe(
        switchMap(({ response }) => {
          return of(action.createAction(response.data).success);
        }),
        catchError(({ response }) => of(action.createAction(responder(response)).error)),
      );
    }),
  );
}

export const epic = combineEpics(createEpic);
