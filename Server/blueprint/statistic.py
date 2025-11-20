from pathlib import Path
from . import dabopration # Assuming dabopration provides cursor and conn
from flask import Blueprint, jsonify, request
import json
statistic_bp = Blueprint('statistic_bp', __name__, template_folder='templates')

@statistic_bp.route('/api/recently', methods=['GET'])
def get_recent_articles():
    print("[*] Accessing /api/recently endpoint")
    try:
        with open(dabopration.USER_file / 'recently.json', 'r', encoding='utf-8') as f:
            data = json.load(f)

        return jsonify(data['recently'])
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@statistic_bp.route('/api/hottest', methods=['GET'])
def get_hottest_articles():
    try:
        with open(dabopration.USER_file / 'statistic.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data['hottest'])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
