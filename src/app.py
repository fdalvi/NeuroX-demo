from flask import Flask  
from flask import render_template

# creates a Flask application, named app
app = Flask(__name__, template_folder="client/", static_folder="client/dist")

# a route where we will display a welcome message via an HTML template
@app.route("/")
def index():  
    message = "Hello, World"
    return render_template('index.html')#, message=message)

@app.route("/analyze")
def analyze():  
    message = "Hello, World"
    return render_template('analyze.html')#, message=message)

# run the application
if __name__ == "__main__":  
    app.run(host="0.0.0.0", port="5001", debug=True)