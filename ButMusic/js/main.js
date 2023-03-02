const tracksList = document.getElementById("tracks-list");
const playStopButton = document.getElementById("play-stop-button");
const seek_slider = document.querySelector(".seek_slider");

var audioDict = {};
var audioList = [];

var favouriteAudioList = [];

var currentPlayingTrack = null;
var currentPlayingTrackIndex = -1;
var isPlaying = false;

let updateTimer;

document.addEventListener("click", e => {
  if (e.target == document.querySelector(".modal.is-visible")) {
    document.querySelector(".modal.is-visible").classList.remove(isVisible);
  }
});

window.addEventListener("unload", function(e){
  saveToLocalStorage();
}, false);


document.addEventListener('DOMContentLoaded', function() {
  loadFromLocalStorage();
  loadAllTracks();
}, false);

function loadFromLocalStorage() {
  audioList = JSON.parse(localStorage.getItem('tracks'));
  favouriteAudioList = JSON.parse(localStorage.getItem('favouriteTracks'));
  audioDict = JSON.parse(localStorage.getItem('tracksLinks'));

  if (audioList == null || favouriteAudioList == null || audioDict == null) {
    audioDict = {};
    audioList = [];
    favouriteAudioList = [];
  }
}

function saveToLocalStorage() {
  localStorage.setItem('tracks', JSON.stringify(audioList));
  localStorage.setItem('favouriteTracks', JSON.stringify(favouriteAudioList));
  localStorage.setItem('tracksLinks', JSON.stringify(audioDict))
}

function showMainPage() {
  loadAllTracks();
}

function showFavouritePage() {
  loadFavouriteTracks();
}

function openAddTrackDialogWindow() {
  let newTrackDialog = document.getElementById("modal1");
  newTrackDialog.style.display = "block";
}

function cancelAddTrackDialogWindow() {
  let newTrackDialog = document.getElementById("modal1");
  newTrackDialog.style.display = "none";
}

function addNewTrack() {
  let linkField = document.getElementById("link-field")
  let trackNameField = document.getElementById("track-name-field")

  if (audioList.includes(trackNameField.value)){
    let newTrackDialog = document.getElementById("modal1");
    newTrackDialog.style.display = "none";
    return;
  }

  addTrack(linkField.value, trackNameField.value)

  let newTrackDialog = document.getElementById("modal1");
  newTrackDialog.style.display = "none";

  loadAllTracks();
}

playStopButton.addEventListener("click", function () {
  if (isPlaying) {
    currentPlayingTrack.pause();
    playStopButton.src = "../resources/images/play_v2.png";
    isPlaying = false;
  } else {
    currentPlayingTrack.play();
    playStopButton.src = "../resources/images/pause_v2.png"
    isPlaying = true;
  }
});

function playNext() {
  if (currentPlayingTrackIndex !== -1) {
    let nextTrackIndex = (currentPlayingTrackIndex +1) % audioList.length;
    playTrackByName(audioList[nextTrackIndex]);
    currentPlayingTrackIndex = nextTrackIndex;
  }
}

function playPrevious() {
  if (currentPlayingTrackIndex !== -1) {
    let prevTrackIndex = ((currentPlayingTrackIndex - 1) + audioList.length) % audioList.length;
    playTrackByName(audioList[prevTrackIndex]);
    currentPlayingTrackIndex = prevTrackIndex;
  }
}

function playTrackByName(name) {
  if (currentPlayingTrackIndex !== -1) {
    currentPlayingTrack.pause();
  }

  let currentPlayingTrackNameLabel = document.getElementById("track-name");
  currentPlayingTrack = new Audio(audioDict[name]);
  currentPlayingTrackNameLabel.textContent = name;
  clearInterval(updateTimer);
  updateTimer = setInterval(seekUpdate, 1000);
  currentPlayingTrack.addEventListener("timeupdate", function(){
    updateTimeLabel();
    console.log(seek_slider.value);
  });
  currentPlayingTrack.play();
  isPlaying = true;

  playStopButton.src = "../resources/images/pause_v2.png"
}

function updateTimeLabel(){
  let  currentPlayingTrackTimeLabel = document.getElementById("current-track-time");
  currentPlayingTrackTimeLabel.textContent = getTimeString(currentPlayingTrack.currentTime) + "/" + getTimeString(currentPlayingTrack.duration)
}

function getTimeString(timeInSeconds) {
  timeInSeconds = timeInSeconds | 0;
  return (timeInSeconds-(timeInSeconds%=60))/60+(9<timeInSeconds?':':':0')+timeInSeconds;
}

function loadAllTracks() {
  tracksList.innerHTML = "";
  addTitleListItem();
  for (let i = 0; i < audioList.length; i++) {
    addTrackListItem(audioDict[audioList[i]], audioList[i], (i + 1).toString());
  }
}

function loadFavouriteTracks() {
  tracksList.innerHTML = "";
  addTitleListItem();
  for (let i = 0; i < favouriteAudioList.length; i++) {
    addTrackListItem(audioDict[favouriteAudioList[i]], favouriteAudioList[i], (i + 1).toString());
  }
}

function addTrack(link, trackName) {
  audioDict[trackName] = link;
  audioList.push(trackName);

  addTrackListItem(link, trackName, audioList.length.toString());
}

function addTitleListItem() {
  let tracksList = document.getElementById("tracks-list")

  let li = document.createElement("li");

  let indexLabel = document.createElement("p");
  indexLabel.style.marginLeft = "10px";
  indexLabel.textContent = "#";
  let likeButton = document.createElement("p");
  let trackButton = document.createElement("button");
  trackButton.style.margin = "0";
  trackButton.textContent = "Title"
  let trackTimeLabel = document.createElement("img");
  trackTimeLabel.style.height = "20px";
  trackTimeLabel.style.width = "20px";
  trackTimeLabel.style.margin = "0";
  trackTimeLabel.src = "../resources/images/clock.png";
  let deleteButton = document.createElement("p");

  li.appendChild(indexLabel);
  li.appendChild(likeButton);
  li.appendChild(trackButton);
  li.appendChild(trackTimeLabel);
  li.appendChild(deleteButton);
  tracksList.appendChild(li);
}

function addTrackListItem(link, trackName, index) {
  let tracksList = document.getElementById("tracks-list")

  var li = document.createElement("li");

  let indexLabel = createIndexLabel(index);
  let likeButton = createLikeButton(trackName);
  let trackButton = createTrackButton(trackName);
  let trackTimeLabel = createTrackTimeLabel(link);
  let deleteButton = createDeleteButton(li, trackName);

  li.appendChild(indexLabel);
  li.appendChild(likeButton);
  li.appendChild(trackButton);
  li.appendChild(trackTimeLabel);
  li.appendChild(deleteButton);
  tracksList.appendChild(li);
}

function createIndexLabel(index) {
  let indexLabel = document.createElement("p");
  indexLabel.style.marginLeft = "10px";
  indexLabel.textContent = index;

  return indexLabel;
}

function createLikeButton(trackName) {
  let likeButton = document.createElement("INPUT");

  likeButton.setAttribute("type", "image");
  likeButton.setAttribute("class", "like-button")

  if (favouriteAudioList.includes(trackName)) {
    likeButton.setAttribute("src", "../resources/images/filled_heart_v2.png")
  } else {
    likeButton.setAttribute("src", "../resources/images/empty_heart_v2.png")
  }

  likeButton.addEventListener('click',function(){
    if (favouriteAudioList.includes(trackName)) {
      this.src = "../resources/images/empty_heart_v2.png";
      favouriteAudioList.splice(favouriteAudioList.indexOf(favouriteAudioList.indexOf(trackName)));
      return;
    }

    this.src = "../resources/images/filled_heart_v2.png";
    favouriteAudioList.push(trackName);
  });

  return likeButton;
}

function createTrackButton(trackName) {
  let trackButton = document.createElement("button");

  trackButton.textContent = trackName;

  trackButton.addEventListener('click',function(){
    playTrackByName(trackName);
    currentPlayingTrackIndex = audioList.indexOf(trackName);
  });

  return trackButton;
}

function createTrackTimeLabel(link) {
  let trackTimeLabel = document.createElement("p");

  let audio = new Audio(link);
  audio.addEventListener('loadedmetadata',function(){
    trackTimeLabel.textContent = getTimeString(audio.duration);
  });

  return trackTimeLabel;
}

function createDeleteButton(li, trackName) {
  let deleteButton = document.createElement("INPUT");

  deleteButton.setAttribute("type", "image");
  deleteButton.setAttribute("class", "trash-button")
  deleteButton.setAttribute("src", "../resources/images/trash.png")

  deleteButton.addEventListener('click',function(){
    audioList.splice(audioList.indexOf(trackName),1);
    delete audioDict[trackName];
    tracksList.removeChild(li);
  });

  return deleteButton;
}

function seekTo() {
  currentPlayingTrack.currentTime = currentPlayingTrack.duration * (seek_slider.value / 1000);
}

function seekUpdate() {
  seek_slider.value = currentPlayingTrack.currentTime / currentPlayingTrack.duration * 1000;
}
