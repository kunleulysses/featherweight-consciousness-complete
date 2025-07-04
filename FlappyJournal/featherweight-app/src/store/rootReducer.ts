import { combineReducers } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import projectSlice from './slices/projectSlice';

export const rootReducer = combineReducers({
  auth: authSlice,
  project: projectSlice,
});
