import os, logging, argparse, calendar#, json
from dota2py import api
from datetime import datetime
from util import print_match_history, get_game_mode_string, send_email
from pymongo import MongoClient
from time import sleep
import atexit
from sys import exit

DATE_MIN = calendar.timegm(datetime(2013, 10, 1).utctimetuple())
DATE_MAX = calendar.timegm(datetime(2013, 10, 22).utctimetuple())

client = MongoClient(os.getenv('DOTABOT_DB_SERVER', 'localhost'), 27017)
db = client[os.getenv('DOTABOT_DB_NAME', 'dotabot')]
match_collection = db.matches

logging.basicConfig(level=logging.DEBUG, filename='log.txt')
logger = logging.getLogger('dotabot')

last_match_id = -1
date_max = DATE_MAX

@atexit.register
def save_match_id():
    '''Save the last match ID processed to a file on exit.'''
    global last_match_id, date_max
    if last_match_id != -1 and date_max != -1:
        open('last_match', 'w').write('%d' % last_match_id)
        open('date_max', 'w').write('%d' % date_max)

        msg = 'Script crashed! Last match id was %s. Date_max was %s' % (last_match_id, date_max)
        send_email(msg, subject='Script crashed!')
    
def setup():
    '''Setup the API, MongoDB connection, etc.'''
    logger.setLevel(logging.DEBUG)

    API_KEY = os.getenv('DOTABOT_API_KEY')
    if not API_KEY:
        raise NameError('Please set the DOTABOT_API_KEY environment variables.')
    api.set_api_key(API_KEY)

def is_valid_match(gmd_result):
    '''Returns True if the given match details result should be considered,
    and False otherwise.'''
    for player in gmd_result['players']:
        if player['leaver_status'] is not 0:
            return False
    return True

def process_replay(match_id):
    '''Download, parse, and record data from the replay of the
    given match_id.'''
    # TODO
    pass

def process_match_details(match_id):
    '''Get the details of the given match_id, check if it's valid, and
    if it is, add it as a record in the database and spawn a thread to
    download and parse the corresponding replay.'''
    global last_match_id
    gmd = api.get_match_details(match_id)['result']

    if not is_valid_match(gmd):
        logger.debug('Not considering match %s.' % match_id)
        return

    game_mode = get_game_mode_string(gmd['game_mode'])

    #print 'Match ID: %s - Game Mode: %s' % (match_id, game_mode)

    match_collection.insert(gmd)
    logger.debug('Processed match_id=%s' % match_id)

    last_match_id = match_id

    #logging.debug(json.dumps(gmd, sort_keys=True, indent=4))

    # TODO:
    # 1. Spawn replay parser thread if there aren't too many already

def main(start_match_id):
    '''The main entry point of dotabot.'''
    global date_max
    while True:
        # Note: GetMatchHistory returns a list of matches in descending order,
        # going back in time.
        sleep(1.0)
        logger.debug('Doing GMH query for start_at_match_id=%s' % start_match_id)
        gmh = api.get_match_history(start_at_match_id=start_match_id,
                                    skill=3,
                                    date_min=DATE_MIN,
                                    date_max=date_max,
                                    game_mode=2,
                                    min_players=10)['result']
        error_code = gmh['status']
        matches = gmh['matches']
        if error_code is not 1:
            msg = 'GetMatchHistory query starting at match_id %s returned error code %s. Retrying.' % (start_match_id, error_code)
            logger.debug(msg)
            send_email(msg, subject='GMH query failed (script still running)')
            continue

        if len(matches) is 0:
            msg = 'Zero matches for GMH query with start_at_match_id=%s: \n\n %s' % (start_match_id, gmh)
            logger.debug(msg)
            send_email(msg, subject='GMH query had zero matches (forced script to crash)')
            exit(-1)

        for match in matches:
            sleep(1.0)
            process_match_details(match['match_id'])

        tail_match = matches[-1]
        date_max = tail_match['start_time']
        tail_match_id = tail_match['match_id']
        logger.debug('Match_id of last match of GMH query: %s' % last_match_id)
        logger.debug('Date of last match of GMH query: %s' % date_max)
        # We don't want to record the tail match twice, so subtract 1
        start_match_id = tail_match_id - 1

if __name__ == '__main__':
    p = argparse.ArgumentParser(description='Bot for collecting DOTA2 data')
    p.add_argument('--match_id', dest='match_id', default=None)
    args = p.parse_args()

    match_id = args.match_id
    if match_id != None:
        match_id = int(match_id)

    try:
        with open('last_match') as f:
            saved_id = int(f.readline())
            ans = False
            try:
                ans = raw_input('Start at last_match %d? ' % saved_id)
                if ans in ['yes', 'y', 'Y', 'YES', 'Yes']:
                    ans = True
            except KeyboardInterrupt:
                ans = False
            if ans is True:
                try:
                    with open('date_max') as d:
                        date_max = int(d.readline())
                    match_id = saved_id
                except IOError:
                    print 'Could not open date_max file, ignoring last_match value.'

    except IOError:
       pass 

    print 'OK, starting at match_id=%s' % match_id

    setup()
    main(match_id)
