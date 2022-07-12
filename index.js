const currentPageChecker = document.URL.includes('index') // True index.html - False watchlist.html

/* ===========================================================================INDEX FILE ELEMENTS */

const baseApiUrl = "https://www.omdbapi.com/?"
const movieNameSearchInput = document.querySelector("input")
const searchBtn = document.querySelector("button")
const foundMovies = document.querySelector(".movies_container")


/* =======================================================================WATCHLIST FILE ELEMENTS */

const watchListContainer = document.getElementById("wlist_container")
const emptyWatchListContent = `
    <div class="blankpage-content">
        <p>Your watchlist is looking a little empty...</p>
        <a href="index.html">Let’s add some movies!</a>
    <div>
    `
/* ============================================================================CALLING FUNCTIIONS */

if(currentPageChecker){
    renderSearchResults()
}

if(!currentPageChecker){
    renderWatchList()
}

/* -----------------------------------------------------------------------------------------------*/
                             /*               FUNCTIONS               */
/* ------------------------------------------------------------------------------------GET MOVIES */
       
async function getMovies(event) {
    event.preventDefault()
    foundMovies.innerHTML = ""
    const response = await fetch(baseApiUrl + new URLSearchParams({
        apikey: "2010abac",// obtained via email from OMDb api website
        s: movieNameSearchInput.value,
        page: 1
        }))
    const data = await response.json()
    if(data.Response === "False"){
        foundMovies.innerHTML = `
            <div class="blankpage-content">
                <p>Unable to find what you’re looking for. Please try another search.<p>
            </div>`
    }
    else {
        for (let movieObject of data.Search){
            fetch(baseApiUrl + new URLSearchParams({apikey: "2010abac", i: movieObject.imdbID, plot: "full"}))
                .then(res => res.json())
                .then(data => {
                    foundMovies.innerHTML += `
                        <div class="movie-element" id="${data.imdbID}">
                            <img src="${data.Poster}" class="movie-poster">
                            <div>
                                <div class="movie-element-description">
                                    <h4>${data.Title}</h4>
                                    <p id="rating-star" class="movie-font">${data.imdbRating}</p>
                                </div>
                                <div class="movie-element-description">
                                    <p class="movie-font">${data.Runtime}</p>
                                    <p class="movie-font">${data.Genre}</p>
                                    <button id="addWatchlistBtn" class=" movie-font" onclick="watchListAddDel(event)">Watchlist</button>
                                </div>
                                <div>
                                    ${renderPlot(data.Plot)}
                                </div>
                            </div>
                        </div>
                        `
                })
        } 
    }
}

/* -----------------------------------------------------------------WATCH LIST ADDITOR-DELETER */

function watchListAddDel(event){
    let movieElBtn = event.target
    let movieElBtnId = event.target.getAttribute('id')
    const movieElement = event.target.parentNode.parentNode.parentNode
    const movieElementId = movieElement.getAttribute('id')
    const movieObject = JSON.parse(localStorage.getItem("watchlist"))
    
    if(movieObject[movieElementId]){
        if(movieElBtnId === "removeWatchlistBtn"){
            movieElBtn.setAttribute("id", "addWatchlistBtn")
        }
        delete movieObject[movieElementId]
        localStorage.setItem("watchlist", JSON.stringify(movieObject))
        if(!currentPageChecker){
            renderWatchList()
        }
    }
    else {
        if(movieElBtnId === "addWatchlistBtn"){
            movieElBtn.setAttribute("id", "removeWatchlistBtn")
        }
        movieObject[movieElementId] = movieElement.outerHTML
        localStorage.setItem("watchlist", JSON.stringify(movieObject))// Save array to local storage
    }
}

/* ------------------------------------------------------------------------------RENDER FUNCTIONS */

function renderWatchList(){
    const movieListObject = JSON.parse(localStorage.getItem("watchlist"))// Retrieve stored data
    if(Object.keys(movieListObject).length === 0){ // Check whether the object is empty
        watchListContainer.innerHTML = emptyWatchListContent //insert the placeholder
    }
    else
        watchListContainer.innerHTML = ""//Clear the placeholder
        for(let movie in movieListObject){// render selected movies to DOM from localstorage
            watchListContainer.innerHTML += movieListObject[movie]
    }
}

function renderSearchResults(){
    localStorage.setItem("watchlist", JSON.stringify({}))
    searchBtn.addEventListener("click", getMovies)
}

/* -------------------------------------------------------------------------------------READ MORE */

function renderPlot(text){
    if(text.length > 140){
        return `
            <p class="plot">
                <span>${text.slice(0, 150)}</span>
                <span style="display: none">${text.slice(150, -1)}</span>
                <button class="moreLessBtn" onclick="fullPlotRender(event)">Read more</button>
            </p>`
    }
    else
        return `<p class="plot">${text}</p>`
}

function fullPlotRender(event){
    const moreLessBtn = event.target
    const hiddenText = event.target.previousElementSibling
    const hiddenTextStyle = hiddenText.getAttribute("style")
    if(hiddenTextStyle === "display: none"){
        hiddenText.setAttribute("style","display: inline")
        moreLessBtn.innerText = "Read less"
    }
    else
        hiddenText.setAttribute("style","display: none")
        moreLessBtn.innerText = "Read more"
}