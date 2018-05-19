//-----------------------------------------
//
// All local storage db methods
//
//-----------------------------------------

import localForage from 'localforage';
import { isSameDay } from 'date-fns';

//-----------------------------------------
// Save new visit
//
export const saveVisit = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // see when user last visited
      const d = await localForage.getItem('ds_visits');

      // if user never visited, record timestamp
      if (!d) {
        await localForage.setItem('ds_visits', [new Date()]);
        // otherwise
      } else {
        //get last item from array
        const lastVisit = d[d.length - 1];

        // if last visit is today, do nothing
        if (isSameDay(new Date(), lastVisit)) {
          resolve();
        }
        // otherwise, record timestamp
        else {
          const newDates = d.concat(new Date());
          await localForage.setItem('ds_visits', newDates);
          resolve();
        }
      }
    } catch (err) {
      reject(err);
    }
  });
};

//-----------------------------------------
// Get last visit
//
export const getLastVisit = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const val = await localForage.getItem('ds_visits');
      if (val.length) {
        return resolve(val[val.length - 1]);
      }

      return resolve();
    } catch (err) {
      reject(err);
    }
  });
};

//-----------------------------------------
// Get completed items
//
export const getCompletedItems = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const val = await localForage.getItem('ds_tracks');
      if (val) {
        return resolve(val);
      }

      try {
        await localForage.setItem('ds_tracks', []);
        resolve();
      } catch (err) {
        console.error('Error setting empty array on local storage', err);
        resolve();
      }
    } catch (err) {
      reject(err);
    }
  });
};

export const saveCompletedItem = name => {
  return new Promise(async (resolve, reject) => {
    try {
      const items = await localForage.getItem('ds_tracks');

      await localForage.setItem('ds_tracks', items.concat(name));
      resolve();
    } catch (err) {
      console.error('Error saving completed item', err);
      reject(err);
    }
  });
};