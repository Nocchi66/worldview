import {
  CHANGE_TIME_SCALE,
  CHANGE_CUSTOM_INTERVAL,
  CHANGE_INTERVAL,
  SELECT_DATE,
  UPDATE_APP_NOW,
  TOGGLE_CUSTOM_MODAL,
  INIT_SECOND_DATE,
  ARROW_DOWN,
  ARROW_UP,
  SET_PRELOAD,
} from './constants';
import { getSelectedDate } from './selectors';
import { getMaxActiveLayersDate } from './util';

export function triggerTodayButton() {
  return (dispatch, getState) => {
    const state = getState();
    const {
      date,
      compare,
    } = state;
    const activeString = compare.isCompareA ? 'selected' : 'selectedB';
    const selectedDate = getSelectedDate(state, activeString);
    const { appNow } = date;

    const selectedDateTime = selectedDate.getTime();
    const appNowTime = appNow.getTime();
    if (selectedDateTime !== appNowTime) {
      dispatch({
        type: SELECT_DATE,
        activeString,
        value: appNow,
      });
    }
  };
}

export function changeTimeScale(num) {
  return {
    type: CHANGE_TIME_SCALE,
    value: num,
  };
}
export function updateAppNow(date) {
  return {
    type: UPDATE_APP_NOW,
    value: date,
  };
}
export function initSecondDate() {
  return {
    type: INIT_SECOND_DATE,
  };
}
export function selectDate(value) {
  return (dispatch, getState) => {
    const state = getState();
    const {
      compare,
    } = state;
    const activeString = compare.isCompareA ? 'selected' : 'selectedB';
    const maxDate = getMaxActiveLayersDate(state);
    const selectedDate = value > maxDate
      ? maxDate
      : value;

    dispatch({
      type: SELECT_DATE,
      activeString,
      value: selectedDate,
    });
  };
}
export function changeCustomInterval(delta, customInterval) {
  return {
    type: CHANGE_CUSTOM_INTERVAL,
    value: customInterval,
    delta,
  };
}
export function selectInterval(delta, interval, customSelected) {
  return {
    type: CHANGE_INTERVAL,
    value: interval,
    delta,
    customSelected,
  };
}
export function toggleCustomModal(open, toggleBy) {
  return {
    type: TOGGLE_CUSTOM_MODAL,
    value: open,
    toggleBy,
  };
}
export function setArrowDown (value) {
  return {
    type: ARROW_DOWN,
    value,
  };
}
export function setArrowUp () {
  return {
    type: ARROW_UP,
  };
}
export function setPreload (preloaded, lastPreloadDate) {
  return {
    type: SET_PRELOAD,
    preloaded,
    lastPreloadDate,
  };
}
