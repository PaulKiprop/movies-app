// fetch api
const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=a904b75829fb6c035147a2bafbb6b628&page=1";
const IMGPATH = "https://image.tmdb.org/t/p/w1280";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=a904b75829fb6c035147a2bafbb6b628&query=";
const POSTER_PLACEHOLDER = "https://via.placeholder.com/500x750?text=No+Image";
const MAX_COMMENTS_PER_MOVIE = 10;
const MAX_COMMENT_LENGTH = 180;

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

const getPosterUrl = (posterPath) => {
    if (typeof posterPath !== "string") return POSTER_PLACEHOLDER;
    if (!/^\/[a-zA-Z0-9._/-]+$/.test(posterPath)) return POSTER_PLACEHOLDER;
    if (posterPath.includes("..")) return POSTER_PLACEHOLDER;
    return `${IMGPATH}${posterPath}`;
};

const createCommentListMarkup = (comments) => {
    if (!comments.length) {
        return `<li class="empty-comment">Be the first to share your thoughts.</li>`;
    }

    return comments.map((comment) => `<li>${escapeHtml(comment)}</li>`).join("");
};

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
        const commentListMarkup = createCommentListMarkup(movieComments);

        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
        <img src="${getPosterUrl(poster_path)}" alt="${escapeHtml(title)}"/>
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
            <small class="comment-note">Up to ${MAX_COMMENTS_PER_MOVIE} latest comments are shown.</small>
            <form class="comment-form">
                <input class="comment-input" type="text" maxlength="${MAX_COMMENT_LENGTH}" placeholder="Write a comment..." aria-label="Write a comment" />
                <button class="comment-submit" type="submit">Post</button>
            </form>
        </section>`;

        const toggleButton = movieEl.querySelector('.toggle-overview');
        toggleButton.addEventListener('click', () => {
            movieEl.classList.toggle('show-overview');
        });

        const commentForm = movieEl.querySelector('.comment-form');
        const commentInput = movieEl.querySelector('.comment-input');
        const commentList = movieEl.querySelector('.comment-list');
        commentForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const value = commentInput.value.trim();
            if (!value) return;

            const nextCommentsByMovie = getStoredComments();
            const existing = nextCommentsByMovie[id] || [];
            nextCommentsByMovie[id] = [...existing, value].slice(-MAX_COMMENTS_PER_MOVIE);
            saveStoredComments(nextCommentsByMovie);
            commentList.innerHTML = createCommentListMarkup(nextCommentsByMovie[id]);
            commentInput.value = "";
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