import apiKey from "/apiKey.js"


import {
  setQueryCardHtml,
  setMovieCardHtml,
  getIdFromQueryElement,
  setSearchMsgHtml,
  render,
  watclistPageCtaBtnManager,
  getMovies,
} from "/utils.js";


let duplicateIdArray = [];
let localStorageArray = [];
let movieElementCount = 1;
let renderArray = [];

const page = document.body.id;
const queryListContainer = document.getElementById("movie-list");
const mainContainerEl = document.getElementById("movie-container");
const placeHolderWrap = document.getElementById("placeholder-logo");
const form = document.getElementById("form");
const queryCollection = document.getElementsByClassName("search-item");
const storedMovies = JSON.parse(localStorage.getItem("watch"));
const storedMovieIds = JSON.parse(sessionStorage.getItem("savedImdbIds"));
const ctaButtons = document.getElementsByClassName("to-watchlist");
const storedInStorage = document.getElementById("saved-list");
const inputEl = document.getElementById("inputEl");

if (storedMovies) { // If local storage has an array of movie objects
  localStorageArray = storedMovies;
}

if (storedMovieIds) { // If session storage has an array of Imdb IDs
  renderArray = [...new Set(storedMovieIds)];
  render(renderArray, duplicateIdArray, mainContainerEl, inputEl, localStorageArray, ctaButtons,storedMovies);
}

// If index.html page is being rendered on client
if (page === "Watchlist") {
  storedInStorage.innerHTML = setMovieCardHtml(localStorageArray, page);  
// Conditions when no movie card is rendered on index.html page or when the last movie card removed
  if (storedInStorage.children.length === 0) {
    storedInStorage.innerHTML = setSearchMsgHtml(page);
  }
  watclistPageCtaBtnManager(localStorageArray, ctaButtons);

// Set events when search page is rendered on client
} else if (page === "search") {
  //Change display property of query result container to none
  document.body.addEventListener("click", () => {
    queryListContainer.style.display = "none";
  });

  // Clear local storage, clear render Array and reload page 
  document.getElementById("clear-btn").addEventListener("dblclick", () => {
    sessionStorage.clear();
    renderArray = [];
    location.reload();
  });

  //Reset inputEl placeholder
  document.getElementById("inputEl").addEventListener("click", () => {
    document.getElementById("inputEl").placeholder = "Movie Title";
  });

  // Event listener for search button
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const userQuery = inputEl.value
    form.reset();

    getMovies(`https://www.omdbapi.com/?s=${userQuery}&apikey=${apiKey}`)
      .then((data) => {
        // Control flow for number of reponse object array to be processed
        if (data.Search) {
          movieElementCount++;
          let searchResult = data.Search;
          if (searchResult.length > 5) {
            searchResult = data.Search.slice(0, 5);
          }

          // Show list of movies in UL element under the search-bar 
          queryListContainer.style.display = "block";
          queryListContainer.innerHTML = setQueryCardHtml(searchResult);

        // Event listener for the last child of the UL contaianer
          document.getElementById("see-more").addEventListener("click", () => {
            const allQueryArray = data.Search.map((query) => {
              return query.imdbID;
            });
        
            render(allQueryArray, duplicateIdArray, mainContainerEl, inputEl, localStorageArray, ctaButtons, storedMovies);
          });
          getIdFromQueryElement(queryCollection, queryListContainer, placeHolderWrap, duplicateIdArray, inputEl, mainContainerEl, storedMovies, ctaButtons, localStorageArray); //Get queryMovie id and render on page
        } else {
          if (movieElementCount < 2) {
            mainContainerEl.innerHTML = setSearchMsgHtml(page); // PlaceholderEl message content control
          }

          document.getElementById("inputEl").placeholder = `Not found!😥`;
          setTimeout(() => {
            document.getElementById("inputEl").placeholder = `Movie Title`;
          }, 2000);
        }
      })
      .catch((err) => {
        inputEl.placeholder = err.message;
      });
  });
}

