
const internshipList = document.getElementById("internship-list");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error");
const emptyMessage = document.getElementById("empty");
const applicationForm = document.getElementById("application-form");
const formMessage = document.getElementById("form-message");
const submitButton = document.getElementById("submit-button");
const internshipInput = document.getElementById("internship_id");

async function loadInternships() {
  loading.hidden = false;
  errorMessage.hidden = true;
  emptyMessage.hidden = true;
  internshipList.replaceChildren();

  try {
    const response = await fetch("/api/internships");

    if (!response.ok) {
      throw new Error("Could not load internships.");
    }

    const result = await response.json();

    // Supports either an array or an object containing an array.
    const internships = Array.isArray(result)
      ? result
      : result.internships ?? result.data;

    if (!Array.isArray(internships)) {
      throw new Error("Unexpected API response format.");
    }

    if (internships.length === 0) {
      emptyMessage.hidden = false;
      return;
    }

    internships.forEach((internship) => {
      const card = document.createElement("article");
      card.className = "internship-card";

      const title = document.createElement("h3");
      title.textContent = internship.title;

      const company = document.createElement("p");
      company.textContent = `Company: ${internship.company}`;

      const location = document.createElement("p");
      location.textContent = `Location: ${internship.location}`;

      const type = document.createElement("p");
      type.textContent = `Type: ${internship.type}`;

      const id = document.createElement("p");
      id.textContent = `Internship ID: ${internship.id}`;

      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Apply for this internship";

      button.addEventListener("click", () => {
        internshipInput.value = internship.id;
        document.getElementById("application-form").scrollIntoView({
          behavior: "smooth"
        });
        document.getElementById("applicant_name").focus();
      });

      card.append(title, company, location, type, id, button);
      internshipList.appendChild(card);
    });
  } catch (error) {
    errorMessage.textContent =
      "Unable to load internships. Please check the server and try again.";
    errorMessage.hidden = false;
  } finally {
    loading.hidden = true;
  }
}

applicationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formMessage.textContent = "";

  if (!applicationForm.reportValidity()) {
    return;
  }

  const internshipId = Number(internshipInput.value);
  const phone = document.getElementById("phone").value.trim();
  const resumeLink = document.getElementById("resume_link").value.trim();

  if (!Number.isInteger(internshipId) || internshipId < 1) {
    formMessage.textContent = "Please enter a valid internship ID.";
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    formMessage.textContent = "Enter a valid 10-digit phone number.";
    return;
  }

  try {
    const parsedResumeUrl = new URL(resumeLink);

    if (!["http:", "https:"].includes(parsedResumeUrl.protocol)) {
      throw new Error("Invalid resume URL");
    }
  } catch {
    formMessage.textContent = "Enter a valid HTTP or HTTPS resume URL.";
    return;
  }

  const application = {
    internship_id: internshipId,
    applicant_name: document.getElementById("applicant_name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone,
    resume_link: resumeLink
  };

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(application)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Application submission failed.");
    }

    formMessage.textContent =
      `Success! Your application ID is ${result.application_id}.`;
    applicationForm.reset();
  } catch (error) {
    formMessage.textContent =
      error.message || "Could not submit application. Please try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit Application";
  }
});

loadInternships();
