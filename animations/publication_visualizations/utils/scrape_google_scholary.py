import scholarly
import jsonpickle

AUTHOR_NAME = 'Danielle S. Bassett'
FILENAME = '../data/dsb_citations.json'

# Fetch the author
print('Fetching publications...')
search_query = scholarly.search_author(AUTHOR_NAME)

author = next(search_query).fill()

# Convert the publications to json
print('Writing publications...')
# make_refs causes a recursive error, disable it
# unpickleable info makes the file larger and is unnecessary here
publications = jsonpickle.encode(author.publications, unpicklable=False, make_refs=False)

with open(FILENAME, 'w') as f:
    f.write(publications)