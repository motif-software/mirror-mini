import { configureStore, ThunkAction, Action, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";

import { createActionSync } from "./middleware";
import textReducer from "../features/texteditor/textEditorSlice";
import { reducer as graphReducer } from "../features/model/modelSlice";
import { registry, canonicalTypes } from "../features/texteditor/textEditorSync";

const rootReducer = combineReducers({
  text: textReducer,
  graph: graphReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const actionSync = createActionSync(registry, canonicalTypes);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(actionSync),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
