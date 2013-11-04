import smtplib, os
from email.mime.text import MIMEText
from email.Utils import formatdate
from datetime import datetime
from dota2py import data

def print_match_history(gmh_result):
    '''Print a summary of a list of matches.'''
    for match in gmh_result['matches']:
        match_id = match['match_id']
        start_time = datetime.fromtimestamp(int(match['start_time']))
        print 'Match %d - %s' % (match_id, start_time)

def get_game_mode_string(game_mode_id):
    '''Return a human-readable string for a game_mode id.'''
    try:
        return data.GAME_MODES['dota_game_mode_%s' % game_mode_id]
    except KeyError:
        return 'Unknown mode %s' % game_mode_id

def send_email(body,
               subject='Quick Message From DOTA2 Python Script',
               recipients=['kcon@stanford.edu', 'djperry@stanford.edu']):
    '''Send an email.'''
    # Credentials
    username = os.getenv('DOTABOT_USERNAME')
    hostname = os.getenv('DOTABOT_HOSTNAME')
    if not username or not hostname:
        raise NameError('Please set DOTABOT_USERNAME \
                       and DOTABOT_HOSTNAME environment variables.')
    
    # Message
    msg = MIMEText(body)
    msg['From'] = username
    msg['To'] = ','.join(recipients)
    msg['Subject'] = subject
    msg['Date'] = formatdate(localtime=True)

    # Send the email
    server = smtplib.SMTP(hostname)
    server.starttls()
    server.sendmail(username, recipients, msg.as_string())
    server.quit()
