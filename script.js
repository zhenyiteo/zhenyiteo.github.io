
//api key
const apiKey = 'AIzaSyBF11-Jj-AixsdM8bPsj5JK8MqSy9hIyug';

//checks to see if a video has already been loaded
iframe_active = 0;

// Function to fetch YouTube video data
function fetchYouTubeVideos(query) {
    const maxResults = 12;

    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&q=${query}&part=snippet&type=video&maxResults=${maxResults}`;

    // var player;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const videoList = document.getElementById('video-list');
            videoList.innerHTML = ''; // Clear the existing video list

            data.items.forEach(item => {

                const videoID = item.id.videoId;
                const title = item.snippet.title;
                const thumbnailUrl = item.snippet.thumbnails.default.url;

                // console.log("video id:" + videoID + "video title:" + title);

                const videoThumbnail = document.createElement('div');
                videoThumbnail.innerHTML = `
                    <img src="${thumbnailUrl}" alt="${title}" onclick="loadVideo('${videoID}', '${title}')">
                    <p>${title}</p>
                `;
                videoList.appendChild(videoThumbnail);
            });
        })
        .catch(error => console.error(error));
}

// Function to load and play a video
function loadVideo(videoID, title) {


    const videoPlayer = document.getElementById('video-title');

    videoPlayer.innerHTML = `<h2>${title}</h2>`;

    //if a video has been loaded, update videoID
    if(iframe_active){

        clearNotes();
        player.loadVideoById(videoID);
        showNotes(videoID);
    }
    else{
  
        //create a new youtube player 
        player = new YT.Player('video-player', {
            height: '260',
            width: '240',
            videoId: videoID,
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerState

            }
          });

    }

    showNotes(videoID);

    }

function onPlayerReady(event) {

    iframe_active = 1; //indicate that a video has been loaded

}

//FUNCTION IN PROGRESS
function onPlayerState(event) {
    if (event.data == YT.PlayerState.PLAYING) {
      trackVideoTime();
    }
  }

//*****KEYWORD SEARCH FUNCTIONS******

// Function to update the query based on selected and custom keywords
function updateQuery() {
    const selectedKeywords = Array.from(document.querySelectorAll('input[name="keyword"]:checked'))
        .map(checkbox => checkbox.value); //select all the checkboxes that are currently checked on the page, then convert to array
    const customKeywords = Array.from(document.querySelectorAll('#custom-keywords-list input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    const customKeywordInput = document.getElementById('custom-keyword');
    const customKeyword = customKeywordInput.value.trim(); //trim any whitespace

    //combine selected, custom and predefined keywords into single array called "keywords"
    //.filter(Boolean) to remove any empty string from the array
    const keywords = [...selectedKeywords, ...customKeywords, customKeyword].filter(Boolean);

    //if no keywords selected, default videos = software quality assurance
    const query = keywords.length > 0 ? keywords.join(' ') : 'Software Quality Assurance';

    //fetch videos based on the updated query
    fetchYouTubeVideos(query);
}

// Function for adding custom keyword to the list
document.getElementById('keyword-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const customKeywordInput = document.getElementById('custom-keyword');
    const customKeyword = customKeywordInput.value.trim();

    if (customKeyword) {
        const customKeywordsList = document.getElementById('custom-keywords-list');
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" value="${customKeyword}" checked> ${customKeyword}`; //html list and checkbox checked
        customKeywordsList.appendChild(li); //append item to list
        customKeywordInput.value = ''; // Clear the input field
        updateQuery(); // update the query when a new keyword is added
    }
});

// Handle changes in selected keywords and custom keywords
document.getElementById('keyword-section').addEventListener('change', updateQuery);

// Fetch videos when the page loads
fetchYouTubeVideos('Software Quality Assurance');

// fetchYouTubeVideos();

//*****NOTES FUNCTIONS******

// Function to add notes
const addNote = document.querySelector(".add-notes"), 
popupNotes = document.querySelector(".popup-notes"),
closeContent = popupNotes.querySelector("header i");
saveBtn  = popupNotes.querySelector("button")
contentTag = popupNotes.querySelector("textarea");

//saving notes
const notes = JSON.parse(localStorage.getItem("notes") || "[]");


//showing and removing add note 
addNote.addEventListener("click", () => {

    popupNotes.classList.add("show");

});

closeContent.addEventListener("click", () => {

    contentTag.value = "";
    popupNotes.classList.remove("show");

});


function showNotes(v){

    //clear exisiting notes
    clearNotes();

    notes.forEach((note) => {

        //if youtube note == youtube video id , display note
        if(note.id == v)
        {
            
        let liTag = `<li class="note">
                        <div class="timestamp">
                            <span>[${note.time}]</span>
                        </div>
                        <div class="content">
                            <span>${note.description}</span>
                        </div>
                     </li>`;

         addNote.insertAdjacentHTML("afterend", liTag);

        }

    });
}


//save a note if there is content
saveBtn.addEventListener("click", e => {

    e.preventDefault();
    let noteContent = contentTag.value;
    
    if(noteContent){

        //take time video 
        var currentTime = player.getCurrentTime();
        var noteID = player.getVideoData().video_id;
        console.log("TIME NOTE WAS ADDED:" + secondsToMinutesAndSeconds(currentTime));

        let noteInfo ={
            description: noteContent,
            time: secondsToMinutesAndSeconds(currentTime),
            id: noteID
        }

        notes.push(noteInfo); //add a new note
    
        localStorage.setItem("notes", JSON.stringify(notes));
        closeContent.click();
        clearNotes();
        showNotes(noteID);

    }
});

//function to display note timestamp in an appropriate format
function secondsToMinutesAndSeconds(seconds) {

    var minutes = Math.floor(seconds / 60);
    var remSec = seconds % 60;
    return minutes + ":" + Math.round(remSec);

    //TODO:  make a '0' infront if the remaining seconds is <10

  }
  
  //function for removing all existing notes
  function clearNotes() {

        const noteList = document.querySelectorAll('.note');

        noteList.forEach((noteElement) => {
            noteElement.remove(); // Remove each note individually
          });

  }

//IN PROGRESS
function trackVideoTime() {

    var noteToStyle = document.getElementById('timestamp');
    var Child = noteToStyle.children[0]; // Index starts at 0

    var currentTime = player.getCurrentTime();

    setInterval(function(){


    notes.forEach((note) => {


        if(note.time == currentTime){
    
            Child.classList.add("highlight");
    
        }
        else{
    
            Child.classList.remove("highlight"); 
        }
    
        
        });

    }, 100)

}
