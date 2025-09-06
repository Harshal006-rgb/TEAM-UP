// Login form functionality
document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      
      const data = { email, password };

      try {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        
        if (res.ok) {
          // Store user data in sessionStorage for use across pages
          sessionStorage.setItem('currentUser', JSON.stringify(result.user));
          alert(result.message);
          window.location.href = "profile.html";
        } else {
          alert(result.message);
        }
      } catch (error) {
        alert("Login failed. Please try again.");
      }
    });
  }
});