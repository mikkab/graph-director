from pymongo import MongoClient
import re

client = MongoClient()

db = client.graph_directors

ratings = db.ratings
directors = db.directors

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
    def as_entry(movie_name):
        m = ratings.find_one({'name' : movie_name})
        return {'name' : movie_name, 'year' : m['year'], 'votes' : m['votes']} if m is not None else None

    movies = filter(lambda m: m is not None, map(lambda m: as_entry(m['name']), movies))
    entry = {'name' : name, 'movies' : movies }
    directors.insert(entry)


def import_directors():
    directors.drop()

    director_line_pattern = re.compile('([ -~]+),\s([ -~]+)\t{1}([ -~]+)\s\((\d{4})\)')
    movie_line_pattern = re.compile('\t{3}([ -~]+)\s\((\d{4})\)')

    with open('data/directors_one.list') as d:
        director = ''
        movies = []

        for line in d:
            if line == '\n':
                persist_director(director, movies)
            elif not line.startswith('\t'):
                m = director_line_pattern.match(line)
                if m is not None:
                    director = m.group(1) + ' ' + m.group(2)
                    name = m.group(3)
                    year = int(m.group(4))
                    entry = {'name' : name, 'year' : year}
                    movies.append(entry)
            else:
                m = movie_line_pattern.match(line)
                if m is not None:
                    name = m.group(1)
                    year = int(m.group(2))
                    entry = {'name' : name, 'year' : year}
                    movies.append(entry)


#import_ratings()
import_directors()

#print ratings.find_one({'name' : 'Avatar'})






