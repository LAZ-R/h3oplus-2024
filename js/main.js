import { requestWakeLock } from "./utils/wakelock.js";
import { APP_NAME, APP_VERSION } from "../app-properties.js";
import { bpmToMillisecondsPerBeat, getRandomIntegerBetween, setFavicon, setHTMLTitle } from "./utils/UTILS.js";
import { getSvgIcon } from "./services/icons.service.js";
import { getAllSongsCardsIhm, getLatestSong, getSongById, getSongCardIhm, setSongPlayingFooterIhm, setSongPlayingSectionIhm, setSongFooterCoverIhm, isSongLiked, getLikesPlaylist, getLikesCardsIhm } from "./services/songs.service.js";
import { nuwa, SONGS } from "./data/songs.data.js";
import { isLaptop, isPhone, isTablet } from "./utils/breakpoints.js";
import { getUser, setStorage, setUser } from "./services/storage.service..js";

/* ########################################################### */
/* VARIABLES */
/* ########################################################### */
//const HEADER = document.getElementById('header');
const MAIN = document.getElementById('main');
const DISCOGRAPHY_SECTION = document.getElementById('discographySection');
const PLAYING_SECTION = document.getElementById('playingSection');
const LIKES_SECTION = document.getElementById('likesSection');
const FOOTER = document.getElementById('footer');
const PLAYING_FOOTER = document.getElementById('playingFooter');

const nuwaColor = getComputedStyle(document.documentElement).getPropertyValue('--color--nuwa');
const qargoColor = getComputedStyle(document.documentElement).getPropertyValue('--color--qargo');

/* ########################################################### */
/* FUNCTIONS */
/* ########################################################### */

/* ----------------------------------------------------------- */
/* IHM */
/* ----------------------------------------------------------- */

const showSection = (sectionName) => {
  document.getElementById(`${sectionName}Icon`).classList.replace('inactive', 'active');
  document.getElementById(`${sectionName}Section`).classList.replace('inactive', 'active');
}
const hideSection = (sectionName) => {
  document.getElementById(`${sectionName}Icon`).classList.replace('active', 'inactive');
  document.getElementById(`${sectionName}Section`).classList.replace('active', 'inactive'); 
}

const showPlayingFooter = () => {
  document.documentElement.style.setProperty('--height--playing-footer', `var(--height--playing-footer--${isPhone ? 'phone' : isTablet ? 'tablet' : isLaptop ? 'laptop' : 'desktop'})`);
  document.documentElement.style.setProperty('--height--main', `var(--height--main--${isPhone ? 'phone' : isTablet ? 'tablet' : isLaptop ? 'laptop' : 'desktop'})`);
}
const hidePlayingFooter = () => {
  document.documentElement.style.setProperty('--height--playing-footer', `0px`);
}

const showLoaders = () => {
  let elements = document.getElementsByClassName('loader-container');
  if (elements.length != 0) {
    for (let element of elements) {
      if (element.classList.contains('song-card-loader')) {
        if (element.classList.contains(`song-${CURRENT_PLAYING_SONG.id}`)) {
          element.classList.replace('inactive', 'active');
        }
      } else {
        element.classList.replace('inactive', 'active');
      }
    }
  }
}
const hideLoaders = () => {
  let elements = document.getElementsByClassName('loader-container');
  if (elements.length != 0) {
    for (let element of elements) {
      element.classList.replace('active', 'inactive')
    }
  }
}

const turnAnimationsOn = () => {
  let millisecondsPerBeat = bpmToMillisecondsPerBeat(CURRENT_PLAYING_SONG.bpm);
  //console.log(millisecondsPerBeat / 1000);
  document.documentElement.style.setProperty('--pulse-animation-timing', `${millisecondsPerBeat / 1000}s`);
  
  let newElements = document.getElementsByClassName(`pulsor`);
  if (newElements.length != 0) {
    for (let element of newElements) {
      element.style.animation = 'pulsorAnimation var(--pulse-animation-timing) infinite linear';
    }
  }

  let newElements2 = document.getElementsByClassName(`mb-container-${CURRENT_PLAYING_SONG.id}`);
  if (newElements2.length != 0) {
    for (let element of newElements2) {
      element.classList.replace('inactive', 'active');
    }
  }
}
const turnAnimationsOff = () => {
  let pulsorElements = document.getElementsByClassName(`pulsor`);
  if (pulsorElements.length != 0) {
    for (let element of pulsorElements) {
      element.style.animation = 'none';
    }
  }
  
  let oldElements = document.getElementsByClassName(`moving-bars-container`);
  if (oldElements.length != 0) {
    for (let element of oldElements) {
      element.classList.replace('active', 'inactive');
    }
  } 
} 

const refreshTimingRelatedIhm = () => {
  // Progress bar -----------------
  let playingFooterProgressBar = document.getElementById('playingFooterProgressBar');

  let totalTime = wavesurfer.getDuration();
  let elapsedTime = wavesurfer.getCurrentTime();
  let percentage = (elapsedTime / totalTime) * 100;

  if (isCurrentlyPlaying) {
    playingFooterProgressBar.style.width = `${percentage}%`;
    playingFooterProgressBar.style.backgroundColor = CURRENT_PLAYING_SONG.artist == nuwa ? nuwaColor : qargoColor;

    let user = getUser();
    user.lastPlayedSongElapsedTime = elapsedTime;
    setUser(user);
  } else {
    playingFooterProgressBar.style.width = `${percentage}%`;
    playingFooterProgressBar.style.backgroundColor = 'var(--color--bg-50)';
  }

  // Elapsed time ----------------
  const lenghtToString = (lenght) => {
    let sec_num = parseInt(lenght, 10); // don't forget the second param
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
  }

  document.getElementById('elapsedTime').innerHTML = lenghtToString(elapsedTime);
  document.getElementById('totalTime').innerHTML = lenghtToString(totalTime);

}

const refreshRepeatColor = () => {
  if (IS_REPEAT_ACTIVE) {
    if (CURRENT_PLAYING_SONG.artist == nuwa) {
      document.getElementById('repeatButton').classList.remove('inactive');
      document.getElementById('repeatButton').classList.remove('active-qargo');
      document.getElementById('repeatButton').classList.add('active-nuwa');
    } else {
      document.getElementById('repeatButton').classList.remove('inactive');
      document.getElementById('repeatButton').classList.remove('active-nuwa');
      document.getElementById('repeatButton').classList.add('active-qargo');
    }
  } else {
    document.getElementById('repeatButton').classList.add('inactive');
      document.getElementById('repeatButton').classList.remove('active-qargo');
      document.getElementById('repeatButton').classList.remove('active-nuwa');
  }
}

/* ----------------------------------------------------------- */
/* SONGS */
/* ----------------------------------------------------------- */

export const getPlaylist = (context) => {
  CURRENT_CONTEXT = context;
  switch (context) {
    case 'latest':
      return SONGS;
    case 'allSongs':
      return SONGS;
    case 'likes':
      return LIKES_PLAYLIST;
    default:
      return SONGS;
  }
}

const playCurrentSong = () => {
  // lecture en cours
  turnAnimationsOff();
  setHTMLTitle(`${APP_NAME}`);
  setFavicon('favicon.ico');

  // Préparation du loading
  setSongPlayingFooterIhm(CURRENT_PLAYING_SONG);
  setSongPlayingSectionIhm(CURRENT_PLAYING_SONG);
  setSongFooterCoverIhm(CURRENT_PLAYING_SONG);
  refreshRepeatColor();
  document.getElementById('playingFooterPlayPauseButton').innerHTML = ``;
  document.getElementById('playingSectionPlayPauseButton').innerHTML = `${getSvgIcon('play', 'icon-m icon-fg-0')}`;
  showLoaders();

  document.getElementById('waveform').innerHTML = '';
  wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#808080', // bg
    progressColor: CURRENT_PLAYING_SONG.artist == nuwa ? nuwaColor : qargoColor,
    //barWidth: .1,
    cursorColor: 'red',
    dragToSeek: true,
    cursorWidth: 0,
    barGap: 0,
    height: 'auto',
  });
  wavesurfer.load(CURRENT_PLAYING_SONG.audioSrc);

  // Après loading
  wavesurfer.on('ready', function () {
      let totalTime = Math.round(wavesurfer.getDuration());
      //console.log(totalTime)
      //totalTime = lenghtToString(totalTime);
      //totalTimeDisplay.innerText = totalTime;
      isCurrentlyPlaying = true;
      document.getElementById('playingFooterPlayPauseButton').innerHTML = `${getSvgIcon('pause', 'icon-s icon-fg-0')}`;
      document.getElementById('playingSectionPlayPauseButton').innerHTML = `${getSvgIcon('pause', 'icon-m icon-fg-0')}`;
      turnAnimationsOn();
      hideLoaders();
      if (isFirstPlay) {
        isFirstPlay = false;
        wavesurfer.setTime(getUser().lastPlayedSongElapsedTime);
        wavesurfer.play();
        onPlayPauseButtonClick();
      } else {
        wavesurfer.play();
        setHTMLTitle(`${CURRENT_PLAYING_SONG.artist} - ${CURRENT_PLAYING_SONG.name}`);
        setFavicon(CURRENT_PLAYING_SONG.coverSrc);
      }
  });

  wavesurfer.on('finish', function () {
    if (IS_REPEAT_ACTIVE) {
      playCurrentSong();
    } else {
      goToNextTrack();
    }
  });
}

const setCurrentPlayingSong = (song) => {
  CURRENT_PLAYING_SONG = song;
  let user = getUser();
  user.lastPlayedSongId = song.id;
  setUser(user);
}

const setUserCurrentParameters = () => {
  let user = getUser();

  CURRENT_CONTEXT = user.currentContext;
  //console.log(CURRENT_CONTEXT);
  CURRENT_PLAYLIST = getPlaylist(CURRENT_CONTEXT);
  CURRENT_PLAYING_SONG = getSongById(user.lastPlayedSongId);
  IS_REPEAT_ACTIVE = user.isRepeatActive;
}

/* ########################################################### */
/* USER INTERACTIONS */
/* ########################################################### */

const onSectionButtonClick = (sectionName) => {
  switch (sectionName) {
    case 'discography':
      showSection('discography');
      hideSection('playing');
      hideSection('likes');
      showPlayingFooter();
      break;
    case 'playing':
      hideSection('discography');
      showSection('playing');
      hideSection('likes');
      hidePlayingFooter();
      break;
    case 'likes':
      hideSection('discography');
      hideSection('playing');
      showSection('likes');
      showPlayingFooter();
      break;
    default:
      break;
  }
}
window.onSectionButtonClick = onSectionButtonClick;

const onPlayPauseButtonClick = () => {
  let playingFooterPlayPauseButton = document.getElementById('playingFooterPlayPauseButton');
  let playingSectionPlayPauseButton = document.getElementById('playingSectionPlayPauseButton');
  isCurrentlyPlaying = !isCurrentlyPlaying;
  if (isCurrentlyPlaying) {
    if (wavesurfer.getCurrentTime() != 0) {
      wavesurfer.play();
      setHTMLTitle(`${CURRENT_PLAYING_SONG.artist} - ${CURRENT_PLAYING_SONG.name}`);
      setFavicon(CURRENT_PLAYING_SONG.coverSrc);
      turnAnimationsOn();
      playingFooterPlayPauseButton.innerHTML = `${getSvgIcon('pause', 'icon-s icon-fg-0')}`;
      playingSectionPlayPauseButton.innerHTML = `${getSvgIcon('pause', 'icon-m icon-fg-0')}`;
    } else {
      playCurrentSong();
    }
  } else {
    wavesurfer.pause();
    turnAnimationsOff();
    setHTMLTitle(`${APP_NAME}`);
    setFavicon('favicon.ico');
    playingFooterPlayPauseButton.innerHTML = `${getSvgIcon('play', 'icon-s icon-fg-0')}`;
    playingSectionPlayPauseButton.innerHTML = `${getSvgIcon('play', 'icon-m icon-fg-0')}`;
  }
}
window.onPlayPauseButtonClick = onPlayPauseButtonClick;

export const onSongCardClick = (songId, context) => {
  CURRENT_PLAYLIST = getPlaylist(context);
  //console.log(CURRENT_CONTEXT);
  //console.log(CURRENT_PLAYLIST);
  CURRENT_CONTEXT = context;
  let user = getUser();
  user.currentContext = CURRENT_CONTEXT;
  setUser(user);
  if (songId == CURRENT_PLAYING_SONG.id) {
    if (isCurrentlyPlaying) {
      onSectionButtonClick('playing')
    } else {
      playCurrentSong(); // TODO à revoir, parce que du coup ça relance
    }
  }
  if (isCurrentlyPlaying && CURRENT_PLAYING_SONG.id !== songId) {
    wavesurfer.pause();
  }
  if (CURRENT_PLAYING_SONG == null || CURRENT_PLAYING_SONG.id !== songId) {
    const song = getSongById(songId);
    setCurrentPlayingSong(CURRENT_PLAYLIST[CURRENT_PLAYLIST.indexOf(song)]);
    //console.table(CURRENT_PLAYING_SONG);

    showPlayingFooter();
    playCurrentSong();
    //onSectionButtonClick('playing');
  }
}
window.onSongCardClick = onSongCardClick;

const goToNextTrack = () => {
  let currentIndex = CURRENT_PLAYLIST.indexOf(CURRENT_PLAYING_SONG);
  let newIndex = 0;
  if (currentIndex == CURRENT_PLAYLIST.length -1) {
    newIndex = 0;
  } else {
    newIndex = currentIndex + 1;
  }
  setCurrentPlayingSong(CURRENT_PLAYLIST[newIndex]);

  playCurrentSong();
}
window.goToNextTrack = goToNextTrack;

const goToPreviousTrack = () => {
  let currentIndex = CURRENT_PLAYLIST.indexOf(CURRENT_PLAYING_SONG);
  let newIndex = 0;
  if (currentIndex == 0) {
    newIndex = CURRENT_PLAYLIST.length -1;
  } else {
    newIndex = currentIndex - 1;
  }
  setCurrentPlayingSong(CURRENT_PLAYLIST[newIndex]);

  playCurrentSong();
}
window.goToPreviousTrack = goToPreviousTrack;

const onPlayingSectionCoverClick = () => {
  switch (CURRENT_CONTEXT) {
    case 'allSongs':
      onSectionButtonClick('discography');
      break;
    case 'latest':
      onSectionButtonClick('discography');
      break;
    case 'likes':
      onSectionButtonClick('likes');
      break;
    default:
      break;
  }
}
window.onPlayingSectionCoverClick = onPlayingSectionCoverClick;

const onRepeatClick = () => {
  let button = document.getElementById('repeatButton');
  IS_REPEAT_ACTIVE = !IS_REPEAT_ACTIVE;
  if (IS_REPEAT_ACTIVE) {
    button.classList.remove('inactive');
    button.classList.add(CURRENT_PLAYING_SONG.artist == nuwa ? 'active-nuwa' : 'active-qargo');
  } else {
    button.classList.remove('active-nuwa');
    button.classList.remove('active-qargo');
    button.classList.add('inactive');
  }
}
window.onRepeatClick = onRepeatClick;

const onLikeButtonClick = (songId = CURRENT_PLAYING_SONG.id) => {
  //console.log(songId);
  let song = getSongById(songId);
  let songCardsButtons = document.getElementsByClassName(`like-${songId}`);
  //console.log(songCardsButtons);
  if (isSongLiked(songId)) {
    // Handle dislike
    for (let button of songCardsButtons) {
      button.classList.remove(song.artist == nuwa ? 'active-nuwa' : 'active-qargo');
      button.classList.add('inactive');
      button.innerHTML = `${getSvgIcon('heart-empty', 'icon-s')}`;
    }
    if (CURRENT_PLAYING_SONG.id == songId) {
      document.getElementById('playingSectionLikeButton').classList.add('inactive');
      document.getElementById('playingSectionLikeButton').classList.remove('active-nuwa');
      document.getElementById('playingSectionLikeButton').classList.remove('active-qargo');
      document.getElementById('playingSectionLikeButton').innerHTML = `
        ${getSvgIcon('heart-empty', 'icon-s')}
      `;
    }
    
    let user = getUser();
    let index = user.favorits.indexOf(songId);
    user.favorits.splice(index, 1);
    setUser(user);
  } else {
    // Handle like
    for (let button of songCardsButtons) {
      button.classList.remove('inactive');
      button.classList.add(song.artist == nuwa ? 'active-nuwa' : 'active-qargo');
      button.innerHTML = `${getSvgIcon('heart', 'icon-s')}`;
    }
    if (CURRENT_PLAYING_SONG.id == songId) {
      document.getElementById('playingSectionLikeButton').classList.remove('inactive');
      document.getElementById('playingSectionLikeButton').classList.add(song.artist == nuwa ? 'active-nuwa' : 'active-qargo');
      document.getElementById('playingSectionLikeButton').innerHTML = `
        ${getSvgIcon('heart', 'icon-s')}
      `;
    }
    let user = getUser();
    user.favorits.push(songId);
    setUser(user);
  }
  LIKES_PLAYLIST = getLikesPlaylist().reverse();
  LIKES_SECTION.innerHTML = `
  <h1>Favoris</h1>
  ${getLikesCardsIhm(LIKES_PLAYLIST)}
  `;
}
window.onLikeButtonClick = onLikeButtonClick;
/* ########################################################### */
/* DOM INITIALIZATION */
/* ########################################################### */
// Keep screen awake
//requestWakeLock();
setStorage();
let LIKES_PLAYLIST = getLikesPlaylist().reverse();
setHTMLTitle(APP_NAME);

DISCOGRAPHY_SECTION.innerHTML = `
  <div class="main-logo"></div>
  <!-- <span class="logo-text">THE H<sup>3</sup>O<sub>+</sub> PROJECT</span> -->
  <!-- <h1>Discographie</h1> -->
  <h1>Dernier titre</h1>
  <div class="songs-list-container">
    ${getSongCardIhm(getLatestSong(), 'latest')}
  </div>
  <br>
  <h1>Tous les titres</h1>
  ${getAllSongsCardsIhm()}
`;

PLAYING_SECTION.innerHTML = `
  <div id="playingSectionCover" class="cover" onclick="onPlayingSectionCoverClick()"></div>
  <div class="song-infos">
    <span id="playingSectionSongName">Song name</span>
    <span id="playingSectionArtistName">Artist name</span>
  </div>
  <div class="controls-container">
  <button id="repeatButton" class="repeat inactive" onclick="onRepeatClick()" style="margin-right: auto;">
    ${getSvgIcon('arrows-rotate', 'icon-s icon-fg-0')}
  </button>
  <button onclick="goToPreviousTrack()">
    ${getSvgIcon('backward-step', 'icon-s icon-fg-0')}
  </button>
  <button id="playingSectionPlayPauseButton" onclick="onPlayPauseButtonClick()">
    ${getSvgIcon('play', 'icon-m icon-fg-0')}
  </button>
  <button onclick="goToNextTrack()">
    ${getSvgIcon('forward-step', 'icon-s icon-fg-0')}
  </button>
  <button id="playingSectionLikeButton" onclick="onLikeButtonClick()" style="margin-left: auto;" class="is-liked-playing inactive">
    ${getSvgIcon('heart-empty', 'icon-s icon-fg-0')}
  </button>
  </div>
  <div class="waveform-container">
    <div class="timer-container">
      <span id="elapsedTime">00:00:00</span>
      <span id="totalTime">00:00:00</span>
    </div>
    <div id="waveform"></div>
  </div>

  <div class="loader-container inactive">
    <div class="loader full-page">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
  </div>
`;

LIKES_SECTION.innerHTML = `
  <h1>Favoris</h1>
  ${getLikesCardsIhm(LIKES_PLAYLIST)}
`;

PLAYING_FOOTER.innerHTML = `
  <div class="main-part">
    <div id="playingFooterCover" class="cover"></div>
    <button onclick="onSectionButtonClick('playing')" class="song-infos">
      <span id="playingFooterSongName">Song name</span>
      <span id="playingFooterArtistName">Artist name</span>
    </button>
    <button id="playingFooterPlayPauseButton" onclick="onPlayPauseButtonClick()" class="play-pause-button">${getSvgIcon('play', 'icon-s icon-fg-0')}</button>
  </div>
  <div class="progress-bar-container">
    <div id="playingFooterProgressBar" class="progress-bar nuwa"></div>
  </div>
  <div class="loader-container playing-footer-loader inactive">
    <div class="loader">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
  </div>
`;

FOOTER.innerHTML = `
  <button onclick="onSectionButtonClick('discography')">
    ${getSvgIcon('list', 'icon-s icon-fg-0 inactive', 'discographyIcon')}
  </button>
  <button onclick="onSectionButtonClick('playing')" style="position: relative; justify-content-center">
    <div id="playingIcon" class="inactive"></div>
  </button>
  <button onclick="onSectionButtonClick('likes')">
    ${getSvgIcon('heart', 'icon-s icon-fg-0 inactive', 'likesIcon')}
  </button>
`;

/* ########################################################### */
/* EXECUTION */
/* ########################################################### */

let isCurrentlyPlaying = false;

let wavesurfer = WaveSurfer.create({
  container: '#waveform',
  progressColor: nuwaColor,
  barWidth: 1
});

let CURRENT_CONTEXT = 'allSongs';
let CURRENT_PLAYLIST = SONGS;
let CURRENT_PLAYING_SONG = getLatestSong();
let IS_REPEAT_ACTIVE = false;
let isFirstPlay = true;

showSection('discography');
setUserCurrentParameters();
refreshRepeatColor();
setInterval(refreshTimingRelatedIhm, 100);

playCurrentSong();