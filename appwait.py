from flask import Flask, render_template, request
import os
from werkzeug.utils import secure_filename
from real_or_fakee import deep_predict

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route("/", methods=["GET", "POST"])
def index():
    result = None

    if request.method == "POST":
        file = request.files.get("video")

        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            result = deep_predict(file_path)

    return render_template("index_copy.html", result=result)

if __name__ == "__main__":
    app.run(debug=True)
