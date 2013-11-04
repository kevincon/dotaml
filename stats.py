import os
from util import send_email
from pymongo import MongoClient

client = MongoClient(os.getenv('DOTABOT_DB_SERVER', 'localhost'), 27017)
db = client[os.getenv('DOTABOT_DB_NAME', 'dotabot')]
match_collection = db.matches

def main():
    '''The main entry point of stats.'''
    most_recent_match_id = 0
    for post in match_collection.find({}).sort('_id', direction=-1).limit(1):
        most_recent_match_id = post['match_id']

    print most_recent_match_id
    from sys import exit
    exit(0)

    msg = '''
    
    '''
    send_email(msg, subject='12-hour update')
     
if __name__ == '__main__':
    main() 
