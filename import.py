from pymongo import MongoClient
import requests
import re
import sys

client = MongoClient()
db = client.graph_directors
ratings = db.ratings
directors = db.directors

MIN_MOVIE_VOTES = 10000
MIN_MOVIES = 3

def import_ratings():
    ratings.drop()

    rating_pattern = re.compile('\s+[0-9\.]+\s+(\d+)\s{3}(\d.\d)\s{2}([ -~]+)\s\((\d{4})\)')
    with open('data/ratings_cropped.list') as r:
        for line in r:
            if not line.endswith('}\n') and '(VG)' not in line:
                m = rating_pattern.match(line)
                if m is not None:
                    entry = {'name' : m.group(3), 'rating' : float(m.group(2)), 'votes' : int(m.group(1)), 'year' : int(m.group(4))}
                    if entry['votes'] >= MIN_MOVIE_VOTES:
                        ratings.insert(entry)


def import_directors():

    directors.drop()

    movie_pattern = "([ ',-~]+)\s\((\d{4})\)(\s\([V]{1,2}\))?"
    director_line_pattern = re.compile("([ ',-~]+),\s([ ',-~]+)(\s\([IVX]+\))?\t{1,2}" + movie_pattern)
    movie_line_pattern = re.compile("\t{3}" + movie_pattern)

    with open('data/directors_cropped.list') as d:
        director = ''
        movies = []

        for line in d:
            if line == '\n':
                persist_director(director, movies)
                director = ''
                movies = []
            elif not line.startswith('\t'):
                m = director_line_pattern.match(line)
                if m is not None:
                    director = m.group(2) + ' ' + m.group(1)
                    last_name = m.group(1)
                    name = m.group(4)
                    if is_tv_series(name) or m.group(6):
                        continue
                    year = int(m.group(5))
                    movies = [{'name' : name, 'year' : year}]
            else:
                m = movie_line_pattern.match(line)
                if m is not None:
                    name = m.group(1)
                    if is_tv_series(name) or m.group(3):
                        continue
                    year = int(m.group(2))
                    movies.append({'name' : name, 'year' : year})


def is_tv_series(name):
    return name.startswith('"') and name.endswith('"')


def calculate_average_rating(movies):
    average = 0.0
    for m in movies:
        average += m['rating']
    return average / len(movies)


def persist_director(director_name, movies):
    def as_entry(movie_name):
        m = ratings.find_one({'name' : movie_name})
        if not m:
            return None
        try:
            r = requests.get('http://omdbapi.com/?t=' + movie_name).json()
        except:
            r = {}
        rating = float(r['imdbRating']) if r and 'imdbRating' in r and r['imdbRating'] != 'N/A' else 0.0
        votes = int(r['imdbVotes'].replace(',', '')) if r and 'imdbVotes' in r and r['imdbVotes'] != 'N/A' else 0
        poster = r['Poster'].replace('http://ia.media-imdb.com/images/M/', '').replace('._V1_SX300.jpg', '') if r and 'Poster' in r else ''
        imdbId = r['imdbID'] if r and 'imdbID' in r else ''
        return {'name' : movie_name, 'year' : m['year'], 'rating' : rating, 'votes' : votes, 'poster' : poster, 'imdbId' : imdbId}

    if not director_name:
        return
    if len(movies) >= MIN_MOVIES:
        movies = filter(lambda m: m is not None, map(lambda m: as_entry(m['name']), movies))
        if len(movies) >= MIN_MOVIES:
            directors.insert({'name' : director_name, 'movies' : movies, 'average' : calculate_average_rating(movies) })
            print(director_name)
            sys.stdout.flush()



#import_ratings()
import_directors()

