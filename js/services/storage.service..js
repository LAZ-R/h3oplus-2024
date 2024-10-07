import { APP_LOCAL_STORAGE_ID } from "../../app-properties.js";
import { getLatestSong } from "./songs.service.js";

const STORAGE = localStorage;
const appLocalStorageId = APP_LOCAL_STORAGE_ID;

export const setStorage = () => {
  if (STORAGE.getItem(`${appLocalStorageId}FirstTime`) === null) {
    STORAGE.setItem(`${appLocalStorageId}FirstTime`, '0');
    
    let userTMP = {
      currentContext: 'allSongs',
      lastPlayedSongId: getLatestSong().id,
      lastPlayedSongElapsedTime: 0,
      isRepeatActive: false,
      favorits: [],
    };
    STORAGE.setItem(`${appLocalStorageId}User`, JSON.stringify(userTMP));
  }
}

export const getUser = () => {
  return JSON.parse(STORAGE.getItem(`${appLocalStorageId}User`));
}
export const setUser = (user) => {
  STORAGE.setItem(`${appLocalStorageId}User`, JSON.stringify(user));
}