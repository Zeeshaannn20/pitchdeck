from __future__ import annotations

from flask import Flask
from flask_cors import CORS

def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

    from .routes import bp
    app.register_blueprint(bp)

    return app
