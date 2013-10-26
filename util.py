import smtplib, os
from email.mime.text import MIMEText
from email.Utils import formatdate

def send_email(body,
               subject='Quick Message From DOTA2 Python Script',
               recipients=['kcon@stanford.edu', 'djperry@stanford.edu']):
    '''Send an email.'''
    # Credentials
    username = os.getenv('DOTABOT_USERNAME')
    password = os.getenv('DOTABOT_PASSWORD')
    hostname = os.getenv('DOTABOT_HOSTNAME')
    if not username or not password:
        raise NameError('Please set DOTABOT_USERNAME, DOTABOT_PASSWORD, \
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
    server.login(username,password)
    server.sendmail(username, recipients, msg.as_string())
    server.quit()
