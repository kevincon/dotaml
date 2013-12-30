# dotabot

dotabot is a Python script that collects data from the DOTA 2 web API and stores it in a local database.

### Setup

Follow the instructions for the Dependencies and Installing Required Packages sections in the [main README](../README.md).

### Running dotabot.py

dotabot.py was our first attempt at using the Steam Web API to collect data about public Dota 2 matches. It was written with the assumption that you can continuously request matches from the web API with no limits. It turns out you can only request the 500 most recent matches (using the GetMatchHistory API query). Therefore, we abandoned dotabot.py and ended up using dotabot2.py along with a cron job.

Run dotabot with:

    python dotabot.py
    
There are also some command line arguments you can specify, which you can view by running:

    python dotabot.py -h

### Running dotabot2.py

dotabot2.py was the script we actually used with our project. We had it set up on a cron job to record the 500 most recent public Dota 2 matches to a Mongo DB database every 20 minutes. Run it using:

    python dotabot2.py

### Running stats.py

stats.py is a simple script that we set up on a cron job to email us every 12 hours with the latest count of matches recorded in our MongoDB database. Run it using:

    python stats.py
