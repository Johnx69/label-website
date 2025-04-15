// static/js/main.js
document.addEventListener('DOMContentLoaded', function () {
  // Ensure records and verificationData are available globally or passed correctly
  if (typeof records === 'undefined' || typeof verificationData === 'undefined' || typeof modelName === 'undefined') {
    console.error("Essential data (records, verificationData, modelName) is missing. Cannot initialize verification.");
    return;
  }

  let currentIndex = parseInt(document.getElementById('current-index').value) || 0;
  const totalImages = records.length;

  if (totalImages === 0) {
      console.warn("No records found for this model.");
      return;
  }

  // Cache DOM elements
  const currentImageEl = document.getElementById('current-image');
  const modelResponseEl = document.getElementById('model-response');
  const imageListEl = document.getElementById('image-list');
  const form = document.getElementById('verification-form');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const saveBtn = document.getElementById('save-btn');

  // Function to update the tick in the sidebar for a given image, if it is verified.
  function updateTickForImage(imageFilename) {
    const listItem = imageListEl.querySelector(`li[data-img='${imageFilename}']`);
    if (listItem) {
        const tick = listItem.querySelector('.tick');
        if (tick && verificationData[imageFilename] && verificationData[imageFilename].verified === true) {
            tick.classList.add('verified');
        } else if (tick) {
            tick.classList.remove('verified');
        }
    } else {
        console.warn(`List item for image ${imageFilename} not found in sidebar.`);
    }
  }

  // Function to load the verification status for all images on page load.
  function initializeSidebarTicks() {
    Object.keys(verificationData).forEach(function (imageName) {
      updateTickForImage(imageName);
    });
  }

  // Function to populate the form for the current image.
  function loadCurrentImage() {
    if (currentIndex < 0 || currentIndex >= totalImages) {
        console.error(`Current index ${currentIndex} is out of bounds.`);
        currentIndex = 0;
    }

    const record = records[currentIndex];
    if (!record) {
        console.error(`No record found at index ${currentIndex}`);
        return;
    }
    const imageFilename = record['Image'];

    if (!currentImageEl) {
         console.error("Image element 'current-image' not found.");
         return;
    }

    currentImageEl.src = `/static/images/${imageFilename}`;
    currentImageEl.alt = `Image: ${imageFilename}`;

    if (!modelResponseEl) {
         console.error("Model response element 'model-response' not found.");
         return;
    }
    modelResponseEl.innerText = record['Response'] || "No response provided.";

    const verifFields = (verificationData[imageFilename] && verificationData[imageFilename].fields) ? verificationData[imageFilename].fields : {};

    // Helper function to safely set form values
    const setFieldValue = (id, value, isCheckbox = false) => {
        const element = document.getElementById(id);
        if (element) {
            if (isCheckbox) {
                element.checked = value || false;
            } else {
                element.value = value || "";
            }
        } else {
            console.warn(`Form element with id '${id}' not found.`);
        }
    };

    setFieldValue('identify_crack_type', verifFields.identify_crack_type);
    setFieldValue('transverse', verifFields.transverse);
    setFieldValue('longitudinal', verifFields.longitudinal);
    setFieldValue('alligator', verifFields.alligator);
    setFieldValue('crack_pattern', verifFields.crack_pattern);
    setFieldValue('num_potholes', verifFields.num_potholes);
    setFieldValue('pothole_pattern', verifFields.pothole_pattern);
    // New fields for Severity Assessment
    setFieldValue('estimated_pci', verifFields.estimated_pci);
    setFieldValue('pci_category', verifFields.pci_category);
    setFieldValue('severity_assessment_text', verifFields.severity_assessment_text);
    setFieldValue('concentrated', verifFields.concentrated);
    setFieldValue('list_all_types', verifFields.list_all_types);
    setFieldValue('near_utility_cut', verifFields.near_utility_cut);
    setFieldValue('proof_worsen_defect', verifFields.proof_worsen_defect);
    setFieldValue('proof_repairment', verifFields.proof_repairment);
    setFieldValue('list_evidence_repairment', verifFields.list_evidence_repairment);
    // New field for Future Repairment
    setFieldValue('future_repairment', verifFields.future_repairment);

    if (imageListEl) {
        Array.from(imageListEl.children).forEach(li => li.classList.remove('active'));
        let activeItem = imageListEl.querySelector(`li[data-index='${currentIndex}']`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else {
        console.error("Image list element 'image-list' not found.");
    }

    const currentIndexInput = document.getElementById('current-index');
    if (currentIndexInput) {
        currentIndexInput.value = currentIndex;
    } else {
        console.error("Hidden input 'current-index' not found.");
    }

    if(prevBtn) prevBtn.disabled = (currentIndex === 0);
    if(nextBtn) nextBtn.disabled = (currentIndex === totalImages - 1);
  }

  if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (currentIndex > 0) {
          currentIndex--;
          loadCurrentImage();
        }
      });
  } else {
      console.error("Previous button 'prev-btn' not found.");
  }

  if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (currentIndex < totalImages - 1) {
          currentIndex++;
          loadCurrentImage();
        }
      });
  } else {
       console.error("Next button 'next-btn' not found.");
  }

  if (imageListEl) {
      imageListEl.addEventListener('click', function (e) {
        const li = e.target.closest('li');
        if (li && li.hasAttribute('data-index')) {
          const newIndex = parseInt(li.getAttribute('data-index'));
           if (!isNaN(newIndex) && newIndex >= 0 && newIndex < totalImages) {
               currentIndex = newIndex;
               loadCurrentImage();
           } else {
                console.warn(`Invalid index ${li.getAttribute('data-index')} clicked.`);
           }
        }
      });
  } else {
      console.error("Image list element 'image-list' not found for click listener.");
  }

  // Save verification data via AJAX
  if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        if(currentIndex < 0 || currentIndex >= totalImages) {
            alert("Cannot save: Invalid image index selected.");
            return;
        }
        const record = records[currentIndex];
        const imageFilename = record['Image'];

        // Helper function to get form values
        const getFieldValue = (id, isCheckbox = false) => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Form element with id '${id}' not found during save.`);
                return isCheckbox ? false : "";
            }
            return isCheckbox ? element.checked : element.value;
        };

        // Gather form data including new fields
        let formData = {
          identify_crack_type: getFieldValue('identify_crack_type'),
          transverse: getFieldValue('transverse'),
          longitudinal: getFieldValue('longitudinal'),
          alligator: getFieldValue('alligator'),
          crack_pattern: getFieldValue('crack_pattern'),
          num_potholes: getFieldValue('num_potholes'),
          pothole_pattern: getFieldValue('pothole_pattern'),
          estimated_pci: getFieldValue('estimated_pci'),
          pci_category: getFieldValue('pci_category'),
          severity_assessment_text: getFieldValue('severity_assessment_text'),
          concentrated: getFieldValue('concentrated'),
          list_all_types: getFieldValue('list_all_types'),
          near_utility_cut: getFieldValue('near_utility_cut'),
          proof_worsen_defect: getFieldValue('proof_worsen_defect'),
          proof_repairment: getFieldValue('proof_repairment'),
          list_evidence_repairment: getFieldValue('list_evidence_repairment'),
          future_repairment: getFieldValue('future_repairment'),
        };

        let verified = Object.values(formData).some(val => {
            return val !== "" && val !== false && val !== null && typeof val !== 'undefined';
        });

        console.log("Saving data:", { model_name: modelName, image_filename: imageFilename, fields: formData, verified: verified });

        fetch('/save_verification', {
          method: 'POST',
          body: JSON.stringify({
            model_name: modelName,
            image_filename: imageFilename,
            fields: formData,
            verified: verified
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(res => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.error || `HTTP error ${res.status}`);
                }).catch(() => {
                     throw new Error(`HTTP error ${res.status}`);
                });
            }
            return res.json();
        })
          .then(data => {
            if (data.success) {
              if (!verificationData[imageFilename]) {
                  verificationData[imageFilename] = {};
              }
              verificationData[imageFilename].fields = formData;
              verificationData[imageFilename].verified = verified;

              updateTickForImage(imageFilename);
              alert('Verification saved successfully!');
            } else {
              alert('Error saving verification: ' + (data.error || 'Unknown error'));
            }
          }).catch(err => {
            console.error("Save Error:", err);
            alert('Error saving verification: ' + err.message);
          });
      });
  } else {
        console.error("Save button 'save-btn' not found.");
  }

  if (totalImages > 0) {
      loadCurrentImage();
      initializeSidebarTicks();
  } else {
       const mainContent = document.querySelector('.main-content');
       if (mainContent) {
           mainContent.innerHTML = '<p>No images found for this model.</p>';
       }
       if (imageListEl) imageListEl.innerHTML = '';
  }

});
