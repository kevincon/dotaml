import os, logging, argparse, calendar#, json
from dota2py import api
from datetime import datetime
from util import print_match_history, get_game_mode_string

DATE_MIN = calendar.timegm(datetime(2013, 10, 1).utctimetuple())
DATE_MAX = calendar.timegm(datetime(2013, 10, 22).utctimetuple())

logging.basicConfig()
logger = logging.getLogger('dotabot')

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
    gmd = api.get_match_details(match_id)['result']

    if not is_valid_match(gmd):
        logger.debug('Not considering match %s.' % match_id)
        return

    game_mode = get_game_mode_string(gmd['game_mode'])

    print 'Match ID: %s - Game Mode: %s' % (match_id, game_mode)

    #logging.debug(json.dumps(gmd, sort_keys=True, indent=4))

    # TODO:
    # 1. Insert match into mongodb database
    # 2. Spawn replay parser thread if there aren't too many already

def main(start_match_id):
    '''The main entry point of dotabot.'''
    #TODO remove counter
    counter = 0
    while True:
        # Note: GetMatchHistory returns a list of matches in descending order,
        # going back in time.
        gmh = api.get_match_history(start_at_match_id=start_match_id,
                                    skill=3,
                                    date_min=DATE_MIN,
                                    date_max=DATE_MAX,
                                    game_mode=2,
                                    min_players=10)['result']
        error_code = gmh['status']
        if error_code is not 1:
            logger.debug('GetMatchHistory query starting at match_id %s \
                          returned error code %s. Retrying.'
                          % (start_match_id, error_code))
            # TODO send email here
            continue

        print_match_history(gmh)

        for match in gmh['matches']:
            process_match_details(match['match_id'])

        last_match = gmh['matches'][-1]['match_id']
        logger.debug('Last match of GMH query: %s' % last_match)
        # We don't want to record the last match twice, so subtract 1
        start_match_id = last_match - 1

        # TODO remove this to keep going after 2 gmh queries
        if counter is not 1:
            counter += 1
        else:
            import sys
            sys.exit(0)


if __name__ == '__main__':
    p = argparse.ArgumentParser(description='Bot for collecting DOTA2 data')
    p.add_argument('--match_id', dest='match_id', default=None)
    args = p.parse_args()

    setup()
    main(args.match_id)
