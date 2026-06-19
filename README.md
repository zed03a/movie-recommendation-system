<div align="center">

# 🎬 CineMatch
### AI-Powered Movie & Web Series Recommendation System

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://themoviedb.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

> **A premium, Netflix-inspired movie & web series recommendation engine built with NLP (TF-IDF + Cosine Similarity), FastAPI, and live TMDB integration.**

![CineMatch Banner](https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1280&auto=format&fit=crop)

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Recommendations** | TF-IDF vectorizer + Cosine Similarity NLP model for content-based movie recommendations |
| 🖼️ **Live Posters** | Real movie & series posters fetched dynamically from TMDB API |
| 🇮🇳 **Indian Cinema** | Dedicated Bollywood / Tollywood / Kollywood section with language tags (Hindi, Tamil, Telugu, Malayalam, etc.) |
| 🎬 **Hollywood Section** | Top global English-language films with language availability tags |
| 📺 **Web Series** | Featured series cards with full **season-by-season breakdown** — episodes & release dates per season |
| 🔍 **Director Search** | Search any movie/series by director name — local DB + live TMDB people search fallback |
| 🌐 **Language Detection** | Language & origin badges on every movie card and in detail modals |
| 🎞️ **Trailer Player** | Embedded YouTube trailer playback directly in the detail modal |
| 📌 **Watchlist** | Save movies to a personal watchlist stored in browser localStorage |
| ⚡ **Live TMDB Fallback** | If a movie isn't in the local DB, fetches it live from TMDB |

---

## 🖥️ Screenshots

<table>
  <tr>
    <td align="center"><b>🏠 Hero Section</b></td>
    <td align="center"><b>📺 Web Series with Seasons</b></td>
  </tr>
  <tr>
    <td><img src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500" width="400"/></td>
    <td><img src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=500" width="400"/></td>
  </tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

- Python **3.10+**
- TMDB Dataset CSVs (see step 2 below)
- Internet connection (for live TMDB API calls)

### 1. Clone the Repository

```bash
git clone https://github.com/zed03a/movie-recommendation-system.git
cd movie-recommendation-system
```

### 2. Download the TMDB Dataset

The large CSV files are excluded from this repo (`.gitignore`). Download them from Kaggle:

👉 **[TMDB 5000 Movie Dataset](https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata)**

Download and place these two files in the project root:
```
tmdb_5000_movies.csv
tmdb_5000_credits.csv
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Preprocess the Dataset

Run the preprocessing script to generate `movies_cleaned.csv`:

```bash
python download_and_process.py
```

### 5. Run the App

```bash
python app.py
```

Open your browser at **[http://127.0.0.1:8000](http://127.0.0.1:8000)** 🎉

---

## 🗂️ Project Structure

```
movie-recommendation-system/
│
├── app.py                      # FastAPI backend — all API routes
├── database.py                 # Database helper utilities
├── download_and_process.py     # Data cleaning & NLP preprocessing
├── requirements.txt            # Python dependencies
│
├── static/
│   ├── index.html              # Main frontend (Netflix-style UI)
│   ├── main.js                 # All JS logic — search, modals, TMDB API
│   └── style.css               # Full CSS design system (dark glassmorphic)
│
└── .gitignore
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the frontend |
| `GET` | `/api/movies` | All movie titles (for autocomplete) |
| `GET` | `/api/recommend?title={title}` | NLP-based recommendations |
| `GET` | `/api/movie/{id}` | Single movie details by ID |
| `GET` | `/api/movies/trending` | Top 12 most popular movies |
| `GET` | `/api/movies/genre/{genre}` | Movies by genre |
| `GET` | `/api/movies/director/{name}` | All films by a specific director |
| `GET` | `/api/movies/language/bollywood` | Indian / Bollywood cinema |
| `GET` | `/api/movies/language/hollywood` | Top Hollywood films |
| `GET` | `/api/movies/webseries` | Web series / TV shows |

---

## 🧠 How the Recommendation Model Works

```
Movie Tags (genres + cast + director + keywords + overview)
        ↓
TF-IDF Vectorizer  →  5000-feature sparse matrix
        ↓
Cosine Similarity  →  similarity[i][j] ∈ [0, 1]
        ↓
Top 6 most similar movies (excluding self)
```

1. **Tag Generation** — Each movie's metadata (genres, cast, director, keywords, overview) is combined into a single `tags` string during preprocessing.
2. **TF-IDF Vectorization** — The `TfidfVectorizer` converts tags into a 5000-feature matrix, weighing rare but important terms higher.
3. **Cosine Similarity** — A similarity matrix is computed at startup. Each recommendation is the highest-scoring match for the queried movie.

---

## 🌐 TMDB Live Fallback

If a movie/series **isn't in the local dataset**, CineMatch automatically:
1. Searches TMDB's live multi-search API
2. Fetches recommendations for the top match
3. Displays them with full poster, rating, and metadata

This means **any movie or web series** — even ones not in the TMDB 5000 dataset — can be searched!

---

## 🎭 Web Series — Season Info

CineMatch includes **8 featured web series** with full season breakdowns:

| Series | Seasons | Episodes |
|---|---|---|
| Breaking Bad | 5 | 62 |
| Game of Thrones | 8 | 73 |
| Stranger Things | 4 | 34 |
| The Boys | 4 | 32 |
| Rick and Morty | 7 | 71 |
| Chernobyl | 1 | 5 |
| Kota Factory | 3 | 17 |
| Hawkeye | 1 | 6 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python, FastAPI, Uvicorn |
| **ML / NLP** | scikit-learn (TF-IDF + Cosine Similarity), pandas, numpy |
| **Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **External API** | TMDB API v3 |
| **Fonts** | Google Fonts (Outfit + Inter) |
| **Icons** | FontAwesome 6 |

---

## 👤 Author

**zed03a**
- GitHub: [@zed03a](https://github.com/zed03a)
- Project: [movie-recommendation-system](https://github.com/zed03a/movie-recommendation-system)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**⭐ If you found this useful, please star the repo!**

Made with ❤️ as a College Minor Project — Machine Learning & Web Engineering

</div>
