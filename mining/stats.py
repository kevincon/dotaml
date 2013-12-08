import os, time
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
        most_recent_match_time = post['start_time']

    total_matches = match_collection.count()
    human_readable_time = time.strftime("%a, %d %b %Y %H:%M:%S GMT", time.localtime(most_recent_match_time))

    disk_stats = os.statvfs('/')
    mb_remaining = disk_stats.f_bavail * disk_stats.f_frsize/1024.0/1024.0/1024.0

    msg = '''
    Hello! 

    The database currently contains %s matches.

    The most recent match_id added to the database was %s.

    The date of that match was %s.

    There are %.2f remaining GB on the hard drive.

    <3 dotabot
    ''' % (total_matches, most_recent_match_id, human_readable_time, mb_remaining)

    send_email(msg, subject='DOTAbot Update')
     
if __name__ == '__main__':
    main() 
