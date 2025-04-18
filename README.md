# Image Verification Tool - Worker Guide

## 1. Introduction

Welcome! This guide provides detailed instructions on how to set up and use the Image Verification Tool. The purpose of this tool is to allow human validators to review and verify the outputs generated by image analysis models, specifically focusing on identifying road defects like cracks and potholes.

You will be presented with an image, the model's textual analysis of that image, and a form (the verification criteria). Your task is to assess the model's response based on the image and fill out the verification form accurately. Your input is crucial for evaluating and improving the model's performance.

This README covers:

- Software prerequisites.
- Setting up the project environment.
- Preparing input data (model results and images).
- Running the verification web application.
- The detailed workflow for verifying images using the web interface.
- Understanding how your verification results are saved.
- How to submit your completed verification data.

Please read through this guide carefully before starting.

## 2. Prerequisites

Before you begin, ensure you have the following software installed on your computer:

1. **Git:** For cloning the project repository. ([Download Git](https://git-scm.com/downloads))
2. **Python:** Version 3.8 or higher recommended. ([Download Python](https://www.python.org/downloads/))
3. **pip:** Python's package installer. It usually comes bundled with Python installations (version 3.4+). You can check by opening a terminal or command prompt and typing `pip --version`.

## 3. Project Setup

### 3.1. Complete Setup Script

Copy and paste the following commands into your terminal to set up the environment and run the application:

```bash
# Clone the repository
git clone https://github.com/Johnx69/label-website.git

# Navigate to the repository directory
cd label-website

# Create and activate conda environment
conda create -n image-verification python=3.10 -y
conda activate image-verification

# Install dependencies
pip install -r requirements.txt

# Run the application
python website/app.py
```

## 4. Input Data Preparation

The tool requires two types of input data:

1. **Model Output Files:** Excel files (`.xlsx`) containing the results from the image analysis model you need to verify.
2. **Image Files:** The actual image files (`.png`, `.jpg`, etc.) that the model analyzed.

### 4.1. Model Output Files (`*_outputs.xlsx`)

- **Format:**  
  Each model's output should be in a separate Excel file. The filename must follow the pattern:  
  `MODELNAME_outputs.xlsx`  
  (e.g., `llava_outputs.xlsx`, `resnet50_outputs.xlsx`).

- **Required Columns:**

  - **Image:** This column must contain the exact filename of the corresponding image (e.g., `10074001.png`).
  - **Response:** This column must contain the full textual output generated by the model for that image.

- **Location:**  
  Place these Excel files directly inside the `website/data/` directory within the project structure.

```
label-website/
├── website/
│   ├── data/
│   │   ├── llava_outputs.xlsx      <-- Place Excel files here
│   │   └── othermodel_outputs.xlsx <-- Place Excel files here
│   ├── static/
│   ├── templates/
│   └── app.py
└── requirements.txt
└── README.md
```

### 4.2. Image Files

- **Format:**  
  Standard image formats like PNG, JPG, and JPEG are supported.

- **Filenames:**  
  The image filenames must exactly match the names listed in the **Image** column of the corresponding Excel output file.

- **Location:**  
  Place all the image files directly inside the `website/static/images/` directory.

```
label-website/
├── website/
│   ├── data/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   │       ├── 10074001.png        <-- Place image files here
│   │       ├── 10074002.png        <-- Place image files here
│   │       └── ...                 <-- Place image files here
│   ├── templates/
│   └── app.py
└── requirements.txt
└── README.md
```

> **IMPORTANT:** Ensure the image filenames in the Excel sheet match the actual image files in the `static/images` folder, including the file extension (e.g., `.png`).

---

## 5. Verification Workflow (Using the Web Interface)

### 5.1. Select a Model

- **Action:**  
  Click on the name of the model you want to verify from the list on the home page. This action will take you to the main verification interface for that model.

### 5.2. Understanding the Verification Page

The verification page is divided into two main areas:

- **Main Content Area (Left & Center):**

  - **Image Display (Top):**  
    Shows the current image being verified.
  - **Model Response (Below Image, Left):**  
    Displays the raw textual output from the model for the current image. This is the "answer" you need to verify.
  - **Verification Form (Below Image, Right):**  
    Contains the input fields (the "criteria") you need to fill out based on your assessment of the image and the model’s response.
  - **Navigation Buttons (Bottom):**  
    Buttons include "Previous", "Next", and "Save".

- **Sidebar (Right):**
  - Lists all the images associated with the selected model.
  - Allows you to jump directly to any image by clicking its name.
  - Displays a green checkmark (✓) next to images that have been saved/verified.

### 5.3. Navigating Images

- **Sequential Navigation:**  
  Use the **"Next"** and **"Previous"** buttons below the form to move sequentially through the images.

- **Direct Navigation:**  
  Click on any image filename in the right-hand sidebar to jump directly to that image. The currently selected image will be highlighted.

### 5.4. Filling the Verification Form

For each image, follow these steps:

1. **Examine the Image:**  
   Carefully inspect the image displayed at the top. Note any relevant features (e.g., cracks, potholes).

2. **Read the Model Response:**  
   Review the text provided by the model in the "Model Response" section.

3. **Fill the Form:**  
   Complete the fields in the "Verification Criteria" form based on your interpretation of the image and the model’s response.

#### Verification Form Fields

- **Crack Identification:**

  - **1.1 a) Identify Crack Type:**  
    Provide a text description of the primary crack type(s) observed.
  - **1.1 b) # Transverse:**  
    Enter your count of transverse cracks.
  - **1.1 c) # of Longitude:**  
    Enter your count of longitudinal cracks.
  - **1.1 d) # of Alligator:**  
    Enter your count of alligator cracking areas.

- **Crack Pattern:**

  - **1.2:**  
    Provide a text description of the overall crack pattern.

- **Pothole Identification:**

  - **2.1 # of Potholes:**  
    Enter your count of potholes.
  - **2.2 Pothole Pattern:**  
    Provide a text description of the pothole pattern/distribution.

- **Severity Assessment:**

  - **Severity Assessment Notes / Description:**  
    Provide your overall text assessment of the severity of the defects shown.

- **Environmental and Surrounding Context:**
  - **4.1 Concentrated?:**  
    Select **"Yes"** or **"No"** if defects are concentrated in one area.
  - **4.2 List all Defect Types Seen:**  
    Provide a text list of all distinct defect types you observe.
  - **4.3 Near Utility Cut?:**  
    Select **"Yes"** or **"No"** if defects are near a utility cut/patch.
  - **4.4 Proof of Worsen Defect?:**  
    Select **"Yes"** or **"No"** if there's visual evidence that the defect is worsening (e.g., secondary cracking).
  - **4.5 a) Proof of Repairment?:**  
    Select **"Yes"** or **"No"** if there is visual evidence of previous repair attempts (e.g., sealed cracks, patches).
  - **4.5 b) List Evidence of Repairment:**  
    If 4.5a is **"Yes"**, provide a brief text description of the repair evidence.

### 5.5. Saving Your Verification

- **Save Action:**  
  After filling out the form for the current image, click the **"Save"** button.

- **Confirmation:**  
  A confirmation pop-up (e.g., "Verification saved successfully!") should appear.

- **Verification Status:**  
  When you click **"Save"**, the system marks an image as "verified" (if at least one form field is non-empty) by displaying a green checkmark (✓) next to the image filename in the sidebar. The save action immediately updates the corresponding JSON file on the server.  
  You can return to an image later to update or re-verify it by changing the form values and clicking **"Save"** again.

---

## 6. Output Data: The Verification JSON File

### 6.1. How Data is Saved

Every time you click the **"Save"** button for an image, the application updates (or creates) a JSON file specific to the model being verified.

### 6.2. File Location and Naming

- The verification data is stored in a JSON file named:

  ```
  MODELNAME_verification.json
  ```

  (e.g., `llava_verification.json`).

- This file is located in the `website/data/` directory, alongside the input Excel files.

### 6.3. JSON File Structure

The JSON file is structured as a dictionary (JSON object) with the following:

- **Keys:**  
  Each key is the filename of an image (e.g., `"10074001.png"`).

- **Values:**  
  Each value is a nested dictionary that includes:
  - **`"verified"`:**  
    A boolean flag (`true` or `false`). It is set to `true` if any data has been saved for that image (i.e., if any form field was non-empty when you last clicked **Save**). Otherwise, it is set to `false`.
  - **`"fields"`:**  
    A dictionary containing the actual data entered into the form fields. The keys in this dictionary match the `name` attributes of the form inputs (e.g., `"identify_crack_type"`, `"transverse"`, `"severity_assessment_text"`), and the values are the data you entered.

#### Example JSON Snippet

```json
{
  "10074001.png": {
    "verified": true,
    "fields": {
      "identify_crack_type": "Multiple longitudinal and transverse",
      "transverse": "5",
      "longitudinal": "3",
      "alligator": "1",
      "crack_pattern": "Grid-like in places",
      "num_potholes": "0",
      "pothole_pattern": "",
      "severity_assessment_text": "Moderate severity, multiple crack types present.",
      "concentrated": "No",
      "list_all_types": "Longitudinal, Transverse, Alligator",
      "near_utility_cut": "No",
      "proof_worsen_defect": "Yes",
      "proof_repairment": "No",
      "list_evidence_repairment": ""
    }
  },
  "10074002.png": {
    "verified": false,
    "fields": {
      "identify_crack_type": "",
      "transverse": "",
      "longitudinal": "",
      "alligator": "",
      "crack_pattern": "",
      "num_potholes": "",
      "pothole_pattern": "",
      "severity_assessment_text": "",
      "concentrated": "",
      "list_all_types": "",
      "near_utility_cut": "",
      "proof_worsen_defect": "",
      "proof_repairment": "",
      "list_evidence_repairment": ""
    }
  },
  "...": {}
}
```

---

## 7. Submitting Your Results

- **Submission Requirement:**  
  The JSON result files must be submitted as part of your verification process.

- **Final Reminder:**  
  Congratulations! You have now completed the setup and verification process. Be sure to save your work frequently using the **"Save"** button in the web interface. If you encounter any issues, check the file paths, data formats, and your browser’s developer console for errors.

---

With this guide, you should be fully equipped to prepare the input data, navigate through the verification workflow using the web interface, and submit your verification results. Happy verifying!
