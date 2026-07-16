(() => {
  "use strict";

  function initializeMobileNavigation() {
    const toggleButton = document.querySelector("[data-nav-toggle], .navbar-toggler");
    if (!toggleButton) return;

    const navigationId = toggleButton.getAttribute("aria-controls");
    const navigation = navigationId
      ? document.getElementById(navigationId)
      : document.querySelector("#primary-navigation");
    if (!navigation) return;

    const setNavigationState = (isOpen) => {
      toggleButton.setAttribute("aria-expanded", String(isOpen));
      toggleButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
      navigation.classList.toggle("is-open", isOpen);
      document.body.classList.toggle("nav-open", isOpen);
    };

    toggleButton.addEventListener("click", () => {
      setNavigationState(toggleButton.getAttribute("aria-expanded") !== "true");
    });

    navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => setNavigationState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggleButton.getAttribute("aria-expanded") === "true") {
        setNavigationState(false);
        toggleButton.focus();
      }
    });

    const desktopMediaQuery = window.matchMedia("(min-width: 768px)");
    desktopMediaQuery.addEventListener?.("change", (event) => {
      if (event.matches) setNavigationState(false);
    });
  }

  function getStatusElement(form) {
    const existingStatus = form.querySelector("[data-form-status], .form-status");
    if (existingStatus) {
      existingStatus.setAttribute("role", "status");
      existingStatus.setAttribute("aria-live", "polite");
      return existingStatus;
    }

    const status = document.createElement("p");
    status.className = "form-status";
    status.dataset.formStatus = "";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    form.append(status);
    return status;
  }

  function initializeContactForm() {
    const form = document.querySelector("#contact-form, form[data-contact-form], .contact-form");
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const status = getStatusElement(form);
    const serviceId = form.dataset.emailService;
    const templateId = form.dataset.emailTemplate;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (!window.emailjs || typeof window.emailjs.send !== "function") {
        status.textContent = "The email service is unavailable. Please try again later.";
        status.dataset.state = "error";
        return;
      }

      if (!serviceId || !templateId) {
        status.textContent = "The contact form has not been configured correctly.";
        status.dataset.state = "error";
        return;
      }

      const formData = new FormData(form);
      const templateParameters = {
        from_name: String(formData.get("name") ?? "").trim(),
        from_email: String(formData.get("email") ?? "").trim(),
        subject: String(formData.get("subject") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim()
      };

      const isInput = submitButton?.tagName === "INPUT";
      const originalButtonText = isInput ? submitButton.value : submitButton?.textContent;

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute("aria-busy", "true");
        if (isInput) submitButton.value = "Sending...";
        else submitButton.textContent = "Sending...";
      }

      status.textContent = "Sending your message...";
      status.dataset.state = "loading";

      try {
        await window.emailjs.send(serviceId, templateId, templateParameters);
        status.textContent = "Your message was sent successfully. Thank you!";
        status.dataset.state = "success";
        form.reset();
      } catch (error) {
        console.error("EmailJS submission failed:", error);
        status.textContent = "Your message could not be sent. Please try again.";
        status.dataset.state = "error";
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
          if (isInput) submitButton.value = originalButtonText || "Send Message";
          else submitButton.textContent = originalButtonText || "Send Message";
        }
      }
    });
  }

  function initializePortfolio() {
    initializeMobileNavigation();
    initializeContactForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePortfolio, { once: true });
  } else {
    initializePortfolio();
  }
})();