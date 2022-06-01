import apiKey from "/apiKey.js"

async function getMovies(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw Error("Could not fetch Movie");
  }
  return await res.json();
}

/**Returns HTML strings for Query Result collection */
function setQueryCardHtml(resultArr) {
  return (
    resultArr
      .map((options) => {
        return `<li class="search-item" id="${options.imdbID}">${
          options.Title
        }.  Year: ${options.Year}.  Type: ${options.Type.toUpperCase()}</li>`;
      })
      .join("") + `<li class="see-more-options" id="see-more">See more...</li>`
  );
}

/** Sets #placeholder-logo innerHtml to page specific messages*/
function setSearchMsgHtml(page) {
  if (page === "search") {
    return `<div class="placeholder-wrap" id="placeholder-logo">
  <p>Unable to find what you are looking for?</p>
  <p class="alert">Please try another search!</p>
</div>`;
  } else if (page === "Watchlist") {
    return `<div class="placeholder-wrap">
  <p>Your watchlist is looking a little empty...</p>
  <a class="get-movie" href="search.html"><span>+</span> Let's add some movies!</a>
</div>`;
  }
}

/**Returns page specific html strings for movie-object card*/
function setMovieCardHtml(arr, page) {
  let sign = "+";
  let symbolID = "addMovie";
  let linkText = "Watchlist";
  if (page === "Watchlist") {
    sign = "-";
    symbolID = "removeMovie";
    linkText = "Remove";
  }
  return arr
    .map((movieObj) => {
      if (movieObj.Poster === "N/A") {
        movieObj.Poster = `https://media.istockphoto.com/photos/play-icon-youtube-picture-id1344290509?b=1&k=20&m=1344290509&s=170667a&w=0&h=nsr6-eek2_1H4OqmX5tdJE9LFVn20puWnO4xXx9j18g=`;
      }
      if (movieObj.Runtime === "N/A") {
        movieObj.Runtime = "";
      }
      if (movieObj.Genre === "N/A") {
        movieObj.Genre = "";
      }
      if (movieObj.Plot === "N/A") {
        movieObj.Plot = "";
      }
      if (movieObj.imdbRating === "N/A") {
        movieObj.imdbRating = "";
      }
      if (movieObj.Plot === "N/A") {
        movieObj.Plot = "";
      }
      return `<div class="movies ${movieObj.imdbID}" id="movie-selection">
  <div class="movie-wrap">
      <div class="movie">
          <h2>${movieObj.Title}<i class="fa-solid fa-star"></i><span class="rating">${movieObj.imdbRating}</span></h2>
          <div class="movie-details flex">
            <div class="top">
                <p class="runtime">${movieObj.Runtime}</p>
                <p class="genre">${movieObj.Genre}</p>
              </div>
              <div class="cta-wrapper">
                <span class="sign" id="${symbolID}">${sign}</span>
                <button class="cta to-watchlist" id='${movieObj.imdbID}'>${linkText}</button> 
              </div> 
          </div>
          <p class="movie-plot">${movieObj.Plot}</p>
          <a href="index.html" class="add-message ${movieObj.imdbID}" >${movieObj.Title} is added to watchlist</a>
      </div>
      <div class="movie-poster-wrapper">
          <img class="poster-img" src=${movieObj.Poster} alt="movie poster">
      </div>
  </div>  
  </div>`;
    })
    .join("");
}

/**Local Storage Manager */
function setLocalStorage(arr, itemID, localStorageArray) {
  localStorageArray.unshift(...arr);
  localStorage.watch = JSON.stringify(localStorageArray);
  document.querySelector(`a.${itemID}`).style.display = "block"; //Show '... added to watchlist' msg
}

/**Gets Movie info from Api*/
function render(
  arr,
  duplicateIdArray,
  mainContainerEl,
  inputEl,
  localStorageArray,
  ctaButtons,
  storedMovies
) {
  let queryObjArr = [];
  let queryIdArr = [];
  duplicateIdArray.unshift(...arr);
  queryIdArr = [...new Set(duplicateIdArray)];

  // Setting session storage
  sessionStorage.savedImdbIds = JSON.stringify(duplicateIdArray);

  // Iterate and fetch movie info from queryIDarr omdbID elements
  for (const movieId of queryIdArr) {
    const url = `https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}&short`;
    getMovies(url)
      .then((data) => {
        queryObjArr.unshift(data);
        if (mainContainerEl) {
          mainContainerEl.innerHTML = setMovieCardHtml(queryObjArr);
          searchPageCtaBtnManager(
            queryObjArr,
            localStorageArray,
            ctaButtons,
            storedMovies
          );
        }
      })
      .catch((err) => {
        if (inputEl) {
          inputEl.placeholder = err.message;
        }
        console.log(err);
      });
  }
}

/** Gets imdbId of movie in clicked list element*/
function getIdFromQueryElement(
  queryCollection,
  queryListContainer,
  placeHolderWrap,
  duplicateIdArray,
  inputEl,
  mainContainerEl,
  storedMovies,
  ctaButtons,
  localStorageArray
) {
  for (const movieOptions of queryCollection) {
    let movieIdArray = [];
    movieOptions.addEventListener("click", () => {
      queryListContainer.innerHTML = "";
      placeHolderWrap.style.display = "none";
      let elementId = movieOptions.id;
      movieIdArray.unshift(elementId); //Add clicked element's ID to movieIDArray
      render(
        movieIdArray,
        duplicateIdArray,
        mainContainerEl,
        inputEl,
        localStorageArray,
        ctaButtons,
        storedMovies
      );
    });
  }
}

/**Manages behavior of movie cards on cta button click in Search page */
function searchPageCtaBtnManager(
  arr,
  localStorageArray,
  ctaButtons,
  storedMovies
) {
  for (const item of ctaButtons) {
    item.addEventListener("click", () => {
      const itemID = item.id;
      const movieIDInArray = arr.filter((targetID) => {
        return targetID.imdbID === itemID;
      });
      if (storedMovies) {
        //Logic to prevent re-adding already saved movies
        const clickedMovietitle = movieIDInArray[0].Title;
        const isMovieInStorage = storedMovies.find(
          (movie) => movie.Title === clickedMovietitle
        );
        if (isMovieInStorage) {
          document.querySelector(`a.${itemID}`).style.display = "block";
          document.querySelector(`a.${itemID}`).textContent =
            "Already in my watchlist🎥😅";
        } else {
          setLocalStorage(movieIDInArray, itemID, localStorageArray);
        }
      } else {
        setLocalStorage(movieIDInArray, itemID, localStorageArray);
      }
      document.getElementById(`${itemID}`).disabled = true;
    });
  }
}

/**Manages behavior of movie cards on cta button click in Watchlist page */
function watclistPageCtaBtnManager(arr, ctaButtons) {
  for (const item of ctaButtons) {
    item.addEventListener("click", () => {
      const itemID = item.id;
      const movieIDInArray = arr.filter((targetID) => {
        return targetID.imdbID === itemID;
      });
      // Remove movie from MovieObjectarr and reset local storage
      const indexOfTarget = arr.indexOf(...movieIDInArray);
      arr.splice(indexOfTarget, 1);
      if (arr.length === 0) {
        location.reload();
      }
      document.querySelector(`.${itemID}`).style.display = "none";
      localStorage.watch = JSON.stringify(arr);
    });
  }
}

export {
  setQueryCardHtml,
  setMovieCardHtml,
  getIdFromQueryElement,
  setSearchMsgHtml,
  render,
  watclistPageCtaBtnManager,
  getMovies,
};
