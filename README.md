# DotaRec

A DOTA 2 hero recommendation engine for Stanford's CS 229 Machine Learning course.

## Final Report

Our final report, which includes a full analysis of our project and our results, can be found here: 
[Download Final Report](docs/final_report.pdf)

## Blog Post

A blog post summarizing our project can be found here: TODO

## Live Demo

A live demo of our recommendation engine can be found here: TODO

(credit to [Dota 2 Counter-Pick](http://dota2cp.com/) for the web interface)

## Running locally

To download our project and run the code locally, follow the following procedure:

### Dependencies

#### Scikit-learn

Our project requires the [scikit-learn](http://scikit-learn.org/stable/) Python machine learning library to be installed, which itself has a few dependencies. If you are running Mac OSX, we recommend following [these instructions to install scikit-learn](http://shanshanchen.com/2013/05/29/install-numpy-scipy-scikit-learn-on-mac-os-x-for-data-miners/).

#### VirtualEnv

We use [VirtualEnv](http://www.virtualenv.org/en/latest/) to help facilitate getting setup on a new machine. There are a number of ways of installing it, depending on your operating system.

#### MongoDB and Database Backup (optional for just running recommendation engine)

The data on Dota 2 matches we collected was stored in a MongoDB database. To extract the data to train new models, you must first [install MongoDB](http://docs.mongodb.org/manual/installation/). Then, [download the backup of our database](https://www.dropbox.com/s/jgflbwyicd56av7/dotabot_db.zip) and [restore it using this tutorial](http://docs.mongodb.org/manual/tutorial/backup-databases-with-binary-database-dumps/).

### Clone the Repository

    git clone git@github.com:kevincon/dotarec.git

### Initialize VirtualEnv

From inside the repository root folder, initialize VirtualEnv by running:

    virtualenv venv

This creates a new folder in the directory called "venv." You only need to do this once. Don't worry about ever accidentally adding this folder to the repository. There's an entry for it in the .gitignore file.

Next, activate the VirtualEnv by running:

    source venv/bin/activate

You should now see "(venv)" as part of your terminal prompt, indicating you are now inside your VirtualEnv. Note that closing the terminal window deactivates VirtualEnv, so you must run ```source venv/bin/activate``` each time you open a new terminal window for development.

### Installing required packages

Now that you're in VirtualEnv, run the following command to automatically install all of the Python modules that DotaRec requires:

    pip install -r requirements.txt
    
### Running the web app

From the root folder of the project, run:

    python app.py
    
This starts the Flask web app, which you can view in a web browser at [http://127.0.0.1:5000](http://127.0.0.1:5000).

### Running the recommendation engine via the command line

From the root folder of the project, run:

    python engine.py
    
This (by default) uses the k-nearest neighbors algorithm to perform a hard-coded hero recommendation query. See the main function of [engine.py](engine.py) for more details.

## Contributions and Feedback

Feel free to submit a pull request if you are interested in continuing development on DotaRec. Sadly, we will probably not develop the project further for the foreseeable future. You can also contact us via email using the addresses in the final report (see above).
