import os
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="CineMatch - Movie & Series Recommendation System")

# Ensure dataset is preprocessed
CLEANED_FILE = "movies_cleaned.csv"
if not os.path.exists(CLEANED_FILE):
    print("Cleaned movie dataset not found! Running data preprocessing first...")
    try:
        import download_and_process
        download_and_process.main()
    except Exception as e:
        print(f"Error preprocessing data: {e}")
        raise RuntimeError("Could not find or create dataset")

# Load processed movies metadata
print("Loading movie dataset...")
df = pd.read_csv(CLEANED_FILE)
df['tags'] = df['tags'].fillna('')
df['director_display'] = df['director_display'].fillna('')
df['cast_display'] = df['cast_display'].fillna('')
df['genres_display'] = df['genres_display'].fillna('')
df['overview'] = df['overview'].fillna('')

# Compute NLP model (TF-IDF & Cosine Similarity)
print("Computing TF-IDF Vectorizer and Cosine Similarity Matrix...")
tfidf = TfidfVectorizer(max_features=5000, stop_words='english')
tfidf_matrix = tfidf.fit_transform(df['tags'])
similarity = cosine_similarity(tfidf_matrix)
print("Model built and ready!")

# Create static directory if it does not exist
if not os.path.exists("static"):
    os.makedirs("static")

# Expose static folder
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    """Serves the main frontend page."""
    index_path = os.path.join("static", "index.html")
    if not os.path.exists(index_path):
        return {"status": "success", "message": "FastAPI is running! Place index.html in the static folder."}
    return FileResponse(index_path)

@app.get("/api/movies")
def get_all_movies():
    """Returns a list of all movie titles for autocompletion."""
    return list(df['title'].values)

def serialize_row(row, similarity_score=None):
    result = {
        "movie_id": int(row['movie_id']),
        "title": str(row['title']),
        "genres": str(row['genres_display']),
        "cast": str(row['cast_display']),
        "director": str(row['director_display']),
        "overview": str(row['overview']),
        "rating": float(row['vote_average']),
        "popularity": float(row['popularity']),
        "release_date": str(row['release_date']),
        "runtime": float(row['runtime']) if not pd.isna(row['runtime']) else 0.0,
    }
    if similarity_score is not None:
        result["similarity_score"] = float(similarity_score)
    return result

def serialize_movies(dataframe):
    results = []
    for _, row in dataframe.iterrows():
        results.append(serialize_row(row))
    return results

@app.get("/api/recommend")
def recommend_movies(title: str):
    """
    Accepts a movie title, finds the most similar movies using cosine similarity,
    and returns their metadata.
    """
    title_clean = title.strip().lower()

    # Try exact match (case insensitive)
    match = df[df['title'].str.lower() == title_clean]

    if match.empty:
        # Try substring match
        match = df[df['title'].str.lower().str.contains(title_clean, na=False)]
        if match.empty:
            raise HTTPException(status_code=404, detail=f"Movie '{title}' not found in database.")

    movie_index = match.index[0]
    movie_title = df.iloc[movie_index]['title']

    # Retrieve similarity scores
    distances = similarity[movie_index]

    # Sort and slice top 6 (excluding itself)
    recommended_list = sorted(list(enumerate(distances)), key=lambda x: x[1], reverse=True)[1:7]

    results = []
    for idx, score in recommended_list:
        row = df.iloc[idx]
        results.append(serialize_row(row, score))

    searched_row = df.iloc[movie_index]
    searched_details = serialize_row(searched_row)

    return {
        "searched_movie": movie_title,
        "searched_movie_details": searched_details,
        "recommendations": results
    }

@app.get("/api/movie/{movie_id}")
def get_movie_by_id(movie_id: int):
    """Retrieves detailed information for a single movie by ID."""
    match = df[df['movie_id'] == movie_id]
    if match.empty:
        raise HTTPException(status_code=404, detail="Movie ID not found.")
    row = match.iloc[0]
    return serialize_row(row)

@app.get("/api/movies/trending")
def get_trending_movies():
    """Returns the top 12 most popular movies for homepage categories."""
    trending = df.sort_values(by='popularity', ascending=False).head(12)
    return serialize_movies(trending)

@app.get("/api/movies/genre/{genre}")
def get_movies_by_genre(genre: str):
    """Filters and returns the top 12 popular movies of a specific genre."""
    filtered = df[df['genres_display'].str.contains(genre, case=False, na=False)]
    genre_movies = filtered.sort_values(by='popularity', ascending=False).head(12)
    return serialize_movies(genre_movies)

@app.get("/api/movies/director/{director_name}")
def get_movies_by_director(director_name: str):
    """
    Search and return all movies/series by a specific director name.
    Case-insensitive partial match supported.
    """
    director_clean = director_name.strip()
    filtered = df[df['director_display'].str.contains(director_clean, case=False, na=False)]
    if filtered.empty:
        raise HTTPException(status_code=404, detail=f"No movies found for director '{director_name}'.")
    results = filtered.sort_values(by='popularity', ascending=False).head(20)
    return {
        "director": director_clean,
        "count": len(results),
        "movies": serialize_movies(results)
    }

@app.get("/api/movies/language/bollywood")
def get_bollywood_movies():
    """
    Returns top popular Indian/Bollywood movies.
    Filters by known Bollywood directors and genres.
    """
    bollywood_directors = [
        "Karan Johar", "Rajkumar Hirani", "Sanjay Leela Bhansali", "Anurag Kashyap",
        "Zoya Akhtar", "Rohit Shetty", "Kabir Khan", "Nitesh Tiwari", "Vishal Bhardwaj",
        "Shoojit Sircar", "Imtiaz Ali", "Farah Khan", "David Dhawan", "Ramesh Sippy",
        "Yash Chopra", "Aditya Chopra", "Madhur Bhandarkar", "Mani Ratnam",
        "Priyadarshan", "S.S. Rajamouli", "Shankar", "Gautham Menon"
    ]
    # Build a regex pattern from known directors
    pattern = '|'.join(bollywood_directors)
    filtered = df[df['director_display'].str.contains(pattern, case=False, na=False)]

    # Also include some by known Bollywood keywords in overview/tags
    bollywood_keywords = df[df['tags'].str.contains(
        r'\b(india|bollywood|hindi|mumbai|delhi|maharashtra|pakistan|amitabh|shahrukh|salman|aamir|deepika|priyanka|kangana)\b',
        case=False, na=False
    )]

    combined = pd.concat([filtered, bollywood_keywords]).drop_duplicates(subset='movie_id')
    result = combined.sort_values(by='popularity', ascending=False).head(12)
    return serialize_movies(result)

@app.get("/api/movies/language/hollywood")
def get_hollywood_movies():
    """
    Returns top popular Hollywood English movies.
    """
    top = df.sort_values(by='popularity', ascending=False)
    return serialize_movies(top.head(12))

@app.get("/api/movies/webseries")
def get_web_series():
    """
    Returns popular web series / TV-style titles from the dataset.
    These are identified by short runtimes (under 60 min) or TV-linked keywords.
    """
    tv_keywords = ['series', 'season', 'episode', 'sitcom', 'miniseries', 'tv', 'show', 'web']
    pattern = '|'.join(tv_keywords)
    filtered = df[df['tags'].str.contains(pattern, case=False, na=False)]
    result = filtered.sort_values(by='popularity', ascending=False).head(12)
    return serialize_movies(result)

if __name__ == "__main__":
    import uvicorn
    print("Starting CineMatch FastAPI server on http://127.0.0.1:8000")
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
