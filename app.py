# app.py
import os
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for
import pandas as pd

app = Flask(__name__)

# Configure directories
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
VERIF_DIR = os.path.join(
    os.path.dirname(__file__), "data"
)  # We save verification data here.
ALLOWED_MODELS = []  # We will automatically detect model excel files from DATA_DIR.

# On startup, scan the DATA_DIR to list the xlsx files that follow the pattern *_outputs.xlsx.
for filename in os.listdir(DATA_DIR):
    if filename.endswith("_outputs.xlsx"):
        model_name = filename.replace("_outputs.xlsx", "")
        ALLOWED_MODELS.append(model_name)


def load_model_data(model_name):
    """Read the Excel file for a given model and return a list of dictionaries."""
    file_path = os.path.join(DATA_DIR, f"{model_name}_outputs.xlsx")
    if not os.path.exists(file_path):
        return []
    try:
        df = pd.read_excel(file_path)
        # Convert DataFrame to list of records (each record is a dict with keys: Image, Response, etc.)
        # Ensure NaNs are converted to None or empty strings if appropriate
        return df.where(pd.notnull(df), None).to_dict(orient="records")
    except Exception as e:
        print(f"Error reading or processing Excel file {file_path}: {e}")
        return []


# Updated default fields structure with new fields for 3.1, 3.2, and 5.1.
DEFAULT_FIELDS_STRUCTURE = {
    "identify_crack_type": "",
    "transverse": "",
    "longitudinal": "",
    "alligator": "",
    "crack_pattern": "",
    "num_potholes": "",
    "pothole_pattern": "",
    "estimated_pci": "",
    "pci_category": "",
    "severity_assessment_text": "",
    "concentrated": "",
    "list_all_types": "",
    "near_utility_cut": "",
    "proof_worsen_defect": "",
    "proof_repairment": "",
    "list_evidence_repairment": "",
    "future_repairment": "",
}


def load_verification_data(model_name):
    """Load verification JSON data if exists; otherwise create a dict from the model image list."""
    verif_file = os.path.join(VERIF_DIR, f"{model_name}_verification.json")
    if os.path.exists(verif_file):
        try:
            with open(verif_file, "r") as f:
                verif_data = json.load(f)
        except json.JSONDecodeError:
            print(f"Warning: Error decoding JSON file {verif_file}. Starting fresh.")
            verif_data = {}  # Fallback to empty if JSON is corrupt
    else:
        verif_data = {}

    records = load_model_data(model_name)
    needs_save = False
    default_fields = DEFAULT_FIELDS_STRUCTURE.copy()  # Use the defined structure

    active_image_filenames = {rec.get("Image") for rec in records if rec.get("Image")}
    updated_verif_data = {}

    for image_filename in active_image_filenames:
        if image_filename not in verif_data:
            updated_verif_data[image_filename] = {
                "verified": False,
                "fields": default_fields.copy(),
            }
            needs_save = True
        else:
            current_entry = verif_data[image_filename]
            if "fields" not in current_entry:
                current_entry["fields"] = default_fields.copy()
                needs_save = True
            else:
                updated_entry_fields = {}
                field_changed = False
                # Ensure all *current* default keys exist
                for key, default_value in default_fields.items():
                    if key not in current_entry["fields"]:
                        updated_entry_fields[key] = default_value
                        field_changed = True
                    else:
                        updated_entry_fields[key] = current_entry["fields"][key]

                # Check if any old keys (like previous future_repairment) were present and removed
                if set(current_entry["fields"].keys()) != set(
                    updated_entry_fields.keys()
                ):
                    field_changed = True

                if field_changed:
                    current_entry["fields"] = updated_entry_fields
                    needs_save = True

            if "verified" not in current_entry:
                current_entry["verified"] = False
                needs_save = True

            updated_verif_data[image_filename] = current_entry

    # Check if the data actually changed before saving
    if needs_save or updated_verif_data != verif_data:
        print(f"Updating verification file (structure/keys): {verif_file}")
        save_verification_data(model_name, updated_verif_data)
        return updated_verif_data

    return verif_data


def save_verification_data(model_name, verif_data):
    """Save the verification data to the corresponding JSON file."""
    verif_file = os.path.join(VERIF_DIR, f"{model_name}_verification.json")
    try:
        with open(verif_file, "w") as f:
            json.dump(verif_data, f, indent=4)
    except IOError as e:
        print(f"Error saving verification data to {verif_file}: {e}")
    except TypeError as e:
        print(f"Error serializing data to JSON for {verif_file}: {e}")


@app.route("/")
def index():
    # List available models
    return render_template("index.html", models=ALLOWED_MODELS)


@app.route("/model/<model_name>")
def verify(model_name):
    if model_name not in ALLOWED_MODELS:
        return redirect(url_for("index"))

    model_data = load_model_data(model_name)
    if not model_data:
        return (
            f"Error: Could not load data for model '{model_name}'. Check file {model_name}_outputs.xlsx.",
            404,
        )

    verif_data = load_verification_data(model_name)
    return render_template(
        "verify.html", model_name=model_name, records=model_data, verif_data=verif_data
    )


@app.route("/save_verification", methods=["POST"])
def save_verification():
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "Invalid request data"}), 400

    model_name = data.get("model_name")
    image_filename = data.get("image_filename")
    fields = data.get("fields")  # Will now contain the new fields as well.
    verified = data.get("verified", False)

    if not model_name or model_name not in ALLOWED_MODELS:
        return (
            jsonify({"success": False, "error": "Invalid or missing model name"}),
            400,
        )
    if not image_filename:
        return jsonify({"success": False, "error": "Missing image filename"}), 400
    if fields is None:
        return jsonify({"success": False, "error": "Missing fields data"}), 400

    verif_data = load_verification_data(
        model_name
    )  # Reload fresh data to get latest structure
    if image_filename not in verif_data:
        return (
            jsonify(
                {
                    "success": False,
                    "error": f"Image file '{image_filename}' not found in verification data.",
                }
            ),
            400,
        )

    if "fields" not in verif_data[image_filename]:
        verif_data[image_filename]["fields"] = {}

    # Use the defined structure to validate keys being saved
    current_expected_keys = set(DEFAULT_FIELDS_STRUCTURE.keys())

    for key, value in fields.items():
        if key in current_expected_keys:  # Only save keys that are currently expected
            verif_data[image_filename]["fields"][key] = value
        else:
            # This shouldn't happen if JS is correct, but good safeguard
            print(
                f"Warning: Received unexpected field '{key}' during save for {image_filename}. Ignoring."
            )

    # Ensure all expected keys are present in the saved data, even if empty (unless None/null is intended)
    for key in current_expected_keys:
        if key not in verif_data[image_filename]["fields"]:
            verif_data[image_filename]["fields"][key] = DEFAULT_FIELDS_STRUCTURE[
                key
            ]  # Add with default value

    verif_data[image_filename]["verified"] = verified

    save_verification_data(model_name, verif_data)
    return jsonify({"success": True})


if __name__ == "__main__":
    app.run(debug=True)
