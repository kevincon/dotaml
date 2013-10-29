# dota2project

A DOTA 2 hero recommendation engine for Stanford's CS 229 Machine Learning course.

## dotabot

dotabot is a Python script that collects data from the DOTA 2 web API and stores it in a local database.

### Dependencies

#### Install virtualenv

We use [VirtualEnv](http://www.virtualenv.org/en/latest/) to help facilitate getting setup on a new machine.
To install it, run:

    pip install virtualenv
    
If you receive an error about permissions, you may need to install it using sudo:

    sudo pip install virtualenv
    
### Setting up Development

#### Clone the Repository

    git clone git@github.com:kevincon/dota2project.git

#### Initialize virtualenv

From inside the repository root folder, initialize virtualenv by running:

    virtualenv venv
    
This creates a new folder in the directory called "venv." You only need to do this once. Don't worry about ever accidentally adding this folder to the repository. There's an entry for it in the .gitignore file.

Next, activate the virtualenv by running:

    source venv/bin/activate
    
You should now see "(venv)" as part of your terminal prompt, indicating you are now inside your virtualenv. Note that closing the terminal window deactivates virtualenv, so you must run ```source venv/bin/activate``` each time you open a new terminal window for development.

#### Installing required packages

Now that you're in virtualenv, run the following command to automatically install all of the Python modules that dotabot requires:

    pip install -r requirements.txt

#### Setting up environment variables

dotabot uses a few environment variables for configuration so that these sensitive variables are not stored in the public repository. Therefore, you must initialize the following environment variables:

    export DOTABOT_API_KEY=[steam web api key]
    export DOTABOT_USERNAME=[email username]
    export DOTABOT_PASSWORD=[email password]
    export DOTABOT_HOSTNAME=[email outgoing smtp server]
    export DOTABOT_DB_SERVER=[mongodb server]
    export DOTABOT_DB_NAME=[mongodb database name]
    
You may find it helpful to add these commands to your bash profile in your home directory so they are automatically executed each time you open a new terminal window.

### Running dotabot

Finally, run dotabot with:

    python dotabot.py
    
There are also some command line arguments you can specify, which you can view by running:

    python dotabot.py -h
