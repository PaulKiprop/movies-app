// fetch api
const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=a904b75829fb6c035147a2bafbb6b628&page=1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=a904b75829fb6c035147a2bafbb6b628&query=";
const POSTER_PLACEHOLDER = "https://via.placeholder.com/500x750?text=No+Image";

// display data 
const main = document.getElementById('main');
const form = document.getElementById('form');
const search = document.getElementById('search');
const COMMENTS_KEY = "movieComments";

const getStoredComments = () => {
    try {
        return JSON.parse(localStorage.getItem(COMMENTS_KEY)) || {};
    } catch {
        return {};
    }
};

const saveStoredComments = (commentsByMovie) => {
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(commentsByMovie));
};

const escapeHtml = (text) => text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getMovies = async (APIURL) => {
    const res = await fetch(APIURL);
    const data = await res.json();
    showMovies(data.results);
};

const showMovies = (movies) => {
    const commentsByMovie = getStoredComments();
    main.innerHTML = "";
    movies.forEach(movie => {
        const { id, poster_path, title, vote_average, overview } = movie;
        const movieComments = commentsByMovie[id] || [];
        const commentListMarkup = movieComments.length
            ? movieComments.map((comment) => `<li>${escapeHtml(comment)}</li>`).join("")
            : `<li class="empty-comment">Be the first to share your thoughts.</li>`;

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
        <img src="${poster_path ? `${IMGPATH}${poster_path}` : POSTER_PLACEHOLDER}" alt="${escapeHtml(title)}"/>
        <div class="movie-info">
            <h2 class="movie-title">${escapeHtml(title)}</h2>
            <span class="${getClassByRate(vote_average)}">${vote_average.toFixed(1)}</span>
        </div>
        <div class="movie-actions">
            <button class="toggle-overview" type="button">Movie details</button>
        </div>
        <div class="overview">
            <h3>Overview</h3>
            <p>${escapeHtml(overview || "No overview available.")}</p>
        </div>
        <section class="comments">
            <h4>What others think</h4>
            <ul class="comment-list">${commentListMarkup}</ul>
            <form class="comment-form">
                <input class="comment-input" type="text" maxlength="180" placeholder="Write a comment..." aria-label="Write a comment for ${escapeHtml(title)}" />
                <button class="comment-submit" type="submit">Post</button>
            </form>
        </section>`;

        const toggleButton = movieEl.querySelector('.toggle-overview');
        toggleButton.addEventListener('click', () => {
            movieEl.classList.toggle('show-overview');
        });

        const commentForm = movieEl.querySelector('.comment-form');
        const commentInput = movieEl.querySelector('.comment-input');
        commentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const value = commentInput.value.trim();
            if (!value) return;

            const nextCommentsByMovie = getStoredComments();
            const existing = nextCommentsByMovie[id] || [];
            nextCommentsByMovie[id] = [...existing, value].slice(-10);
            saveStoredComments(nextCommentsByMovie);
            showMovies(movies);
        });

        main.appendChild(movieEl);
    });
};

getMovies(APIURL);
const getClassByRate = (vote) => {
    if (vote >= 8) return 'green';
    else if (vote >= 5) return 'orange';
    else return 'red';
};

//searchbar functionality
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchTerm = search.value.trim();
    if (searchTerm) {
        getMovies(SEARCHAPI + searchTerm);
        search.value = "";
    } else {
        getMovies(APIURL);
    }
});