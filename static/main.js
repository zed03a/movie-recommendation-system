// ============================================================
// CineMatch - Main JavaScript
// Features: Movies, Web Series, Bollywood, Hollywood, Director Search
// ============================================================

// TMDB API Configuration
const TMDB_API_KEY = "8265bd1679663a7ea12ac168da84d2e8";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_MOVIE_URL = `${TMDB_BASE_URL}/movie`;
const TMDB_TV_URL = `${TMDB_BASE_URL}/tv`;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";
const FALLBACK_POSTER = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop";
const FALLBACK_BACKDROP = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1280&auto=format&fit=crop";

// Pre-defined popular movies for Hero Section selection
const HERO_MOVIES = [
    { id: 157336, title: "Interstellar", lang: "English", origin: "Hollywood" },
    { id: 155, title: "The Dark Knight", lang: "English", origin: "Hollywood" },
    { id: 27205, title: "Inception", lang: "English", origin: "Hollywood" },
    { id: 19995, title: "Avatar", lang: "English", origin: "Hollywood" },
    { id: 24428, title: "The Avengers", lang: "English", origin: "Hollywood" },
    { id: 671, title: "Harry Potter and the Philosopher's Stone", lang: "English", origin: "Hollywood" },
    { id: 120, title: "The Lord of the Rings: The Fellowship of the Ring", lang: "English", origin: "Hollywood" }
];

// Featured Web Series with real TMDB IDs, season info
const FEATURED_WEB_SERIES = [
    {
        tmdb_id: 1396, name: "Breaking Bad", media_type: "tv",
        seasons: 5, episodes: 62,
        season_data: [
            { season: 1, episodes: 7, year: 2008, release: "January 20, 2008" },
            { season: 2, episodes: 13, year: 2009, release: "March 8, 2009" },
            { season: 3, episodes: 13, year: 2010, release: "March 21, 2010" },
            { season: 4, episodes: 13, year: 2011, release: "July 17, 2011" },
            { season: 5, episodes: 16, year: 2013, release: "August 11, 2013" }
        ]
    },
    {
        tmdb_id: 1399, name: "Game of Thrones", media_type: "tv",
        seasons: 8, episodes: 73,
        season_data: [
            { season: 1, episodes: 10, year: 2011, release: "April 17, 2011" },
            { season: 2, episodes: 10, year: 2012, release: "April 1, 2012" },
            { season: 3, episodes: 10, year: 2013, release: "March 31, 2013" },
            { season: 4, episodes: 10, year: 2014, release: "April 6, 2014" },
            { season: 5, episodes: 10, year: 2015, release: "April 12, 2015" },
            { season: 6, episodes: 10, year: 2016, release: "April 24, 2016" },
            { season: 7, episodes: 7, year: 2017, release: "July 16, 2017" },
            { season: 8, episodes: 6, year: 2019, release: "April 14, 2019" }
        ]
    },
    {
        tmdb_id: 60625, name: "Rick and Morty", media_type: "tv",
        seasons: 7, episodes: 71,
        season_data: [
            { season: 1, episodes: 11, year: 2013, release: "December 2, 2013" },
            { season: 2, episodes: 10, year: 2015, release: "July 26, 2015" },
            { season: 3, episodes: 10, year: 2017, release: "April 1, 2017" },
            { season: 4, episodes: 10, year: 2019, release: "November 10, 2019" },
            { season: 5, episodes: 10, year: 2021, release: "June 20, 2021" },
            { season: 6, episodes: 10, year: 2022, release: "September 4, 2022" },
            { season: 7, episodes: 10, year: 2023, release: "October 15, 2023" }
        ]
    },
    {
        tmdb_id: 87108, name: "Chernobyl", media_type: "tv",
        seasons: 1, episodes: 5,
        season_data: [
            { season: 1, episodes: 5, year: 2019, release: "May 6, 2019" }
        ]
    },
    {
        tmdb_id: 66732, name: "Stranger Things", media_type: "tv",
        seasons: 4, episodes: 42,
        season_data: [
            { season: 1, episodes: 8, year: 2016, release: "July 15, 2016" },
            { season: 2, episodes: 9, year: 2017, release: "October 27, 2017" },
            { season: 3, episodes: 8, year: 2019, release: "July 4, 2019" },
            { season: 4, episodes: 9, year: 2022, release: "May 27, 2022" }
        ]
    },
    {
        tmdb_id: 85937, name: "Kota Factory", media_type: "tv",
        seasons: 3, episodes: 17,
        season_data: [
            { season: 1, episodes: 5, year: 2019, release: "April 16, 2019" },
            { season: 2, episodes: 5, year: 2021, release: "September 24, 2021" },
            { season: 3, episodes: 7, year: 2024, release: "June 20, 2024" }
        ]
    },
    {
        tmdb_id: 88396, name: "The Hawkeye", media_type: "tv",
        seasons: 1, episodes: 6,
        season_data: [
            { season: 1, episodes: 6, year: 2021, release: "November 24, 2021" }
        ]
    },
    {
        tmdb_id: 76479, name: "The Boys", media_type: "tv",
        seasons: 4, episodes: 38,
        season_data: [
            { season: 1, episodes: 8, year: 2019, release: "July 26, 2019" },
            { season: 2, episodes: 8, year: 2020, release: "September 4, 2020" },
            { season: 3, episodes: 8, year: 2022, release: "June 3, 2022" },
            { season: 4, episodes: 8, year: 2024, release: "June 13, 2024" }
        ]
    }
];

// App State
let allMovies = [];
let watchlist = JSON.parse(localStorage.getItem("cinematch_watchlist")) || [];
let activeSuggestionIndex = -1;
let currentModalMovie = null;

// DOM Elements
const searchInput = document.getElementById("movie-search-input");
const autocompleteList = document.getElementById("autocomplete-list");
const clearSearchBtn = document.getElementById("clear-search-btn");
const recommendationsGrid = document.getElementById("recommendations-grid");
const loader = document.getElementById("recommendations-loader");
const resultsHeading = document.getElementById("results-heading");
const resultsSubheading = document.getElementById("results-subheading");

const watchlistGrid = document.getElementById("watchlist-grid");
const watchlistEmptyState = document.getElementById("watchlist-empty-state");

const modal = document.getElementById("movie-detail-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalPoster = document.getElementById("modal-movie-poster");
const modalTitle = document.getElementById("modal-movie-title");
const modalGenres = document.getElementById("modal-movie-genres");
const modalRating = document.getElementById("modal-movie-rating");
const modalYear = document.getElementById("modal-movie-year");
const modalRuntime = document.getElementById("modal-movie-runtime");
const modalDirector = document.getElementById("modal-movie-director");
const modalCast = document.getElementById("modal-movie-cast");
const modalOverview = document.getElementById("modal-movie-overview");
const modalRecommendBtn = document.getElementById("modal-recommend-btn");
const modalWatchlistBtn = document.getElementById("modal-watchlist-btn");
const modalDirectorSearchBtn = document.getElementById("modal-director-search-btn");

const modalMovieType = document.getElementById("modal-movie-type");
const modalVibeTagline = document.getElementById("modal-vibe-tagline");
const modalVibePct = document.getElementById("modal-vibe-pct");
const modalVibeFill = document.getElementById("modal-vibe-fill");

const modalPosterContainer = document.getElementById("modal-poster-container");
const modalVideoContainer = document.getElementById("modal-video-container");
const modalPlayTrailerBtn = document.getElementById("modal-play-trailer-btn");
const modalTrailerIframe = document.getElementById("modal-trailer-iframe");

const heroTitle = document.getElementById("hero-movie-title");
const heroYear = document.getElementById("hero-movie-year");
const heroRuntime = document.getElementById("hero-movie-runtime");
const heroRating = document.getElementById("hero-movie-rating");
const heroOverview = document.getElementById("hero-movie-overview");
const heroBackdrop = document.getElementById("hero-backdrop-img");
const heroRecommendBtn = document.getElementById("hero-recommend-btn");
const heroWatchlistBtn = document.getElementById("hero-watchlist-btn");
const heroLangBadge = document.getElementById("hero-lang-badge");
const heroLangTag = document.getElementById("hero-movie-lang");

const directorModal = document.getElementById("director-modal");
const directorModalClose = document.getElementById("director-modal-close");
const directorSearchBtn = document.getElementById("director-search-btn");
const directorNameInput = document.getElementById("director-name-input");
const directorSearchSubmitBtn = document.getElementById("director-search-submit-btn");

/* ==========================================================================
   Initialization
   ========================================================================== */
window.addEventListener("DOMContentLoaded", () => {
    fetchMoviesList();
    setupHeroSection();
    setupHomepageCategories();
    loadWebSeriesSection();
    renderWatchlist();
    setupEventListeners();
});

/* ==========================================================================
   Event Listeners Setup
   ========================================================================== */
function setupEventListeners() {
    // Navbar scroll visual change
    window.addEventListener("scroll", () => {
        const nav = document.getElementById("main-nav");
        if (window.scrollY > 50) {
            nav.classList.add("scrolled");
        } else {
            nav.classList.remove("scrolled");
        }
    });

    // Search
    searchInput.addEventListener("input", handleSearchInput);
    searchInput.addEventListener("keydown", handleSearchKeydown);
    
    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        closeAutocomplete();
    });

    const searchIcon = document.querySelector(".search-icon");
    if (searchIcon) {
        searchIcon.addEventListener("click", () => {
            const val = searchInput.value.trim();
            if (val) {
                closeAutocomplete();
                getRecommendations(val);
                document.getElementById("recommendations-section").scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#search-widget-container")) {
            closeAutocomplete();
        }
    });

    // Modal Close
    modalCloseBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });

    // Hero buttons
    heroRecommendBtn.addEventListener("click", () => {
        const title = heroTitle.textContent;
        getRecommendations(title);
        document.getElementById("recommendations-section").scrollIntoView({ behavior: "smooth" });
    });

    heroWatchlistBtn.addEventListener("click", () => {
        const featuredMovie = HERO_MOVIES.find(m => m.title === heroTitle.textContent);
        if (featuredMovie) {
            toggleWatchlist({
                movie_id: featuredMovie.id,
                title: heroTitle.textContent,
                rating: parseFloat(heroRating.textContent) || 0.0,
                release_date: (heroYear.textContent || "2014") + "-01-01",
                genres: "Featured"
            });
            updateHeroWatchlistButton(featuredMovie.id);
        }
    });

    // Director Search Modal
    directorSearchBtn.addEventListener("click", () => openDirectorModal());
    directorModalClose.addEventListener("click", closeDirectorModal);
    directorModal.addEventListener("click", (e) => {
        if (e.target === directorModal) closeDirectorModal();
    });

    directorSearchSubmitBtn.addEventListener("click", () => {
        const name = directorNameInput.value.trim();
        if (name) {
            closeDirectorModal();
            searchByDirector(name);
        }
    });

    directorNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const name = directorNameInput.value.trim();
            if (name) {
                closeDirectorModal();
                searchByDirector(name);
            }
        }
    });

    // Director quick-pick chips
    document.querySelectorAll(".director-chip").forEach(chip => {
        chip.addEventListener("click", () => {
            const director = chip.getAttribute("data-director");
            closeDirectorModal();
            searchByDirector(director);
        });
    });
}

/* ==========================================================================
   Director Search
   ========================================================================== */
function openDirectorModal() {
    directorModal.style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => directorNameInput.focus(), 100);
}

function closeDirectorModal() {
    directorModal.style.display = "none";
    document.body.style.overflow = "auto";
}

async function searchByDirector(directorName) {
    const section = document.getElementById("director-results-section");
    const grid = document.getElementById("director-results-grid");
    const heading = document.getElementById("director-results-heading");
    const nameSpan = document.getElementById("director-results-name");
    const count = document.getElementById("director-results-count");

    section.style.display = "block";
    grid.innerHTML = `
        <div class="skeleton-card"></div><div class="skeleton-card"></div>
        <div class="skeleton-card"></div><div class="skeleton-card"></div>
        <div class="skeleton-card"></div><div class="skeleton-card"></div>
    `;
    nameSpan.textContent = directorName;
    count.textContent = "Searching local & TMDB database...";

    section.scrollIntoView({ behavior: "smooth" });

    try {
        // 1. Try local DB
        const response = await fetch(`/api/movies/director/${encodeURIComponent(directorName)}`);
        if (response.ok) {
            const data = await response.json();
            count.textContent = `Found ${data.count} film(s) from local database.`;
            renderMovieRow(data.movies, "director-results-grid");
            return;
        }
    } catch (e) {
        console.warn("Local director search failed, trying TMDB...");
    }

    // 2. Fallback: TMDB people search
    try {
        const personRes = await fetch(`${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(directorName)}`);
        if (!personRes.ok) throw new Error("Person search failed");
        const personData = await personRes.json();
        const person = (personData.results || []).find(p => p.known_for_department === "Directing") || personData.results?.[0];

        if (person) {
            const creditsRes = await fetch(`${TMDB_BASE_URL}/person/${person.id}/movie_credits?api_key=${TMDB_API_KEY}`);
            const creditsData = await creditsRes.json();
            const directed = (creditsData.crew || [])
                .filter(c => c.job === "Director")
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, 16);

            if (directed.length > 0) {
                count.textContent = `Found ${directed.length} films directed by ${person.name} (TMDB Live).`;
                const mapped = directed.map(m => ({
                    movie_id: m.id,
                    title: m.title || m.name,
                    genres: m.genre_ids ? "Movie" : "Film",
                    rating: m.vote_average || 0,
                    popularity: m.popularity || 0,
                    release_date: m.release_date || "",
                    runtime: 0,
                    overview: m.overview || ""
                }));
                renderMovieRow(mapped, "director-results-grid");
                return;
            }
        }
        count.textContent = "No films found for this director.";
        grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-user-tie"></i><p>No films found for "${directorName}". Try checking the spelling or search a different name.</p></div>`;
    } catch (e) {
        count.textContent = "Failed to search director. Please check your connection.";
        grid.innerHTML = `<div class="empty-state"><i class="fa-solid fa-circle-exclamation"></i><p>Search failed. Please try again.</p></div>`;
    }
}

/* ==========================================================================
   Data Fetching & APIs
   ========================================================================== */
async function fetchMoviesList() {
    try {
        const response = await fetch("/api/movies");
        if (!response.ok) throw new Error("Failed to load movie index");
        allMovies = await response.json();
    } catch (error) {
        console.error("Error fetching movies list:", error);
    }
}

async function fetchTMDBData(movieId) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 2000);
    try {
        const response = await fetch(`${TMDB_MOVIE_URL}/${movieId}?api_key=${TMDB_API_KEY}`, { signal: controller.signal });
        clearTimeout(tid);
        if (!response.ok) throw new Error("TMDB movie fetch failed");
        return await response.json();
    } catch (error) {
        clearTimeout(tid);
        return null;
    }
}

async function fetchTMDBTVData(tvId) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 2000);
    try {
        const response = await fetch(`${TMDB_TV_URL}/${tvId}?api_key=${TMDB_API_KEY}`, { signal: controller.signal });
        clearTimeout(tid);
        if (!response.ok) throw new Error("TMDB TV fetch failed");
        return await response.json();
    } catch (error) {
        clearTimeout(tid);
        return null;
    }
}

async function fetchTMDBVideos(movieId) {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 2000);
    try {
        const response = await fetch(`${TMDB_MOVIE_URL}/${movieId}/videos?api_key=${TMDB_API_KEY}`, { signal: controller.signal });
        clearTimeout(tid);
        if (!response.ok) throw new Error("TMDB videos fetch failed");
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        clearTimeout(tid);
        return [];
    }
}

async function getRecommendations(title) {
    const recommendationsSection = document.getElementById("recommendations-section");
    if (recommendationsSection) recommendationsSection.style.display = "block";
    recommendationsGrid.style.display = "none";
    loader.style.display = "flex";
    resultsHeading.textContent = `Finding recommendations for "${title}"...`;
    resultsSubheading.textContent = "Running natural language processing matching models...";

    try {
        const response = await fetch(`/api/recommend?title=${encodeURIComponent(title)}`);
        if (response.ok) {
            const data = await response.json();
            resultsHeading.textContent = `Recommended for: ${data.searched_movie}`;
            resultsSubheading.textContent = `Here are 6 titles similar to "${data.searched_movie}" calculated using NLP TF-IDF cosine similarity.`;
            renderMovieRow(data.recommendations, "recommendations-grid");
            
            if (data.searched_movie_details) {
                openModal(data.searched_movie_details);
            }
            return;
        }

        // TMDB fallback
        const tmdbResults = await fetchLiveTMDBMatches(title);
        if (tmdbResults.length > 0) {
            const topMatch = tmdbResults[0];
            const mediaType = topMatch.media_type || 'movie';
            const recommendations = await fetchLiveTMDBRecommendations(topMatch.id, mediaType);

            if (recommendations.length > 0) {
                resultsHeading.textContent = `Recommended for: ${topMatch.title || topMatch.name} (Live TMDB)`;
                resultsSubheading.textContent = `"${topMatch.title || topMatch.name}" wasn't in our local dataset. Showing live global recommendations for this ${mediaType === 'tv' ? 'web series' : 'movie'}.`;

                const mappedRecommendations = recommendations.slice(0, 6).map(m => ({
                    movie_id: m.id,
                    title: m.title || m.name,
                    genres: "Live Recommendation",
                    rating: m.vote_average || 0.0,
                    popularity: m.popularity || 0.0,
                    release_date: m.release_date || m.first_air_date || "",
                    runtime: m.runtime || 0,
                    overview: m.overview || "No synopsis available."
                }));
                renderMovieRow(mappedRecommendations, "recommendations-grid");

                const searchDetails = await fetchLiveTMDBDetails(topMatch.id, mediaType === 'tv');
                if (searchDetails) {
                    openModal({
                        movie_id: topMatch.id,
                        title: topMatch.title || topMatch.name,
                        genres: searchDetails.genres,
                        rating: topMatch.vote_average || 0.0,
                        popularity: topMatch.popularity || 0.0,
                        release_date: topMatch.release_date || topMatch.first_air_date || "",
                        runtime: searchDetails.runtime,
                        overview: searchDetails.overview,
                        director: searchDetails.director,
                        cast: searchDetails.cast,
                        is_tv: mediaType === 'tv'
                    });
                }
                return;
            }
        }

        throw new Error("Failed to retrieve recommendations");
    } catch (error) {
        console.error("Error getting recommendations:", error);
        resultsHeading.textContent = "Oops, something went wrong!";
        resultsSubheading.textContent = "Make sure the title is spelled correctly or try another one.";
        recommendationsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-exclamation text-primary"></i>
                <p>Could not load recommendations for "${title}". Please verify the title from the suggestions and try again.</p>
            </div>
        `;
        recommendationsGrid.style.display = "flex";
    } finally {
        loader.style.display = "none";
    }
}

async function fetchLiveTMDBMatches(query) {
    try {
        const response = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        if (!response.ok) return [];
        const data = await response.json();
        return (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
    } catch (e) {
        return [];
    }
}

async function fetchLiveTMDBRecommendations(id, mediaType) {
    try {
        const type = mediaType === 'tv' ? 'tv' : 'movie';
        const response = await fetch(`${TMDB_BASE_URL}/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.results || [];
    } catch (e) {
        return [];
    }
}

async function getRecommendationsFromTMDB(title, id, mediaType) {
    const recommendationsSection = document.getElementById("recommendations-section");
    if (recommendationsSection) recommendationsSection.style.display = "block";
    recommendationsGrid.style.display = "none";
    loader.style.display = "flex";
    resultsHeading.textContent = `Finding recommendations for "${title}"...`;
    resultsSubheading.textContent = "Fetching live global recommendations from TMDB database...";

    try {
        const recommendations = await fetchLiveTMDBRecommendations(id, mediaType);

        if (recommendations.length > 0) {
            resultsHeading.textContent = `Recommended for: ${title} (Live TMDB)`;
            resultsSubheading.textContent = `Here are 6 global suggestions for this ${mediaType === 'tv' ? 'web series' : 'movie'} retrieved live.`;

            const mappedRecommendations = recommendations.slice(0, 6).map(m => ({
                movie_id: m.id,
                title: m.title || m.name,
                genres: "Live Recommendation",
                rating: m.vote_average || 0.0,
                popularity: m.popularity || 0.0,
                release_date: m.release_date || m.first_air_date || "",
                runtime: m.runtime || 0,
                overview: m.overview || "No synopsis available."
            }));

            renderMovieRow(mappedRecommendations, "recommendations-grid");

            const searchDetails = await fetchLiveTMDBDetails(id, mediaType === 'tv');
            if (searchDetails) {
                openModal({
                    movie_id: parseInt(id),
                    title,
                    genres: searchDetails.genres,
                    rating: searchDetails.vote_average || 0.0,
                    popularity: searchDetails.popularity || 0.0,
                    release_date: searchDetails.release_date || "",
                    runtime: searchDetails.runtime,
                    overview: searchDetails.overview,
                    director: searchDetails.director,
                    cast: searchDetails.cast,
                    is_tv: mediaType === 'tv'
                });
            }
        } else {
            throw new Error("No TMDB recommendations available");
        }
    } catch (error) {
        resultsHeading.textContent = "Oops, something went wrong!";
        resultsSubheading.textContent = "Could not fetch recommendations. Please check your connection or try another title.";
        recommendationsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-exclamation text-primary"></i>
                <p>Could not load recommendations for "${title}". No live suggestions were returned by TMDB.</p>
            </div>
        `;
        recommendationsGrid.style.display = "flex";
    } finally {
        loader.style.display = "none";
    }
}

async function fetchLiveTMDBDetails(movieId, isTv = false) {
    const type = isTv ? 'tv' : 'movie';
    try {
        const detailRes = await fetch(`${TMDB_BASE_URL}/${type}/${movieId}?api_key=${TMDB_API_KEY}`);
        let details = {};
        if (detailRes.ok) details = await detailRes.json();

        const creditsRes = await fetch(`${TMDB_BASE_URL}/${type}/${movieId}/credits?api_key=${TMDB_API_KEY}`);
        let credits = {};
        if (creditsRes.ok) credits = await creditsRes.json();

        const director = credits.crew ? (credits.crew.find(c => c.job === 'Director') || {}).name || "Unknown" : "Unknown";
        const cast = credits.cast ? credits.cast.slice(0, 3).map(c => c.name).join(", ") : "Unknown";
        const genres = details.genres ? details.genres.map(g => g.name).join(", ") : "Unknown";
        const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0) || 0;

        return {
            genres,
            director,
            cast,
            overview: details.overview || "No overview available.",
            runtime,
            vote_average: details.vote_average || 0.0,
            release_date: details.release_date || details.first_air_date || "",
            original_language: details.original_language || "en",
            number_of_seasons: details.number_of_seasons || null,
            number_of_episodes: details.number_of_episodes || null,
            seasons: details.seasons || null
        };
    } catch (e) {
        return null;
    }
}

async function setupHomepageCategories() {
    try {
        fetch("/api/movies/trending")
            .then(res => res.json())
            .then(movies => renderMovieRow(movies, "trending-grid"));

        fetch("/api/movies/language/bollywood")
            .then(res => res.json())
            .then(movies => renderMovieRow(movies, "bollywood-grid"));

        fetch("/api/movies/language/hollywood")
            .then(res => res.json())
            .then(movies => renderMovieRow(movies, "hollywood-grid"));

        fetch("/api/movies/genre/Science Fiction")
            .then(res => res.json())
            .then(movies => renderMovieRow(movies, "scifi-grid"));

        fetch("/api/movies/genre/Action")
            .then(res => res.json())
            .then(movies => renderMovieRow(movies, "action-grid"));

        fetch("/api/movies/genre/Comedy")
            .then(res => res.json())
            .then(movies => renderMovieRow(movies, "comedy-grid"));
    } catch (e) {
        console.error("Failed loading categories:", e);
    }
}

/* ==========================================================================
   Web Series Section — Featured cards with Season/Episode info
   ========================================================================== */
async function loadWebSeriesSection() {
    const featuredGrid = document.getElementById("webseries-featured-grid");
    const scrollGrid = document.getElementById("webseries-grid");

    // Load featured series cards
    for (const series of FEATURED_WEB_SERIES) {
        const card = createWebSeriesCard(series);
        featuredGrid.appendChild(card);

        // Load poster asynchronously
        fetchTMDBTVData(series.tmdb_id).then(tvData => {
            if (tvData && tvData.poster_path) {
                const imgEl = card.querySelector(".ws-card-poster-img");
                if (imgEl) {
                    imgEl.src = `${TMDB_IMAGE_BASE}/w342${tvData.poster_path}`;
                }
            }
        });
    }

    // Also load from API for the carousel
    fetch("/api/movies/webseries")
        .then(res => res.json())
        .then(movies => renderMovieRow(movies, "webseries-grid"))
        .catch(() => {
            // Fallback: load the featured series into scroll grid too
            const mapped = FEATURED_WEB_SERIES.map(s => ({
                movie_id: s.tmdb_id,
                title: s.name,
                genres: "TV Series",
                rating: 8.5,
                popularity: 200,
                release_date: s.season_data[0]?.year + "-01-01",
                runtime: 50,
                overview: ""
            }));
            renderMovieRow(mapped, "webseries-grid");
        });
}

function createWebSeriesCard(series) {
    const card = document.createElement("div");
    card.classList.add("ws-featured-card");

    const seasonDataHtml = series.season_data.slice(0, 6).map(s => `
        <div class="season-entry">
            <span class="season-badge">S${s.season}</span>
            <span class="season-eps">${s.episodes} eps</span>
            <span class="season-year">${s.release}</span>
        </div>
    `).join('');

    card.innerHTML = `
        <div class="ws-card-poster">
            <img class="ws-card-poster-img" src="${FALLBACK_POSTER}" alt="${series.name}" loading="lazy">
            <div class="ws-card-overlay">
                <div class="ws-badge"><i class="fa-solid fa-tv"></i> Web Series</div>
                <div class="ws-season-count">${series.seasons} Season${series.seasons > 1 ? 's' : ''} · ${series.episodes} Episodes</div>
            </div>
        </div>
        <div class="ws-card-info">
            <h3 class="ws-card-title">${series.name}</h3>
            <div class="ws-seasons-list">
                <div class="ws-seasons-header">
                    <i class="fa-solid fa-calendar-days"></i> Season Breakdown
                </div>
                <div class="ws-season-entries">
                    ${seasonDataHtml}
                    ${series.season_data.length > 6 ? `<div class="season-more">+${series.season_data.length - 6} more seasons</div>` : ''}
                </div>
            </div>
            <button class="btn btn-primary btn-sm ws-recommend-btn" onclick="getRecommendationsFromTMDB('${series.name.replace(/'/g, "\\'")}', ${series.tmdb_id}, 'tv')">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Find Similar
            </button>
        </div>
    `;

    // Click on poster opens modal
    card.querySelector(".ws-card-poster").addEventListener("click", () => {
        openSeriesModal(series);
    });

    return card;
}

async function openSeriesModal(series) {
    // Fetch live data from TMDB first
    const [tvData, details] = await Promise.all([
        fetchTMDBTVData(series.tmdb_id),
        fetchLiveTMDBDetails(series.tmdb_id, true)
    ]);

    const movieObj = {
        movie_id: series.tmdb_id,
        title: series.name,
        genres: details?.genres || "TV Series",
        rating: tvData?.vote_average || 8.0,
        popularity: tvData?.popularity || 100,
        release_date: series.season_data[0]?.year + "-01-01",
        runtime: 50,
        overview: tvData?.overview || "No overview available.",
        director: details?.director || "Multiple Directors",
        cast: details?.cast || "See series details",
        is_tv: true,
        seasons: series.seasons,
        episodes: series.episodes,
        season_data: series.season_data
    };

    openModal(movieObj);
}

/* ==========================================================================
   Language Detection Helpers
   ========================================================================== */
function detectLanguage(movie) {
    const title = (movie.title || "").toLowerCase();
    const genres = (movie.genres || "").toLowerCase();
    const director = (movie.director || "").toLowerCase();
    const cast = (movie.cast || "").toLowerCase();

    const bollywoodDirectors = ["karan johar", "rajkumar hirani", "sanjay leela bhansali", "anurag kashyap",
        "rohit shetty", "kabir khan", "nitesh tiwari", "imtiaz ali", "shoojit sircar", "vishal bhardwaj",
        "farah khan", "yash chopra", "aditya chopra", "mani ratnam", "ss rajamouli", "s.s. rajamouli",
        "shankar", "priyadarshan", "madhur bhandarkar", "zoya akhtar"];

    const bollywoodActors = ["amitabh", "shahrukh", "salman", "aamir", "deepika", "priyanka", "kangana",
        "ranveer", "ranbir", "kareena", "katrina", "ajay devgn", "akshay kumar", "hrithik", "prabhas",
        "allu arjun", "mahesh babu", "vijay", "thalapathy", "dhanush", "rajinikanth"];

    if (bollywoodDirectors.some(d => director.includes(d))) return { lang: "Hindi", origin: "Bollywood" };
    if (bollywoodActors.some(a => cast.includes(a))) return { lang: "Hindi", origin: "Indian Cinema" };

    return { lang: "English", origin: "Hollywood" };
}

/* ==========================================================================
   Horizontal Carousel Renderer
   ========================================================================== */
function renderMovieRow(movies, gridElementId) {
    const grid = document.getElementById(gridElementId);
    if (!grid) return;
    grid.innerHTML = "";

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.classList.add("movie-card");

        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
        const primaryGenre = movie.genres ? movie.genres.split(",")[0] : "Drama";
        const rating = movie.rating || movie.vote_average || 0.0;
        const movieId = movie.movie_id || movie.id;
        const langInfo = detectLanguage(movie);

        card.innerHTML = `
            <div class="card-poster-wrapper">
                <div class="card-rating-badge"><i class="fa-solid fa-star"></i> ${rating.toFixed(1)}</div>
                <div class="card-lang-badge ${langInfo.origin === 'Bollywood' || langInfo.origin === 'Indian Cinema' ? 'india-lang' : 'english-lang'}">${langInfo.lang}</div>
                <img id="${gridElementId}-poster-${movieId}" src="${FALLBACK_POSTER}" alt="${movie.title}" loading="lazy">
            </div>
            <div class="card-info">
                <h3 class="card-title">${movie.title}</h3>
                <div class="card-meta">
                    <span>${releaseYear}</span>
                    <span class="card-genre">${primaryGenre}</span>
                </div>
            </div>
        `;

        card.addEventListener("click", () => openModal(movie));
        grid.appendChild(card);

        // Load TMDB poster asynchronously
        fetchTMDBData(movieId).then(tmdbData => {
            if (tmdbData && tmdbData.poster_path) {
                const posterImg = document.getElementById(`${gridElementId}-poster-${movieId}`);
                if (posterImg) {
                    posterImg.src = `${TMDB_IMAGE_BASE}/w500${tmdbData.poster_path}`;
                }
            }
        });
    });

    grid.style.display = "flex";
}

/* ==========================================================================
   Search & Autocomplete
   ========================================================================== */
function handleSearchInput() {
    const val = searchInput.value.trim();
    closeAutocomplete();

    if (!val) {
        clearSearchBtn.style.display = "none";
        return;
    }

    clearSearchBtn.style.display = "block";
    activeSuggestionIndex = -1;

    const localMatches = allMovies
        .filter(movie => movie.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5);

    renderAutocompleteItems(localMatches, false);

    if (val.length >= 3) {
        fetchLiveTMDBMatches(val).then(tmdbResults => {
            if (searchInput.value.trim() !== val) return;
            const newTMDBMatches = tmdbResults
                .filter(item => {
                    const title = item.title || item.name;
                    return !localMatches.some(lm => lm.toLowerCase() === title.toLowerCase());
                })
                .slice(0, 5);
            renderAutocompleteItems(newTMDBMatches, true);
        });

        // Also search directors
        if (val.length >= 4) {
            searchDirectorSuggestion(val);
        }
    }
}

async function searchDirectorSuggestion(query) {
    try {
        const res = await fetch(`${TMDB_BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const data = await res.json();
        const directors = (data.results || [])
            .filter(p => p.known_for_department === "Directing")
            .slice(0, 2);

        directors.forEach(person => {
            const existingItems = Array.from(autocompleteList.getElementsByClassName("autocomplete-item"));
            if (existingItems.some(item => item.getAttribute("data-title")?.toLowerCase() === person.name.toLowerCase())) return;

            const item = document.createElement("div");
            item.classList.add("autocomplete-item", "director-autocomplete-item");
            item.setAttribute("data-title", person.name);
            item.setAttribute("data-is-director", "true");
            item.innerHTML = `
                <i class="fa-solid fa-user-tie" style="color: var(--accent-purple); margin-right: 8px;"></i>
                <span>${person.name}</span>
                <span style="font-size: 0.72rem; opacity: 0.55; margin-left: 8px;">Director</span>
            `;
            item.addEventListener("click", () => {
                searchInput.value = "";
                clearSearchBtn.style.display = "none";
                closeAutocomplete();
                searchByDirector(person.name);
            });
            autocompleteList.appendChild(item);
            autocompleteList.style.display = "block";
        });
    } catch (e) {}
}

function renderAutocompleteItems(matches, isLive) {
    if (matches.length === 0 && autocompleteList.children.length === 0) {
        autocompleteList.style.display = "none";
        return;
    }

    const val = searchInput.value.trim();

    matches.forEach((match) => {
        const title = typeof match === 'string' ? match : (match.title || match.name);
        const typeLabel = typeof match === 'string'
            ? ""
            : ` (${match.media_type === 'tv' ? 'Web Series' : 'Global Movie'})`;

        const existingItems = Array.from(autocompleteList.getElementsByClassName("autocomplete-item"));
        if (existingItems.some(item => item.getAttribute("data-title")?.toLowerCase() === title.toLowerCase())) return;

        const item = document.createElement("div");
        item.classList.add("autocomplete-item");
        item.setAttribute("data-title", title);

        if (typeof match !== 'string') {
            item.setAttribute("data-tmdb-id", match.id);
            item.setAttribute("data-tmdb-type", match.media_type);
        }

        const startIndex = title.toLowerCase().indexOf(val.toLowerCase());
        let displayText = title;
        if (startIndex > -1) {
            const beforeText = title.substring(0, startIndex);
            const matchText = title.substring(startIndex, startIndex + val.length);
            const afterText = title.substring(startIndex + val.length);
            displayText = `${beforeText}<strong>${matchText}</strong>${afterText}`;
        }

        const tvIcon = typeof match !== 'string' && match.media_type === 'tv'
            ? `<i class="fa-solid fa-tv" style="color: var(--accent-purple); margin-right: 6px; font-size: 0.75rem;"></i>` : '';

        item.innerHTML = `${tvIcon}<span>${displayText}</span><span style="font-size: 0.72rem; opacity: 0.55; margin-left: 8px; font-weight: 500;">${typeLabel}</span>`;

        item.addEventListener("click", () => {
            searchInput.value = title;
            closeAutocomplete();
            const tmdbId = item.getAttribute("data-tmdb-id");
            const tmdbType = item.getAttribute("data-tmdb-type");
            if (tmdbId && tmdbType) {
                getRecommendationsFromTMDB(title, tmdbId, tmdbType);
            } else {
                getRecommendations(title);
            }
            document.getElementById("recommendations-section").scrollIntoView({ behavior: "smooth" });
        });

        autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = "block";
}

function handleSearchKeydown(e) {
    const items = autocompleteList.getElementsByClassName("autocomplete-item");

    if (e.key === "ArrowDown") {
        if (items.length === 0) return;
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
        highlightSuggestion(items);
    } else if (e.key === "ArrowUp") {
        if (items.length === 0) return;
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
        highlightSuggestion(items);
    } else if (e.key === "Enter") {
        e.preventDefault();
        if (items.length > 0) {
            if (activeSuggestionIndex > -1 && items[activeSuggestionIndex]) {
                items[activeSuggestionIndex].click();
            } else {
                items[0].click();
            }
        } else {
            const val = searchInput.value.trim();
            if (val) {
                closeAutocomplete();
                getRecommendations(val);
                document.getElementById("recommendations-section").scrollIntoView({ behavior: "smooth" });
            }
        }
    } else if (e.key === "Escape") {
        closeAutocomplete();
    }
}

function highlightSuggestion(items) {
    Array.from(items).forEach(item => item.classList.remove("active-item"));
    if (activeSuggestionIndex > -1 && items[activeSuggestionIndex]) {
        items[activeSuggestionIndex].classList.add("active-item");
        items[activeSuggestionIndex].scrollIntoView({ block: "nearest" });
        searchInput.value = items[activeSuggestionIndex].textContent;
    }
}

function closeAutocomplete() {
    autocompleteList.innerHTML = "";
    autocompleteList.style.display = "none";
    activeSuggestionIndex = -1;
}

/* ==========================================================================
   Hero Setup
   ========================================================================== */
async function setupHeroSection() {
    const randomHero = HERO_MOVIES[Math.floor(Math.random() * HERO_MOVIES.length)];
    heroTitle.textContent = randomHero.title;
    heroLangBadge.textContent = randomHero.origin;
    heroLangTag.textContent = randomHero.lang;
    updateHeroWatchlistButton(randomHero.id);

    try {
        const tmdbData = await fetchTMDBData(randomHero.id);
        if (tmdbData) {
            heroTitle.textContent = tmdbData.title;
            heroYear.textContent = new Date(tmdbData.release_date).getFullYear() || "N/A";
            heroRuntime.textContent = `${tmdbData.runtime} min`;
            heroRating.textContent = tmdbData.vote_average.toFixed(1);
            heroOverview.textContent = tmdbData.overview;

            if (tmdbData.backdrop_path) {
                heroBackdrop.style.backgroundImage = `url(${TMDB_IMAGE_BASE}/w1280${tmdbData.backdrop_path})`;
            } else {
                heroBackdrop.style.backgroundImage = `url(${FALLBACK_BACKDROP})`;
            }
        }
    } catch (e) {
        heroBackdrop.style.backgroundImage = `url(${FALLBACK_BACKDROP})`;
    }
}

/* ==========================================================================
   Watchlist Logic
   ========================================================================== */
function renderWatchlist() {
    if (watchlist.length === 0) {
        watchlistEmptyState.style.display = "flex";
        watchlistGrid.style.display = "none";
        return;
    }
    watchlistEmptyState.style.display = "none";
    const watchlistMovies = watchlist.map(m => ({
        movie_id: m.id,
        title: m.title,
        rating: m.rating,
        release_date: m.release_date,
        genres: m.genres
    }));
    renderMovieRow(watchlistMovies, "watchlist-grid");
}

function toggleWatchlist(movie) {
    const movieId = movie.movie_id || movie.id;
    const movieTitle = movie.title;
    const index = watchlist.findIndex(m => m.id === movieId);

    if (index > -1) {
        watchlist.splice(index, 1);
        showToast(`Removed "${movieTitle}" from watchlist`);
    } else {
        watchlist.push({
            id: movieId,
            title: movieTitle,
            rating: movie.rating || movie.vote_average || 0.0,
            release_date: movie.release_date || "",
            genres: movie.genres || ""
        });
        showToast(`Added "${movieTitle}" to watchlist`);
    }

    localStorage.setItem("cinematch_watchlist", JSON.stringify(watchlist));
    renderWatchlist();
}

function isBookmarked(movieId) {
    return watchlist.some(m => m.id === movieId);
}

function updateHeroWatchlistButton(movieId) {
    if (isBookmarked(movieId)) {
        heroWatchlistBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i> Bookmarked`;
        heroWatchlistBtn.classList.add("btn-primary");
        heroWatchlistBtn.classList.remove("btn-secondary");
    } else {
        heroWatchlistBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Add to Watchlist`;
        heroWatchlistBtn.classList.add("btn-secondary");
        heroWatchlistBtn.classList.remove("btn-primary");
    }
}

function updateModalWatchlistButton(movieId) {
    if (isBookmarked(movieId)) {
        modalWatchlistBtn.innerHTML = `<i class="fa-solid fa-bookmark"></i> Remove Watchlist`;
        modalWatchlistBtn.style.backgroundColor = "rgba(255, 42, 59, 0.2)";
        modalWatchlistBtn.style.borderColor = "var(--accent-red)";
    } else {
        modalWatchlistBtn.innerHTML = `<i class="fa-regular fa-bookmark"></i> Add to Watchlist`;
        modalWatchlistBtn.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
        modalWatchlistBtn.style.borderColor = "rgba(255, 255, 255, 0.1)";
    }
}

/* ==========================================================================
   Media Type & Vibe Logic
   ========================================================================== */
function getMediaType(movie) {
    if (movie.is_tv || movie.seasons !== undefined) return "Web Series / TV Show";
    const genres = (movie.genres || "").toLowerCase();
    if (genres.includes("documentary")) return "Documentary";
    const keywords = (movie.keywords || "").toLowerCase();
    const title = (movie.title || "").toLowerCase();
    if (movie.runtime === 0 || keywords.includes("tv series") || title.includes("season")) {
        return "Web Series / TV Show";
    }
    if (movie.runtime && movie.runtime > 0 && movie.runtime < 40) return "Short Film";
    return "Feature Film";
}

function getMovieVibe(movie) {
    const genres = (movie.genres || "").toLowerCase();
    const rating = movie.rating || movie.vote_average || 0.0;
    const popularity = movie.popularity || 0.0;

    let vibe = "🎬 Cinematic Masterpiece";
    let matchScore = 85;

    if (genres.includes("science fiction") || genres.includes("scifi")) vibe = "🌌 Mind-Bending Cosmic Journey";
    else if (genres.includes("action") || genres.includes("adventure")) vibe = "💥 High-Octane Action & Adventure";
    else if (genres.includes("horror") || genres.includes("thriller") || genres.includes("mystery")) vibe = "👻 Heart-Pounding Thrills & Mystery";
    else if (genres.includes("romance")) vibe = "💖 Cozy, Heartwarming Romance";
    else if (genres.includes("drama")) vibe = "🎭 Deeply Emotional & Thought-Provoking";
    else if (genres.includes("comedy")) vibe = "😂 Laugh-Out-Loud Comedy & Entertainment";
    else if (genres.includes("documentary")) vibe = "🧠 Inspiring, Eye-Opening Insights";
    else if (genres.includes("animation") || genres.includes("family")) vibe = "🍿 Perfect Family-Friendly Entertainment";
    else if (genres.includes("history") || genres.includes("war")) vibe = "⚔️ Epic Historical Chronicles";
    else if (movie.is_tv || movie.seasons) vibe = "📺 Must-Watch Binge Series";

    if (movie.similarity_score !== undefined) {
        matchScore = Math.round(movie.similarity_score * 100);
        matchScore = Math.max(70, Math.min(matchScore, 99));
    } else {
        const popularityFactor = Math.min(popularity / 4, 15);
        const ratingFactor = rating * 8;
        matchScore = Math.round(50 + ratingFactor + popularityFactor);
        matchScore = Math.max(65, Math.min(matchScore, 98));
    }

    let color = "#ff2a3b";
    let rgba = "rgba(255, 42, 59, 0.15)";

    if (genres.includes("science fiction")) { color = "#00e5ff"; rgba = "rgba(0, 229, 255, 0.15)"; }
    else if (genres.includes("horror") || genres.includes("mystery") || genres.includes("thriller")) { color = "#a855f7"; rgba = "rgba(168, 85, 247, 0.15)"; }
    else if (genres.includes("romance") || genres.includes("drama")) { color = "#ec4899"; rgba = "rgba(236, 72, 153, 0.15)"; }
    else if (genres.includes("comedy") || genres.includes("animation")) { color = "#f59e0b"; rgba = "rgba(245, 158, 11, 0.15)"; }
    else if (genres.includes("documentary") || genres.includes("history")) { color = "#10b981"; rgba = "rgba(16, 185, 129, 0.15)"; }
    else if (movie.is_tv || movie.seasons) { color = "#8b5cf6"; rgba = "rgba(139, 92, 246, 0.15)"; }

    return { vibe, matchScore, color, rgba };
}

/* ==========================================================================
   Language Detection for Modal
   ========================================================================== */
function getLanguageDisplay(movie) {
    const info = detectLanguage(movie);

    // Additional checks from TMDB language data
    if (movie.original_language) {
        const langMap = {
            'hi': { lang: 'Hindi', origin: 'Bollywood' },
            'ta': { lang: 'Tamil', origin: 'Tollywood' },
            'te': { lang: 'Telugu', origin: 'Tollywood' },
            'ml': { lang: 'Malayalam', origin: 'Mollywood' },
            'bn': { lang: 'Bengali', origin: 'Bengali Cinema' },
            'mr': { lang: 'Marathi', origin: 'Marathi Cinema' },
            'kn': { lang: 'Kannada', origin: 'Sandalwood' },
            'pa': { lang: 'Punjabi', origin: 'Punjabi Cinema' },
            'en': { lang: 'English', origin: 'Hollywood' },
            'fr': { lang: 'French', origin: 'French Cinema' },
            'de': { lang: 'German', origin: 'German Cinema' },
            'ja': { lang: 'Japanese', origin: 'Japanese Cinema' },
            'ko': { lang: 'Korean', origin: 'Korean Cinema' },
            'zh': { lang: 'Chinese', origin: 'Chinese Cinema' },
            'es': { lang: 'Spanish', origin: 'Spanish Cinema' },
            'it': { lang: 'Italian', origin: 'Italian Cinema' }
        };
        if (langMap[movie.original_language]) return langMap[movie.original_language];
    }

    return info;
}

/* ==========================================================================
   Details Modal (with Web Series season info)
   ========================================================================== */
async function openModal(movie) {
    const movieId = movie.movie_id || movie.id;
    currentModalMovie = movie;

    // Reset trailer
    modalVideoContainer.style.display = "none";
    modalPosterContainer.style.display = "block";
    modalPlayTrailerBtn.style.display = "none";
    modalTrailerIframe.src = "";

    let vibeInfo = getMovieVibe(movie);
    let mediaType = getMediaType(movie);

    modal.style.setProperty("--theme-accent", vibeInfo.color);
    modal.style.setProperty("--theme-accent-rgba", vibeInfo.rgba);

    // Basic info
    modalTitle.textContent = movie.title;
    modalGenres.textContent = movie.genres || "Details Loading...";
    modalRating.textContent = (movie.rating || movie.vote_average || 0.0).toFixed(1);
    modalYear.textContent = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
    modalRuntime.textContent = movie.runtime ? `${movie.runtime} min` : "N/A";

    // Director link
    const directorLinkEl = document.getElementById("modal-director-link");
    const directorVal = movie.director || "Loading...";
    directorLinkEl.textContent = directorVal;
    directorLinkEl.onclick = (e) => {
        e.preventDefault();
        if (directorVal !== "Loading..." && directorVal !== "Unknown") {
            closeModal();
            searchByDirector(directorVal);
            document.getElementById("director-results-section").scrollIntoView({ behavior: "smooth" });
        }
    };

    modalCast.textContent = movie.cast || "Loading...";
    modalOverview.textContent = movie.overview || "Loading synopsis...";
    modalMovieType.textContent = mediaType;
    modalVibeTagline.textContent = vibeInfo.vibe;
    modalVibePct.textContent = `${vibeInfo.matchScore}% Match`;

    modalVibeFill.style.width = "0%";
    setTimeout(() => {
        if (currentModalMovie && (currentModalMovie.movie_id === movieId || currentModalMovie.id === movieId)) {
            modalVibeFill.style.width = `${vibeInfo.matchScore}%`;
        }
    }, 150);

    // Language info
    const langInfo = getLanguageDisplay(movie);
    document.getElementById("modal-lang-badge").textContent = langInfo.lang;
    document.getElementById("modal-origin-badge").textContent = langInfo.origin;
    const originEl = document.getElementById("modal-origin-badge");
    originEl.className = "modal-origin-badge";
    if (langInfo.origin.includes("Bollywood") || langInfo.origin.includes("wood") || langInfo.lang !== "English") {
        originEl.classList.add("india-origin");
    }

    // Web Series season info
    const seriesInfoDiv = document.getElementById("modal-series-info");
    const seasonsGrid = document.getElementById("modal-seasons-grid");

    if (movie.is_tv || movie.seasons || movie.season_data) {
        seriesInfoDiv.style.display = "block";
        const seasonData = movie.season_data || [];
        const totalSeasons = movie.seasons || 1;
        const totalEpisodes = movie.episodes || 0;

        let seasonsHtml = `
            <div class="series-summary-row">
                <div class="series-stat"><span class="stat-num">${totalSeasons}</span><span class="stat-label">Seasons</span></div>
                <div class="series-stat"><span class="stat-num">${totalEpisodes || "N/A"}</span><span class="stat-label">Episodes</span></div>
            </div>
        `;

        if (seasonData.length > 0) {
            seasonsHtml += `<div class="modal-seasons-list">`;
            seasonData.forEach(s => {
                seasonsHtml += `
                    <div class="modal-season-row">
                        <span class="modal-season-badge">Season ${s.season}</span>
                        <span class="modal-season-year">${s.release || s.year}</span>
                        <span class="modal-season-eps">${s.episodes} Episodes</span>
                    </div>
                `;
            });
            seasonsHtml += `</div>`;
        }

        seasonsGrid.innerHTML = seasonsHtml;
    } else {
        seriesInfoDiv.style.display = "none";
    }

    modalPoster.src = FALLBACK_POSTER;
    updateModalWatchlistButton(movieId);

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Load poster async
    fetchTMDBData(movieId).then(tmdbData => {
        if (currentModalMovie && (currentModalMovie.movie_id === movieId || currentModalMovie.id === movieId)) {
            if (tmdbData && tmdbData.poster_path) {
                modalPoster.src = `${TMDB_IMAGE_BASE}/w500${tmdbData.poster_path}`;
            }
        }
    });

    // Load trailer async
    fetchTMDBVideos(movieId).then(videos => {
        if (currentModalMovie && (currentModalMovie.movie_id === movieId || currentModalMovie.id === movieId)) {
            const trailer = videos.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));
            if (trailer && trailer.key) {
                modalPlayTrailerBtn.style.display = "flex";
                modalPlayTrailerBtn.onclick = () => {
                    modalPosterContainer.style.display = "none";
                    modalVideoContainer.style.display = "block";
                    modalTrailerIframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
                };
            }
        }
    });

    // Fetch full details if needed
    if (!movie.overview || !movie.cast || !movie.director || movie.cast === "See details" || movie.overview === "No synopsis available" || movie.genres === "Live Recommendation") {
        try {
            let fullMovie = null;
            if (movie.genres !== "Live Recommendation") {
                const response = await fetch(`/api/movie/${movieId}`);
                if (response.ok) fullMovie = await response.json();
            }
            if (!fullMovie) {
                const isTv = movie.is_tv || movie.genres === "Live Recommendation";
                fullMovie = await fetchLiveTMDBDetails(movieId, isTv);
            }

            if (fullMovie && currentModalMovie && (currentModalMovie.movie_id === movieId || currentModalMovie.id === movieId)) {
                movie = { ...movie, ...fullMovie };
                currentModalMovie = movie;

                modalGenres.textContent = movie.genres;
                const dirLink = document.getElementById("modal-director-link");
                const newDir = movie.director || "Unknown";
                dirLink.textContent = newDir;
                dirLink.onclick = (e) => {
                    e.preventDefault();
                    if (newDir !== "Unknown") {
                        closeModal();
                        searchByDirector(newDir);
                        document.getElementById("director-results-section").scrollIntoView({ behavior: "smooth" });
                    }
                };
                modalCast.textContent = movie.cast;
                modalOverview.textContent = movie.overview;
                modalRuntime.textContent = movie.runtime ? `${movie.runtime} min` : "N/A";

                // Update language with actual language code
                if (fullMovie.original_language) {
                    const newLang = getLanguageDisplay({ ...movie, original_language: fullMovie.original_language });
                    document.getElementById("modal-lang-badge").textContent = newLang.lang;
                    document.getElementById("modal-origin-badge").textContent = newLang.origin;
                }

                vibeInfo = getMovieVibe(movie);
                mediaType = getMediaType(movie);

                modal.style.setProperty("--theme-accent", vibeInfo.color);
                modal.style.setProperty("--theme-accent-rgba", vibeInfo.rgba);
                modalMovieType.textContent = mediaType;
                modalVibeTagline.textContent = vibeInfo.vibe;
                modalVibePct.textContent = `${vibeInfo.matchScore}% Match`;
                modalVibeFill.style.width = `${vibeInfo.matchScore}%`;

                // Update series info if we got it from TMDB
                if (fullMovie.number_of_seasons) {
                    seriesInfoDiv.style.display = "block";
                    const seasons = fullMovie.seasons || [];
                    const tmdbSeasons = seasons.filter(s => s.season_number > 0);

                    let seasonsHtml = `
                        <div class="series-summary-row">
                            <div class="series-stat"><span class="stat-num">${fullMovie.number_of_seasons}</span><span class="stat-label">Seasons</span></div>
                            <div class="series-stat"><span class="stat-num">${fullMovie.number_of_episodes || "N/A"}</span><span class="stat-label">Episodes</span></div>
                        </div>
                    `;
                    if (tmdbSeasons.length > 0) {
                        seasonsHtml += `<div class="modal-seasons-list">`;
                        tmdbSeasons.slice(0, 8).forEach(s => {
                            const airDate = s.air_date ? new Date(s.air_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "TBA";
                            seasonsHtml += `
                                <div class="modal-season-row">
                                    <span class="modal-season-badge">Season ${s.season_number}</span>
                                    <span class="modal-season-year">${airDate}</span>
                                    <span class="modal-season-eps">${s.episode_count || "?"} Episodes</span>
                                </div>
                            `;
                        });
                        seasonsHtml += `</div>`;
                    }
                    seasonsGrid.innerHTML = seasonsHtml;
                }
            }
        } catch (e) {
            console.error("Failed fetching detailed movie info:", e);
        }
    }

    // Modal action buttons
    modalRecommendBtn.onclick = () => {
        closeModal();
        getRecommendations(movie.title);
        document.getElementById("recommendations-section").scrollIntoView({ behavior: "smooth" });
    };

    modalWatchlistBtn.onclick = () => {
        toggleWatchlist(movie);
        updateModalWatchlistButton(movieId);
        const featuredMovie = HERO_MOVIES.find(m => m.title === heroTitle.textContent);
        if (featuredMovie && featuredMovie.id === movieId) {
            updateHeroWatchlistButton(featuredMovie.id);
        }
    };

    modalDirectorSearchBtn.onclick = () => {
        const dir = movie.director || document.getElementById("modal-director-link").textContent;
        if (dir && dir !== "Loading..." && dir !== "Unknown") {
            closeModal();
            searchByDirector(dir);
            document.getElementById("director-results-section").scrollIntoView({ behavior: "smooth" });
        } else {
            showToast("Director information not available yet.");
        }
    };
}

function closeModal() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    currentModalMovie = null;
    modalTrailerIframe.src = "";
    modalVideoContainer.style.display = "none";
    modalPosterContainer.style.display = "block";
}

/* ==========================================================================
   UI Helpers
   ========================================================================== */
function showToast(message) {
    const toast = document.createElement("div");
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px;
        background-color: rgba(16, 16, 22, 0.95);
        border-left: 4px solid var(--accent-red);
        color: var(--text-primary);
        padding: 1.1rem 1.8rem;
        border-radius: 12px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.6);
        z-index: 3000;
        font-family: var(--font-heading);
        font-weight: 600;
        font-size: 0.95rem;
        display: flex;
        align-items: center;
        gap: 0.6rem;
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        backdrop-filter: blur(20px);
    `;
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-red);"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => { toast.style.transform = "translateY(0)"; toast.style.opacity = "1"; }, 10);
    setTimeout(() => {
        toast.style.transform = "translateY(20px)";
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 450);
    }, 3000);
}
