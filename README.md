# DotaML

A DOTA 2 hero recommendation engine for Stanford's CS 229 Machine Learning course.

## Final Report

Our final report, which includes a full analysis of our project and our results, can be found here: 
[Download Final Report](docs/final_report.pdf)

## Blog Post

A blog post summarizing our project can be found here: [http://kevintechnology.com/post/71621133663/using-machine-learning-to-recommend-heroes-for-dota-2](http://kevintechnology.com/post/71621133663/using-machine-learning-to-recommend-heroes-for-dota-2)

## Where's the Live Demo?

Unfortunately, given the way we used the scikit-learn k-nearest neighbors model with a custom distance/weight function (see final report above), we are not able to provide a heroku-based live demo. It might be possible to provide a live demo via a Linode/EC2 node, but that would be cost-prohibitive for us at this time.

## Running locally

Everything has been tested to work on Mac OSX 10.8. To download our project and run the code locally, follow the following procedure:

### Dependencies

#### VirtualEnv

We use [VirtualEnv](http://www.virtualenv.org/en/latest/) to help facilitate getting setup on a new machine. There are [a number of ways of installing it](http://www.virtualenv.org/en/latest/virtualenv.html#installation), depending on your operating system.

#### GFortran

[GFortran](http://gcc.gnu.org/wiki/GFortranBinaries) is required to install scipy. If you're running Mac OSX, we recommend using [Homebrew](http://brew.sh/) to install GFortran:

    brew install gfortran

#### MongoDB, Database Backup, and Environment Variables (optional for just running recommendation engine)

The data on Dota 2 matches we collected was stored in a MongoDB database. To extract the data to train new models, you must first [install MongoDB](http://docs.mongodb.org/manual/installation/). Then, [download the backup of our database](https://www.dropbox.com/s/jgflbwyicd56av7/dotabot_db.zip) and [restore it using this tutorial](http://docs.mongodb.org/manual/tutorial/backup-databases-with-binary-database-dumps/).

Also, our data collection script, [dotabot2](data_collection/dotabot2.py), uses a few environment variables for configuration so that these sensitive variables are not stored in the public repository. Therefore, you must initialize the following environment variables:

    export DOTABOT_API_KEY=[steam web api key]
    export DOTABOT_USERNAME=[email username]
    export DOTABOT_PASSWORD=[email password]
    export DOTABOT_HOSTNAME=[email outgoing smtp server]
    export DOTABOT_DB_SERVER=[mongodb server]
    export DOTABOT_DB_NAME=[mongodb database name]

You may find it helpful to add these commands to your bash profile in your home directory so they are automatically executed each time you open a new terminal window.

### Clone the Repository

    git clone git@github.com:kevincon/dotaml.git

### Initialize VirtualEnv

From inside the repository root folder, initialize VirtualEnv by running:

    virtualenv venv

This creates a new folder in the directory called "venv." You only need to do this once. Don't worry about ever accidentally adding this folder to the repository. There's an entry for it in the .gitignore file.

Next, activate the VirtualEnv by running:

    source venv/bin/activate

You should now see "(venv)" as part of your terminal prompt, indicating you are now inside your VirtualEnv. Note that closing the terminal window deactivates VirtualEnv, so you must run ```source venv/bin/activate``` each time you open a new terminal window for development.

### Installing required packages

Now that you're in VirtualEnv, run the following command to automatically install all of the Python modules that are required:

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

Feel free to submit a pull request if you are interested in continuing development. Sadly, we will probably not develop the project further for the foreseeable future. You can also contact us via email using the addresses in the final report (see above).

### License
```
The MIT License (MIT)

Copyright (c) 2013 Kevin Conley

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
