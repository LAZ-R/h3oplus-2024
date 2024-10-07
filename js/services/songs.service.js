import { nuwa, qargo, SONGS } from "../data/songs.data.js";
import { getSvgIcon } from "./icons.service.js";
import { getUser } from "./storage.service..js";

export const getSongById = (songId) => {
  const song = SONGS.filter((song) => song.id == Number(songId))[0];
  //console.log(song);
  return song;
}

export const getLikesPlaylist = () => {
  let playlist = [];
  let user = getUser();
  for (let likesSongId of user.favorits) {
    playlist.push(getSongById(likesSongId));
  }
  return playlist;
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

  if (isSongLiked(song.id)) {
    document.getElementById('playingSectionLikeButton').classList.remove('inactive');
    document.getElementById('playingSectionLikeButton').classList.remove('active-nuwa');
    document.getElementById('playingSectionLikeButton').classList.remove('active-qargo');
    document.getElementById('playingSectionLikeButton').classList.add(song.artist == nuwa ? 'active-nuwa' : 'active-qargo');
    document.getElementById('playingSectionLikeButton').innerHTML = `
      ${getSvgIcon('heart', 'icon-s')}
    `;

  } else {
    document.getElementById('playingSectionLikeButton').classList.add('inactive');
    document.getElementById('playingSectionLikeButton').classList.remove('active-nuwa');
    document.getElementById('playingSectionLikeButton').classList.remove('active-qargo');
    document.getElementById('playingSectionLikeButton').innerHTML = `
      ${getSvgIcon('heart-empty', 'icon-s')}
    `;
  }
}

export const setSongFooterCoverIhm = (song) => {
  document.getElementById('playingIcon').setAttribute('style', `background-image: url('${song.coverSrc}');`);
  document.getElementById('playingIcon').innerHTML = `
    <div class="moving-bars-container mb-container-${song.id} inactive" style="width: 24px; height: 24px;">
      <div class="pulsor"></div>
    </div>
    <div class="loader-container footer-loader inactive">
      <div class="loader">
        <div class="bounce1"></div>
        <div class="bounce2"></div>
        <div class="bounce3"></div>
      </div>
    </div>
  `;
}

export const isSongLiked = (songId) => {
  let isLiked = false;
  let user = getUser();
  for (let favorit of user.favorits) {
    if (favorit == songId) {
      isLiked = true;
    }
  }
  return isLiked;
}

export const getSongCardIhm = (song, context) => {
  ;
  return `
  <div class="song-card context-${context}">
    <button onclick="onSongCardClick(${song.id}, '${context}')" class="cover" style="background-image: url('${song.coverSrc}')">
      <div class="moving-bars-container mb-container-${song.id} inactive">
        <div class="pulsor"></div>
      </div>
      <div class="loader-container song-card-loader song-${song.id} inactive">
        <div class="loader">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
      </div>
    </button>
    <button onclick="onSongCardClick(${song.id}, '${context}')" class="song-infos">
      <span>${song.name}</span>
      <span>${song.artist}</span>
    </button>
    <button onclick="onLikeButtonClick(${song.id})" class="is-liked like-${song.id} ${!isSongLiked(song.id) ? 'inactive' : song.artist == nuwa ? 'active-nuwa' : 'active-qargo' }">
      ${getSvgIcon(isSongLiked(song.id) ? 'heart' : 'heart-empty', 'icon-s')}
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

export const getLikesCardsIhm = (likesPlaylist) => {
  let str = '<div class="songs-list-container">';
  if (likesPlaylist.length != 0) {
    for (let song of likesPlaylist) {
      str += `${getSongCardIhm(song, 'likes')}`;
    }
  } else {
    str += `<span style="margin: 0 auto; color: var(--color--fg-30);">Vous n'avez aucun favoris</span>`;
  }
  str += '</div>'
  return str;
}