
import shutil
from flask import Blueprint, jsonify, request, render_template, current_app # Added render_template and current_app
import logging # Good practice for logging errors
from . import dabopration # Assuming dabopration provides cursor and conn

# Configure logging
logging.basicConfig(level=logging.INFO)

du_bp = Blueprint('delete_user_bp', __name__, template_folder='templates') # Added template_folder


# --- Route to get the user list ---
@du_bp.route('/getlist', methods=['GET'])
def get_user_list():
    """Fetches and returns a list of users (email and name) from the database."""
    users_list = []
    try:
        # Ensure you have a fresh cursor if needed, or use the shared one carefully
        # Depending on how dabopration is set up, you might need dabopration.get_cursor()
        cursor = dabopration.cursor
        conn = dabopration.conn # Needed potentially for error handling/rollback? Usually not for SELECT.

        query = "SELECT email, name FROM users ORDER BY name" # Assuming table name is 'users'
        cursor.execute(query)
        results = cursor.fetchall() # Fetches all rows as a list of tuples

        # Convert list of tuples to list of dictionaries for easier JSON handling
        for row in results:
            users_list.append({'email': row[0], 'name': row[1]}) # Adjust indices if query changes

        return jsonify(users_list), 200 # OK

    except Exception as e:
        logging.error(f"Error fetching user list: {e}")
        # Consider rolling back if there was an unexpected transaction state, though unlikely for SELECT
        # if conn: conn.rollback()
        return jsonify({"error": "Failed to retrieve user list", "details": str(e)}), 500 # Internal Server Error

# --- Route to delete a user ---
@du_bp.route('/delete_user', methods=['POST'])
def delete_user():
    """Deletes a user based on the email provided in the POST request body."""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 415 # Unsupported Media Type

    data = request.get_json()
    email_to_delete = data.get('email')
    name_to_delete = data.get('name') # Optional: if you want to log or use the name
    # name_to_delete转字符串
    
    print(name_to_delete)
    #服务器上删除用户名文件夹
    user_folder = dabopration.USER_file / str(name_to_delete)
    print(user_folder)
    if user_folder.exists():
        try:
            shutil.rmtree(user_folder)  # Remove the directory and all its contents
            logging.info(f"Successfully deleted user folder: {user_folder}")
        except Exception as e:
            logging.error(f"Error deleting user folder {user_folder}: {e}")


    if not email_to_delete:
        return jsonify({"error": "Missing 'email' in request body"}), 400 # Bad Request

    try:
        cursor = dabopration.cursor
        conn = dabopration.conn # Connection needed for commit

        # Use parameterized query to prevent SQL injection
        query = "DELETE FROM users WHERE email = %s" # Use %s or ? depending on your DB driver (e.g., psycopg2 uses %s, sqlite3 uses ?)
        
        # Ensure correct parameter format (often needs to be a tuple)
        params = (email_to_delete,) 
        
        cursor.execute(query, params)
        
        rows_affected = cursor.rowcount # Check how many rows were deleted

        if rows_affected > 0:
            conn.commit() # IMPORTANT: Commit the transaction to make the delete permanent
            logging.info(f"Successfully deleted user: {email_to_delete}")
            return jsonify({"message": f"User '{email_to_delete}' deleted successfully."}), 200 # OK
        else:
            # No need to commit if nothing was deleted, but doesn't hurt usually
            # conn.rollback() # Optional: explicitly rollback if preferred
            logging.warning(f"Attempted to delete non-existent user: {email_to_delete}")
            return jsonify({"message": f"User '{email_to_delete}' not found."}), 404 # Not Found

    except Exception as e:
        logging.error(f"Error deleting user {email_to_delete}: {e}")
        if conn:
            conn.rollback() # IMPORTANT: Rollback transaction on error
        return jsonify({"error": "Failed to delete user", "details": str(e)}), 500 # Internal Server Error

