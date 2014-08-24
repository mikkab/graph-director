from pymongo import MongoClient
import requests
import re

client = MongoClient()
db = client.graph_directors
directors = db.directors

bulk = []
BULK_SIZE = 100
MIN_MOVIE_VOTES = 10000
MIN_MOVIES = 2


def persist_director(name, movies):
    global bulk
    if not name:
        return
    movies = filter(lambda m : m['votes'] >= MIN_MOVIE_VOTES, movies)
    if len(movies) >= MIN_MOVIES:
        bulk.append({'name' : name, 'movies' : movies })
        if len(bulk) == BULK_SIZE:
            directors.insert(bulk)
            bulk = []


def import_directors():
    global bulk

    directors.drop()

    movie_pattern = "([ ',-~]+)\s\((\d{4})\)(\s\([V]{1,2}\))?"
    director_line_pattern = re.compile("([ ',-~]+),\s([ ',-~]+)(\s\([IVX]+\))?\t{1,2}" + movie_pattern)
    movie_line_pattern = re.compile("\t{3}" + movie_pattern)

    with open('data/directors_one.list') as d:
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
                    director = m.group(2) + ' ' + m.group(1) + (m.group(3) if m.group(3) else '')
                    last_name = m.group(1)
                    name = m.group(4)
                    if is_tv_series(name) or m.group(6):
                        continue
                    year = int(m.group(5))
                    movies = [as_movie(name, year)]
            else:
                m = movie_line_pattern.match(line)
                if m is not None:
                    name = m.group(1)
                    if is_tv_series(name) or m.group(3):
                        continue
                    year = int(m.group(2))
                    movies.append(as_movie(name, year))

    if bulk:
        directors.insert(bulk)


def is_tv_series(name):
    return name.startswith('"') and name.endswith('"')


def as_movie(name, year):
    r = requests.get('http://omdbapi.com/?t=' + name).json()
    rating = float(r['imdbRating']) if r and 'imdbRating' in r and r['imdbRating'] != 'N/A' else 0.0
    votes = int(r['imdbVotes'].replace(',', '')) if r and 'imdbVotes' in r and r['imdbVotes'] != 'N/A' else 0
    poster = r['Poster'].replace('http://ia.media-imdb.com/images/M/', '').replace('._V1_SX300.jpg', '') if r and 'Poster' in r else ''
    imdbId = r['imdbID'] if r and 'imdbID' in r else ''
    return {'name' : name, 'year' : year, 'rating' : rating, 'votes' : votes, 'poster' : poster, 'imdbId' : imdbId}


import_directors()

