document.getElementById("prev-song").addEventListener("click", () => fetch('http://r.pi:8080/player/previous'));
document.getElementById("next-song").addEventListener("click", () => fetch('http://r.pi:8080/player/next'));
document.getElementById("vol-down").addEventListener("click", () => fetch('http://r.pi:8080/player/volume/down'));
document.getElementById("vol-up").addEventListener("click", () => fetch('http://r.pi:8080/player/volume/up'));

let playing = true;
const play = document.getElementById("play");
play.addEventListener("click", playOrPause);

function playOrPause() {
    if (!playing) {
        fetch('http://r.pi:8080/player/resume').then(() => invertPlaying());
    } else {
        fetch('http://r.pi:8080/player/pause').then(() => invertPlaying());
    }
}

function invertPlaying() {
    playing = !playing;
    if (playing) {
        play.setAttribute("src", "/icons/pause.svg")
    } else {
        play.setAttribute("src", "/icons/play.svg")
    }
}

const restartService = document.getElementById("restart-service");
restartService.addEventListener("click", () => {
    let pass = prompt("Sudo password:")
    fetch("http://localhost:80/command?command=echo " + pass + " | sudo -S service lovspotify restart")
        .then(r => r.text())
        .then(text => {
            if (text === 'true') {
                alert("Service restarted!");
            } else {
                alert("Service not restarted...")
            }
        })
        .catch(e => console.log(e))
})

const albumArt = document.getElementById("album-art")
const songArtist = document.getElementById("song-artist");
const songTitle = document.getElementById("song-title");
const songAlbum = document.getElementById("song-album");

const time = document.getElementById("time");
const trackTime = document.getElementById("track-time");
const progress = document.getElementById("progress");

const queueItems = document.getElementById("queue").getElementsByClassName("queue-item");

const title = document.getElementById("title");

function update() {
    fetch('http://r.pi:8080/player/current')
        .then(r => r.json())
        .then(spotify => refreshCurrent(spotify))
        .catch(() => noSong());
}

function millisToMinutesAndSeconds(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return (seconds === '60' ? (minutes + 1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
}

let pauseCount = 0;

function refreshCurrent(spotify) {
    if (title.innerHTML !== 'Spotify Controller') {
        title.innerHTML = "Spotify Controller"
        document.getElementById("queue").hidden = false;
    }

    let track = spotify.track;

    albumArt.setAttribute("src", "https://i.scdn.co/image/" + spotify.image.key)
    fillSongArtist(track, songArtist);
    songTitle.innerText = track.name;
    songAlbum.innerText = track.album.name;

    progress.style.width = spotify.trackTime / track.duration * 100 + "%";
    let t = millisToMinutesAndSeconds(spotify.trackTime);
    if (time.innerText === t) {
        if (playing && ++pauseCount >= 2) {
            pauseCount = 0;
            invertPlaying();
        }
    } else {
        if (!playing) {
            invertPlaying();
        }
        time.innerText = t;
    }
    trackTime.innerText = millisToMinutesAndSeconds(track.duration)

    for (let i = 0; i < queueItems.length; i++) {
        let el = queueItems.item(i);
        let song = spotify.nextTracks[i];
        let track = song.track;

        // art
        el.getElementsByClassName("album-image-queue")[0].setAttribute("src", "https://i.scdn.co/image/" + song.image.key);
        fillSongArtist(track, el.getElementsByClassName("song-artist")[0]);
        el.getElementsByClassName("song-title")[0].innerText = track.name;
        el.getElementsByClassName("song-album")[0].innerText = track.album.name;

    }
}

function fillSongArtist(track, songArtist) {
    songArtist.innerText = '';
    let length = track.artist.length;
    for (let i = 0; i < length; i++) {
        songArtist.innerText += track.artist[i].name;
        if (i !== length - 1) {
            songArtist.innerText += '&';
        }
    }
}

function noSong() {
    title.innerHTML = "Spotify Controller <span style='color: darkred'>[DISCONNECTED]</span>"
    albumArt.setAttribute("src", "/images/no_album.jpg");
    document.getElementById("queue").hidden = true;
    songArtist.innerText = "Artist"
    songTitle.innerText = "Title"
    songAlbum.innerText = "Album"

    time.innerText = "0:00";
    trackTime.innerText = "0:00";
    progress.style.width = "0";

    if (playing) {
        invertPlaying()
    }
}

update();

setInterval(update, 1000);


