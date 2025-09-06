// Function to get the current profile from local storage
function getProfile() {
    const profile = localStorage.getItem('userProfile');
    return profile ? JSON.parse(profile) : { name: 'Your Name', bio: 'Your Skills Here' };
}

// Function to get the current team members from local storage
function getTeamMembers() {
    const team = localStorage.getItem('teamMembers');
    return team ? JSON.parse(team) : [];
}

// Function to save profile and team data to a local file
function saveProfileToFile() {
    // Get the current profile and team data from local storage
    const profile = getProfile();
    const teamMembers = getTeamMembers();

    // Create a single object to hold all the data
    const dataToSave = {
        profile: profile,
        team: teamMembers
    };

    // Convert the data object to a formatted JSON string
    const jsonString = JSON.stringify(dataToSave, null, 2);

    // Create a Blob (Binary Large Object) from the string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a URL for the Blob object
    const url = URL.createObjectURL(blob);

    // Create a temporary link element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_profile_data.json'; // Set the desired file name
    document.body.appendChild(a);

    // Programmatically click the link to start the download
    a.click();

    // Clean up by revoking the object URL and removing the link
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Find the save button and attach the event listener
document.addEventListener('DOMContentLoaded', () => {
    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileToFile);
    }
});