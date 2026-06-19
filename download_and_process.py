import os
import urllib.request
import pandas as pd
import ast
import json

# Configuration for datasets
MOVIES_URLS = [
    "https://raw.githubusercontent.com/vamshi121/TMDB-5000-Movie-Dataset/master/tmdb_5000_movies.csv",
    "https://raw.githubusercontent.com/noahjett/Movie-Goodreads-Analysis/master/tmdb_5000_movies.csv"
]
CREDITS_URLS = [
    "https://raw.githubusercontent.com/noahjett/Movie-Goodreads-Analysis/master/tmdb_5000_credits.csv",
    "https://raw.githubusercontent.com/vamshi121/TMDB-5000-Movie-Dataset/master/tmdb_5000_credits.csv"
]

MOVIES_FILE = "tmdb_5000_movies.csv"
CREDITS_FILE = "tmdb_5000_credits.csv"
CLEANED_FILE = "movies_cleaned.csv"

def download_file(urls, filename):
    if not os.path.exists(filename):
        success = False
        last_error = None
        for url in urls:
            print(f"Downloading {filename} from {url}...")
            try:
                # Simple progress download
                def progress(block_num, block_size, total_size):
                    percent = int(block_num * block_size * 100 / total_size)
                    print(f"\rDownloading: {percent}% completed", end="")
                
                urllib.request.urlretrieve(url, filename, progress)
                print(f"\nSuccessfully downloaded {filename}.")
                success = True
                break
            except Exception as e:
                print(f"\nFailed to download from {url}: {e}")
                last_error = e
                # Clean up partial files if created
                if os.path.exists(filename):
                    try:
                        os.remove(filename)
                    except:
                        pass
        if not success:
            print(f"Could not download {filename} from any of the provided URLs.")
            if last_error:
                raise last_error
            else:
                raise Exception(f"Download failed for {filename}")
    else:
        print(f"{filename} already exists. Skipping download.")

def convert_genres_keywords(obj):
    L = []
    try:
        for i in ast.literal_eval(obj):
            L.append(i['name'])
    except Exception:
        pass
    return L

def convert_cast(obj):
    L = []
    try:
        counter = 0
        for i in ast.literal_eval(obj):
            if counter < 3:
                L.append(i['name'])
                counter += 1
            else:
                break
    except Exception:
        pass
    return L

def fetch_director(obj):
    L = []
    try:
        for i in ast.literal_eval(obj):
            if i['job'] == 'Director':
                L.append(i['name'])
                break
    except Exception:
        pass
    return L

def convert_languages(obj):
    if pd.isna(obj):
        return "English"
    L = []
    try:
        if isinstance(obj, str):
            for i in ast.literal_eval(obj):
                L.append(i['name'])
        elif isinstance(obj, list):
            for i in obj:
                if isinstance(i, dict) and 'name' in i:
                    L.append(i['name'])
    except Exception:
        pass
    return ", ".join(L) if L else "English"

def clean_spaces(list_data):
    return [i.replace(" ", "") for i in list_data]

def main():
    # 1. Download files
    download_file(MOVIES_URLS, MOVIES_FILE)
    download_file(CREDITS_URLS, CREDITS_FILE)
    
    # 2. Load and merge files
    print("Loading datasets into Pandas...")
    movies = pd.read_csv(MOVIES_FILE)
    credits = pd.read_csv(CREDITS_FILE)
    
    # Merge datasets on 'title'
    print("Merging datasets on title...")
    movies = movies.merge(credits, on='title')
    
    # Select columns of interest
    movies = movies[['id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew', 'vote_average', 'popularity', 'release_date', 'runtime', 'spoken_languages']]
    
    # Drop rows with null essential columns
    movies.dropna(subset=['overview', 'release_date'], inplace=True)
    
    print("Preprocessing JSON columns...")
    # Extract clean text representations of JSON features
    movies['genres_list'] = movies['genres'].apply(convert_genres_keywords)
    movies['keywords_list'] = movies['keywords'].apply(convert_genres_keywords)
    movies['cast_list'] = movies['cast'].apply(convert_cast)
    movies['director_list'] = movies['crew'].apply(fetch_director)
    movies['languages'] = movies['spoken_languages'].apply(convert_languages)
    
    # Store clean tags for vectorization (spaces stripped)
    movies['genres_clean'] = movies['genres_list'].apply(clean_spaces)
    movies['keywords_clean'] = movies['keywords_list'].apply(clean_spaces)
    movies['cast_clean'] = movies['cast_list'].apply(clean_spaces)
    movies['director_clean'] = movies['director_list'].apply(clean_spaces)
    
    # Split overview text into list of words
    movies['overview_list'] = movies['overview'].apply(lambda x: x.split() if isinstance(x, str) else [])
    
    # Create combined tags (boosting metadata relative to overview text)
    print("Generating tags...")
    movies['tags_list'] = (
        movies['overview_list'] + 
        (movies['genres_clean'] * 3) + 
        (movies['keywords_clean'] * 2) + 
        (movies['cast_clean'] * 2) + 
        (movies['director_clean'] * 4)
    )
    
    # Join list of tags into a single text block
    movies['tags'] = movies['tags_list'].apply(lambda x: " ".join(x).lower())
    
    # Clean display fields for the UI
    movies['genres_display'] = movies['genres_list'].apply(lambda x: ", ".join(x))
    movies['cast_display'] = movies['cast_list'].apply(lambda x: ", ".join(x))
    movies['director_display'] = movies['director_list'].apply(lambda x: ", ".join(x) if x else "Unknown")
    
    # Add media fields default values for TMDB movies
    movies['media_type'] = 'movie'
    movies['seasons'] = None
    movies['episodes'] = None
    movies['season_details'] = None
    
    # Select finalized columns for the web application
    final_df = movies[[
        'id', 
        'title', 
        'tags', 
        'genres_display', 
        'cast_display', 
        'director_display', 
        'overview', 
        'vote_average', 
        'popularity', 
        'release_date', 
        'runtime',
        'languages',
        'media_type',
        'seasons',
        'episodes',
        'season_details'
    ]]
    
    # Rename 'id' to 'movie_id'
    final_df = final_df.rename(columns={'id': 'movie_id'})
    
    # Curated web series and movies catalogue (Hollywood and India)
    # Includes seasons details JSON-serialized lists of objects: [{"season_number": X, "episode_count": Y, "release_year": Z}]
    additional_catalogue = [
        # --- Hollywood TV Series ---
        {
            "movie_id": 1396,
            "title": "Breaking Bad",
            "tags": "drama crime thriller bryancranston aaronpaul annagunn vincegilligan chemistry teacher methamphetamine drug cartel new mexico breaking bad tv series show seasons episodes english",
            "genres_display": "Drama, Crime, Thriller",
            "cast_display": "Bryan Cranston, Aaron Paul, Anna Gunn",
            "director_display": "Vince Gilligan",
            "overview": "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future.",
            "vote_average": 9.5,
            "popularity": 250.0,
            "release_date": "2008-01-20",
            "runtime": 49.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 5,
            "episodes": 62,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 7, "release_year": "2008"},
                {"season_number": 2, "episode_count": 13, "release_year": "2009"},
                {"season_number": 3, "episode_count": 13, "release_year": "2010"},
                {"season_number": 4, "episode_count": 13, "release_year": "2011"},
                {"season_number": 5, "episode_count": 16, "release_year": "2012"}
            ])
        },
        {
            "movie_id": 1399,
            "title": "Game of Thrones",
            "tags": "action adventure drama fantasy emiliaclarke kitharington peterdinklage davidbenioff d.b.weiss westeros iron throne winter is coming white walkers dragons game of thrones tv series show seasons episodes english",
            "genres_display": "Action, Adventure, Drama, Fantasy",
            "cast_display": "Emilia Clarke, Kit Harington, Peter Dinklage",
            "director_display": "David Benioff, D.B. Weiss",
            "overview": "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
            "vote_average": 9.2,
            "popularity": 280.0,
            "release_date": "2011-04-17",
            "runtime": 57.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 8,
            "episodes": 73,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 10, "release_year": "2011"},
                {"season_number": 2, "episode_count": 10, "release_year": "2012"},
                {"season_number": 3, "episode_count": 10, "release_year": "2013"},
                {"season_number": 4, "episode_count": 10, "release_year": "2014"},
                {"season_number": 5, "episode_count": 10, "release_year": "2015"},
                {"season_number": 6, "episode_count": 10, "release_year": "2016"},
                {"season_number": 7, "episode_count": 7, "release_year": "2017"},
                {"season_number": 8, "episode_count": 6, "release_year": "2018"}
            ])
        },
        {
            "movie_id": 1668,
            "title": "Friends",
            "tags": "comedy romance jenniferaniston courteneycox matthewperry davidcrane martakauffman new york city manhattan coffee house central perk roommates friends sitcom comedy hits tv series show seasons episodes english",
            "genres_display": "Comedy, Romance",
            "cast_display": "Jennifer Aniston, Courteney Cox, Matthew Perry",
            "director_display": "David Crane, Marta Kauffman",
            "overview": "Follow the personal and professional lives of six twenty to thirty-something-year-old friends living in the borough of Manhattan in New York City.",
            "vote_average": 8.9,
            "popularity": 190.0,
            "release_date": "1994-09-22",
            "runtime": 22.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 10,
            "episodes": 236,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 24, "release_year": "1994"},
                {"season_number": 2, "episode_count": 24, "release_year": "1995"},
                {"season_number": 3, "episode_count": 25, "release_year": "1996"},
                {"season_number": 4, "episode_count": 24, "release_year": "1997"},
                {"season_number": 5, "episode_count": 24, "release_year": "1998"},
                {"season_number": 6, "episode_count": 25, "release_year": "1999"},
                {"season_number": 7, "episode_count": 24, "release_year": "2000"},
                {"season_number": 8, "episode_count": 24, "release_year": "2001"},
                {"season_number": 9, "episode_count": 24, "release_year": "2002"},
                {"season_number": 10, "episode_count": 18, "release_year": "2003"}
            ])
        },
        {
            "movie_id": 2316,
            "title": "The Office",
            "tags": "comedy stevecarell johnkrasinski jennafischer gregdaniels mockumentary dunder mifflin paper company scranton michael scott jim halpert pam beesly the office comedy hits tv series show seasons episodes english",
            "genres_display": "Comedy",
            "cast_display": "Steve Carell, John Krasinski, Jenna Fischer",
            "director_display": "Greg Daniels",
            "overview": "A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.",
            "vote_average": 9.0,
            "popularity": 185.0,
            "release_date": "2005-03-24",
            "runtime": 22.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 9,
            "episodes": 201,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 6, "release_year": "2005"},
                {"season_number": 2, "episode_count": 22, "release_year": "2005"},
                {"season_number": 3, "episode_count": 25, "release_year": "2006"},
                {"season_number": 4, "episode_count": 19, "release_year": "2007"},
                {"season_number": 5, "episode_count": 28, "release_year": "2008"},
                {"season_number": 6, "episode_count": 26, "release_year": "2009"},
                {"season_number": 7, "episode_count": 26, "release_year": "2010"},
                {"season_number": 8, "episode_count": 24, "release_year": "2011"},
                {"season_number": 9, "episode_count": 25, "release_year": "2012"}
            ])
        },
        {
            "movie_id": 19885,
            "title": "Sherlock",
            "tags": "drama crime mystery benedictcumberbatch martinfreeman rupertgraves stevenmoffat markgatiss detective sherlock holmes john watson baker street london modern sherlock tv series show seasons episodes english",
            "genres_display": "Drama, Crime, Mystery",
            "cast_display": "Benedict Cumberbatch, Martin Freeman, Rupert Graves",
            "director_display": "Steven Moffat, Mark Gatiss",
            "overview": "A modern update finds the famous sleuth and his doctor partner solving crime in 21st century London.",
            "vote_average": 9.1,
            "popularity": 140.0,
            "release_date": "2010-07-25",
            "runtime": 90.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 4,
            "episodes": 13,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 3, "release_year": "2010"},
                {"season_number": 2, "episode_count": 3, "release_year": "2012"},
                {"season_number": 3, "episode_count": 3, "release_year": "2014"},
                {"season_number": 4, "episode_count": 4, "release_year": "2017"}
            ])
        },
        {
            "movie_id": 87108,
            "title": "Chernobyl",
            "tags": "drama history thriller jaredharris stellanskarsgard emilywatson craigmazin nuclear power plant disaster radiation ussr ukraine chernobyl tv series show seasons episodes english",
            "genres_display": "Drama, History, Thriller",
            "cast_display": "Jared Harris, Stellan Skarsgård, Emily Watson",
            "director_display": "Craig Mazin",
            "overview": "The dramatization of the true story of one of the worst man-made catastrophes in history, the Chernobyl nuclear power plant disaster in the USSR, and the sacrifices made to save Europe from unimaginable disaster.",
            "vote_average": 9.4,
            "popularity": 130.0,
            "release_date": "2019-05-06",
            "runtime": 60.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 1,
            "episodes": 5,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 5, "release_year": "2019"}
            ])
        },
        {
            "movie_id": 70523,
            "title": "Dark",
            "tags": "science fiction mystery thriller louishofmann olivermasucci jordistriebel baranboodar jantjefriese time travel winden caves missing children parallel dimensions dark tv series show seasons episodes german english",
            "genres_display": "Science Fiction, Mystery, Thriller",
            "cast_display": "Louis Hofmann, Oliver Masucci, Jördis Triebel",
            "director_display": "Baran bo Odar, Jantje Friese",
            "overview": "A family saga with a supernatural twist, set in a German town where the disappearance of two young children exposes the relationships among four families.",
            "vote_average": 8.7,
            "popularity": 145.0,
            "release_date": "2017-12-01",
            "runtime": 60.0,
            "languages": "German, English",
            "media_type": "tv",
            "seasons": 3,
            "episodes": 26,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 10, "release_year": "2017"},
                {"season_number": 2, "episode_count": 8, "release_year": "2019"},
                {"season_number": 3, "episode_count": 8, "release_year": "2020"}
            ])
        },
        {
            "movie_id": 66732,
            "title": "Stranger Things",
            "tags": "science fiction drama mystery milliebobbybrown finnwolfhard winonaryder thedufferbrothers upside down demogorgon eleven hawkins indiana stranger things tv series show seasons episodes english",
            "genres_display": "Science Fiction, Drama, Mystery",
            "cast_display": "Millie Bobby Brown, Finn Wolfhard, Winona Ryder",
            "director_display": "The Duffer Brothers",
            "overview": "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
            "vote_average": 9.0,
            "popularity": 270.0,
            "release_date": "2016-07-15",
            "runtime": 50.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 4,
            "episodes": 34,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 8, "release_year": "2016"},
                {"season_number": 2, "episode_count": 9, "release_year": "2017"},
                {"season_number": 3, "episode_count": 8, "release_year": "2019"},
                {"season_number": 4, "episode_count": 9, "release_year": "2022"}
            ])
        },
        {
            "movie_id": 100088,
            "title": "The Last of Us",
            "tags": "action adventure drama science fiction pedropascal bellaramsey gabrielluna craigmazin neildruckmann post-apocalyptic cordyceps infection clickers joel ellie zombie the last of us tv series show seasons episodes english",
            "genres_display": "Action, Adventure, Drama, Science Fiction",
            "cast_display": "Pedro Pascal, Bella Ramsey, Gabriel Luna",
            "director_display": "Craig Mazin, Neil Druckmann",
            "overview": "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
            "vote_average": 8.8,
            "popularity": 220.0,
            "release_date": "2023-01-15",
            "runtime": 50.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 1,
            "episodes": 9,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 9, "release_year": "2023"}
            ])
        },
        {
            "movie_id": 93405,
            "title": "Squid Game",
            "tags": "action drama mystery thriller leejungjae parkhaesoo wihajun hwangdonghyuk survival games high stakes money debt red light green light squid game tv series show seasons episodes korean english",
            "genres_display": "Action, Drama, Mystery, Thriller",
            "cast_display": "Lee Jung-jae, Park Hae-soo, Wi Ha-jun",
            "director_display": "Hwang Dong-hyuk",
            "overview": "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
            "vote_average": 8.3,
            "popularity": 210.0,
            "release_date": "2021-09-17",
            "runtime": 55.0,
            "languages": "Korean, English",
            "media_type": "tv",
            "seasons": 1,
            "episodes": 9,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 9, "release_year": "2021"}
            ])
        },
        {
            "movie_id": 119051,
            "title": "Wednesday",
            "tags": "comedy fantasy mystery family jennaortega gwendolinechristie rikilindhome timburton wednesday addams nevermore academy thing monsters gothic wednesday tv series show seasons episodes english",
            "genres_display": "Comedy, Fantasy, Mystery, Family",
            "cast_display": "Jenna Ortega, Gwendoline Christie, Riki Lindhome",
            "director_display": "Tim Burton",
            "overview": "A sleuthing, supernaturally infused mystery charting Wednesday Addams' years as a student at Nevermore Academy.",
            "vote_average": 8.5,
            "popularity": 195.0,
            "release_date": "2022-11-23",
            "runtime": 45.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 1,
            "episodes": 8,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 8, "release_year": "2022"}
            ])
        },
        {
            "movie_id": 76331,
            "title": "Succession",
            "tags": "drama comedy briancox jeremystrong sarahsnook jessearmstrong family business media empire corporate warfare succession tv series show seasons episodes english",
            "genres_display": "Drama, Comedy",
            "cast_display": "Brian Cox, Jeremy Strong, Sarah Snook",
            "director_display": "Jesse Armstrong",
            "overview": "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
            "vote_average": 9.0,
            "popularity": 160.0,
            "release_date": "2018-06-03",
            "runtime": 60.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 4,
            "episodes": 39,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 10, "release_year": "2018"},
                {"season_number": 2, "episode_count": 10, "release_year": "2019"},
                {"season_number": 3, "episode_count": 9, "release_year": "2021"},
                {"season_number": 4, "episode_count": 10, "release_year": "2023"}
            ])
        },
        {
            "movie_id": 82856,
            "title": "The Mandalorian",
            "tags": "action adventure science fiction fantasy pedropascal carlweathers giancarloesposito jonfavreau star wars baby yoda grogu bounty hunter space opera the mandalorian tv series show seasons episodes english",
            "genres_display": "Action, Adventure, Science Fiction, Fantasy",
            "cast_display": "Pedro Pascal, Carl Weathers, Giancarlo Esposito",
            "director_display": "Jon Favreau",
            "overview": "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
            "vote_average": 8.7,
            "popularity": 180.0,
            "release_date": "2019-11-12",
            "runtime": 40.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 3,
            "episodes": 24,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 8, "release_year": "2019"},
                {"season_number": 2, "episode_count": 8, "release_year": "2020"},
                {"season_number": 3, "episode_count": 8, "release_year": "2023"}
            ])
        },
        {
            "movie_id": 94997,
            "title": "House of the Dragon",
            "tags": "action adventure drama fantasy paddyconsidine mattsmith emmadarcy ryancondal georgerrmartin house targaryen dragons iron throne westeros civil war dance of dragons house of the dragon tv series show seasons episodes english",
            "genres_display": "Action, Adventure, Drama, Fantasy",
            "cast_display": "Paddy Considine, Matt Smith, Emma D'Arcy",
            "director_display": "Ryan Condal, George R.R. Martin",
            "overview": "An internal succession war within House Targaryen at the height of its power, 172 years before the birth of Daenerys Targaryen.",
            "vote_average": 8.4,
            "popularity": 240.0,
            "release_date": "2022-08-21",
            "runtime": 60.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 2,
            "episodes": 18,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 10, "release_year": "2022"},
                {"season_number": 2, "episode_count": 8, "release_year": "2024"}
            ])
        },
        {
            "movie_id": 95396,
            "title": "Severance",
            "tags": "science fiction drama mystery adamscott patriciaarquette johnturturro benstiller danerickson lumon industries work life balance memories surgery mind control thriller severance tv series show seasons episodes english",
            "genres_display": "Science Fiction, Drama, Mystery",
            "cast_display": "Adam Scott, Patricia Arquette, John Turturro",
            "director_display": "Ben Stiller, Dan Erickson",
            "overview": "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
            "vote_average": 8.6,
            "popularity": 135.0,
            "release_date": "2022-02-17",
            "runtime": 47.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 1,
            "episodes": 9,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 9, "release_year": "2022"}
            ])
        },
        {
            "movie_id": 60625,
            "title": "Fargo",
            "tags": "crime drama thriller billybobthornton martinfreeman allisontolman noahhawley frozen minnesota murder conspiracy anthology fargo tv series show seasons episodes english",
            "genres_display": "Crime, Drama, Thriller",
            "cast_display": "Billy Bob Thornton, Martin Freeman, Allison Tolman",
            "director_display": "Noah Hawley",
            "overview": "A close-knit anthology series of various chronicles of deception, intrigue and murder in and around frozen Minnesota. Yet all of these tales mysteriously lead back, in one way or another, to Fargo, North Dakota.",
            "vote_average": 8.9,
            "popularity": 125.0,
            "release_date": "2014-04-15",
            "runtime": 53.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 5,
            "episodes": 51,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 10, "release_year": "2014"},
                {"season_number": 2, "episode_count": 10, "release_year": "2015"},
                {"season_number": 3, "episode_count": 10, "release_year": "2017"},
                {"season_number": 4, "episode_count": 11, "release_year": "2020"},
                {"season_number": 5, "episode_count": 10, "release_year": "2023"}
            ])
        },
        {
            "movie_id": 46648,
            "title": "True Detective",
            "tags": "crime drama mystery thriller matthewmcconaughey woodyharrelson michellemonaghan nicpizzolatto detective anthology cold case murder investigation southern gothic true detective tv series show seasons episodes english",
            "genres_display": "Crime, Drama, Mystery, Thriller",
            "cast_display": "Matthew McConaughey, Woody Harrelson, Michelle Monaghan",
            "director_display": "Nic Pizzolatto",
            "overview": "An anthology series in which police investigations reveal the personal and professional secrets of those involved, both within and outside the law.",
            "vote_average": 8.9,
            "popularity": 140.0,
            "release_date": "2014-01-12",
            "runtime": 55.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 4,
            "episodes": 30,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 8, "release_year": "2014"},
                {"season_number": 2, "episode_count": 8, "release_year": "2015"},
                {"season_number": 3, "episode_count": 8, "release_year": "2019"},
                {"season_number": 4, "episode_count": 6, "release_year": "2024"}
            ])
        },
        {
            "movie_id": 76479,
            "title": "The Boys",
            "tags": "action science fiction drama karlurban jackquaid antonystarr erickkripke evil superheroes homelander vought billy butcher vigilantes gore satire the boys tv series show seasons episodes english",
            "genres_display": "Action, Science Fiction, Drama",
            "cast_display": "Karl Urban, Jack Quaid, Antony Starr",
            "director_display": "Eric Kripke",
            "overview": "A fun and irreverent take on what happens when superheroes—who are as popular as celebrities—abuse their superpowers rather than use them for good.",
            "vote_average": 8.7,
            "popularity": 260.0,
            "release_date": "2019-07-25",
            "runtime": 60.0,
            "languages": "English",
            "media_type": "tv",
            "seasons": 4,
            "episodes": 32,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 8, "release_year": "2019"},
                {"season_number": 2, "episode_count": 8, "release_year": "2020"},
                {"season_number": 3, "episode_count": 8, "release_year": "2022"},
                {"season_number": 4, "episode_count": 8, "release_year": "2024"}
            ])
        },
        
        # --- Indian TV Series ---
        {
            "movie_id": 76057,
            "title": "Sacred Games",
            "tags": "drama crime mystery thriller saifalikhan nawazuddinsiddiqui radhikaapte anuragkashyap vikramadityamotwane mumbai police gang boss warning save city mafia drug lord sacred games tv series show seasons episodes hindi english indian",
            "genres_display": "Drama, Crime, Mystery, Thriller",
            "cast_display": "Saif Ali Khan, Nawazuddin Siddiqui, Radhika Apte",
            "director_display": "Anurag Kashyap, Vikramaditya Motwane",
            "overview": "A link in their pasts leads an honest cop to a fugitive gang boss, whose cryptic warning spurs the officer on a quest to save Mumbai from cataclysm.",
            "vote_average": 8.6,
            "popularity": 45.0,
            "release_date": "2018-07-06",
            "runtime": 50.0,
            "languages": "Hindi, English",
            "media_type": "tv",
            "seasons": 2,
            "episodes": 16,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 8, "release_year": "2018"},
                {"season_number": 2, "episode_count": 8, "release_year": "2019"}
            ])
        },
        {
            "movie_id": 82496,
            "title": "Mirzapur",
            "tags": "drama action crime thriller pankajtripathi alifazal divyenndu karananshuman wedding gun shootout weapon trade gang war mirzapur tv series show seasons episodes hindi indian",
            "genres_display": "Drama, Action, Crime, Thriller",
            "cast_display": "Pankaj Tripathi, Ali Fazal, Divyenndu",
            "director_display": "Karan Anshuman, Gurmmeet Singh",
            "overview": "A shocking incident at a wedding procession ignites a series of events, entangling the lives of two families in the lawless city of Mirzapur.",
            "vote_average": 8.5,
            "popularity": 60.0,
            "release_date": "2018-11-16",
            "runtime": 50.0,
            "languages": "Hindi",
            "media_type": "tv",
            "seasons": 3,
            "episodes": 29,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 9, "release_year": "2018"},
                {"season_number": 2, "episode_count": 10, "release_year": "2020"},
                {"season_number": 3, "episode_count": 10, "release_year": "2024"}
            ])
        },
        {
            "movie_id": 92744,
            "title": "The Family Man",
            "tags": "drama action comedy thriller manojbajpayee priyamani sharibhashmi rajanddk secret spy double life terrorist threat intelligence agency comedy hits the family man tv series show seasons episodes hindi tamil telugu english indian",
            "genres_display": "Drama, Action, Comedy, Thriller",
            "cast_display": "Manoj Bajpayee, Priyamani, Sharib Hashmi",
            "director_display": "Raj Nidimoru, Krishna D.K.",
            "overview": "A world-class spy from the National Investigation Agency tries to protect the nation from terrorists while keeping his family safe from his secret job.",
            "vote_average": 8.7,
            "popularity": 40.0,
            "release_date": "2019-09-20",
            "runtime": 45.0,
            "languages": "Hindi, Tamil, Telugu, English",
            "media_type": "tv",
            "seasons": 2,
            "episodes": 19,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 10, "release_year": "2019"},
                {"season_number": 2, "episode_count": 9, "release_year": "2021"}
            ])
        },
        {
            "movie_id": 101487,
            "title": "Panchayat",
            "tags": "comedy drama jitendrakumar raghubiryadav neenagupta remote village office secretary government career comedy hits panchayat tv series show seasons episodes hindi indian",
            "genres_display": "Comedy, Drama",
            "cast_display": "Jitendra Kumar, Raghubir Yadav, Neena Gupta",
            "director_display": "Deepak Kumar Mishra",
            "overview": "A comedy-drama, which chronicles the journey of an engineering graduate Abhishek, who joins as secretary of a Panchayat office in a remote village Phulera of Uttar Pradesh due to lack of better job options.",
            "vote_average": 8.9,
            "popularity": 35.0,
            "release_date": "2020-04-03",
            "runtime": 35.0,
            "languages": "Hindi",
            "media_type": "tv",
            "seasons": 3,
            "episodes": 24,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 8, "release_year": "2020"},
                {"season_number": 2, "episode_count": 8, "release_year": "2022"},
                {"season_number": 3, "episode_count": 8, "release_year": "2024"}
            ])
        },
        {
            "movie_id": 111860,
            "title": "Scam 1992: The Harshad Mehta Story",
            "tags": "drama biography crime pratikgandhi shreyadhanwanthary hemantkher hansalmehta stock market bombay finance money banking scam 1992 tv series show seasons episodes hindi english indian",
            "genres_display": "Drama, Biography, Crime",
            "cast_display": "Pratik Gandhi, Shreya Dhanwanthary, Hemant Kher",
            "director_display": "Hansal Mehta",
            "overview": "Set in 1980s & 90s Bombay, Scam 1992 follows the life of Harshad Mehta, a stockbroker who single-handedly took the stock market to dizzying heights & his catastrophic downfall.",
            "vote_average": 9.3,
            "popularity": 30.0,
            "release_date": "2020-10-09",
            "runtime": 50.0,
            "languages": "Hindi, English",
            "media_type": "tv",
            "seasons": 1,
            "episodes": 10,
            "season_details": json.dumps([
                {"season_number": 1, "episode_count": 10, "release_year": "2020"}
            ])
        },
        
        # --- Indian Movies ---
        {
            "movie_id": 579974,
            "title": "RRR",
            "tags": "action drama history rajamouli ntrjr ramcharan ajaydevgn freedom struggle rebel friendship fire water british colonialism rrr indian movie telugu hindi tamil kannada malayalam english",
            "genres_display": "Action, Drama, History",
            "cast_display": "N.T. Rama Rao Jr., Ram Charan, Ajay Devgn",
            "director_display": "S.S. Rajamouli",
            "overview": "A fictional history of two legendary revolutionaries' journey away from home before they began fighting for their country in the 1920s.",
            "vote_average": 7.8,
            "popularity": 95.0,
            "release_date": "2022-03-24",
            "runtime": 187.0,
            "languages": "Telugu, Hindi, Tamil, Kannada, Malayalam, English",
            "media_type": "movie",
            "seasons": None,
            "episodes": None,
            "season_details": None
        },
        {
            "movie_id": 347201,
            "title": "Baahubali: The Beginning",
            "tags": "action adventure drama fantasy rajamouli prabhas ranadaggubati anushkashetty ancient kingdom crown waterfall warrior prince baahubali indian movie telugu tamil hindi malayalam",
            "genres_display": "Action, Adventure, Drama, Fantasy",
            "cast_display": "Prabhas, Rana Daggubati, Anushka Shetty",
            "director_display": "S.S. Rajamouli",
            "overview": "A child from a forest tribe is drawn to a towering waterfall, embarking on a journey that unravels his true heritage as the prince of Mahishmati.",
            "vote_average": 7.5,
            "popularity": 45.0,
            "release_date": "2015-07-10",
            "runtime": 159.0,
            "languages": "Telugu, Tamil, Hindi, Malayalam",
            "media_type": "movie",
            "seasons": None,
            "episodes": None,
            "season_details": None
        },
        {
            "movie_id": 20453,
            "title": "3 Idiots",
            "tags": "comedy drama education engineering college hostel friendship career amirkhan madhavan sharmanjoshi rajkumarhirani comedy hits 3 idiots indian movie hindi english",
            "genres_display": "Comedy, Drama",
            "cast_display": "Aamir Khan, Madhavan, Sharman Joshi",
            "director_display": "Rajkumar Hirani",
            "overview": "Two friends search for their long-lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the world called them idiots.",
            "vote_average": 8.0,
            "popularity": 55.0,
            "release_date": "2009-12-23",
            "runtime": 170.0,
            "languages": "Hindi, English",
            "media_type": "movie",
            "seasons": None,
            "episodes": None,
            "season_details": None
        },
        {
            "movie_id": 360814,
            "title": "Dangal",
            "tags": "drama biography action amirkhan sakshitanwar fatimasana phogat wrestling commonwealth games gold medal sports dangal indian movie hindi tamil telugu",
            "genres_display": "Drama, Biography, Action",
            "cast_display": "Aamir Khan, Sakshi Tanwar, Fatima Sana Shaikh",
            "director_display": "Nitesh Tiwari",
            "overview": "Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.",
            "vote_average": 8.0,
            "popularity": 50.0,
            "release_date": "2016-12-21",
            "runtime": 161.0,
            "languages": "Hindi, Tamil, Telugu",
            "media_type": "movie",
            "seasons": None,
            "episodes": None,
            "season_details": None
        }
    ]
    web_series_df = pd.DataFrame(additional_catalogue)
    
    # Combine datasets
    print("Appending curated web series and movies dataset...")
    final_df = pd.concat([final_df, web_series_df], ignore_index=True)
    
    # Save processed dataframe
    print(f"Saving cleaned dataset to {CLEANED_FILE}...")
    final_df.to_csv(CLEANED_FILE, index=False)
    print("Preprocessing completed successfully!")

if __name__ == "__main__":
    main()
