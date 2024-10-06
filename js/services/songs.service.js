import { nuwa, qargo, SONGS } from "../data/songs.data.js";
import { getSvgIcon } from "./icons.service.js";



export const getSongById = (songId) => {
  const song = SONGS.filter((song) => song.id == Number(songId))[0];
  //console.log(song);
  return song;
}
 
export const getLatestSong = () => {
  return SONGS[0];
}

export const setSongPlayingFooterIhm = (song) => {
  document.getElementById('playingFooterProgressBar').style.width = '0%';
  document.getElementById('playingFooterCover').setAttribute('style', `background-image: url('${song.coverSrc}');`);
  document.getElementById('playingFooterSongName').innerHTML = `${song.name}`;
  document.getElementById('playingFooterArtistName').innerHTML = `${song.artist}`;
  switch (song.artist) {
    case nuwa:
      document.getElementById('playingFooterProgressBar').classList.replace('qargo', 'nuwa');
      break;
    case qargo:
      document.getElementById('playingFooterProgressBar').classList.replace('nuwa', 'qargo');
      break;
    default:
      break;
  }
}

export const setSongPlayingSectionIhm = (song) => {
  document.getElementById('playingSectionCover').setAttribute('style', `background-image: url('${song.coverSrc}');`);
  document.getElementById('playingSectionSongName').innerHTML = `${song.name}`;
  document.getElementById('playingSectionArtistName').innerHTML = `${song.artist}`;
}

export const setSongFooterCoverIhm = (song) => {
  document.getElementById('playingIcon').setAttribute('style', `background-image: url('${song.coverSrc}');`);
  document.getElementById('playingIcon').innerHTML = `
    <div class="moving-bars-container mb-container-${song.id} inactive" style="width: 24px; height: 24px;">
      <div class="pulsor"></div>
    </div>
  `;
}

export const getSongCardIhm = (song, context) => {
  return `
  <div class="song-card">
    <button onclick="onSongCardClick(${song.id}, '${context}')" class="cover" style="background-image: url('${song.coverSrc}')">
      <div class="moving-bars-container mb-container-${song.id} inactive">
        <div class="pulsor"></div>
      </div>
    </button>
    <button onclick="onSongCardClick(${song.id}, '${context}')" class="song-infos">
      <span>${song.name}</span>
      <span>${song.artist}</span>
    </button>
    <button class="is-liked">
      ${getSvgIcon('heart-empty', 'icon-s icon-fg-0')}
    </button>
  </div>
  `;
}

export const getAllSongsCardsIhm = () => {
  let str = '<div class="songs-list-container">';
  
  for (let song of SONGS) {
    str += `${getSongCardIhm(song, 'allSongs')}`;
  }
  
  str += '</div>'
  return str;
}
