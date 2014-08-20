from pymongo import MongoClient
import re

client = MongoClient()

db = client.graph_directors

ratings = db.ratings
directors = db.directors
bulk = []
BULK_SIZE = 100

def import_ratings():
    ratings.drop()

    rating_pattern = re.compile('\s+[0-9\.]+\s+(\d+)\s{3}(\d.\d)\s{2}([ -~]+)\s\((\d{4})\)')
    inserted = 0
    with open('data/ratings_cropped.list') as r:
        for line in r:
            if not line.endswith('}\n') and '(VG)' not in line:
                m = rating_pattern.match(line)
                if m is not None:
                    entry = {'name' : m.group(3), 'rating' : float(m.group(2)), 'votes' : int(m.group(1)), 'year' : int(m.group(4))}
                    if entry['votes'] > 10000:
                        ratings.insert(entry)
                        inserted = inserted + 1
    return inserted



def persist_director(name, movies):
    global bulk
    if not name:
        return
    def as_entry(movie_name):
        m = ratings.find_one({'name' : movie_name})
        return {'name' : movie_name, 'year' : m['year'], 'votes' : m['votes'], 'rating' : m['rating']} if m is not None else None

    movies = filter(lambda m: m is not None, map(lambda m: as_entry(m['name']), movies))
    if len(movies) > 1:
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
                    director = m.group(2) + ' ' + m.group(1) + (m.group(3) if m.group(3) else '')
                    last_name = m.group(1)
                    name = m.group(4)
                    if is_tv_series(name) or m.group(6):
                        continue
                    year = int(m.group(5))
                    entry = {'name' : name, 'year' : year}
                    movies = [entry]
            else:
                m = movie_line_pattern.match(line)
                if m is not None:
                    name = m.group(1)
                    if is_tv_series(name) or m.group(3):
                        continue
                    year = int(m.group(2))
                    entry = {'name' : name, 'year' : year}
                    movies.append(entry)

    if bulk:
        directors.insert(bulk)


def is_tv_series(name):
    return name.startswith('"') and name.endswith('"')

#import_ratings()
import_directors()

