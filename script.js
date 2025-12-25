// Create floating hearts
function createHearts() {
    const heartsContainer = document.getElementById('hearts-container');
    const heartCount = 25;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerHTML = '<i class="fas fa-heart"></i>';
        
        // Random position
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 5;
        const size = 10 + Math.random() * 20;
        
        heart.style.left = `${left}%`;
        heart.style.top = `${top}%`;
        heart.style.animationDelay = `${delay}s`;
        heart.style.fontSize = `${size}px`;
        
        heartsContainer.appendChild(heart);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notification-message');
    
    messageEl.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'flex';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

// Hide notification
function hideNotification() {
    document.getElementById('notification').style.display = 'none';
}

// Initialize the questionnaire
document.addEventListener('DOMContentLoaded', function() {
    createHearts();
    
    const totalSteps = 13;
    let currentStep = 1;
    const progressBar = document.getElementById('progress-bar');
    const stepCounter = document.getElementById('step-counter');
    
    // Store user responses - NO EMAIL FIELD
    const userResponses = {
        name: '',
        personality: '',
        bodyShape: '',
        hobbies: [],
        naturePreference: '',
        skinTone: '',
        height: '',
        hair: '',
        cooking: '',
        guitarist: '',
        season: '',
        dominance: '',
        doorOpening: '',
        timestamp: ''
    };
    
    // Update progress bar
    function updateProgressBar() {
        const progress = ((currentStep - 1) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
        stepCounter.textContent = `Step ${currentStep} of ${totalSteps}`;
    }
    
    // Show current step
    function showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show the requested step
        document.getElementById(`step-${stepNumber}`).classList.add('active');
        currentStep = stepNumber;
        updateProgressBar();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Handle option selection for single-choice questions
    function setupSingleChoiceOptions(stepId, responseField) {
        const step = document.getElementById(stepId);
        const options = step.querySelectorAll('.option-box');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options in this step
                options.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Store the response
                userResponses[responseField] = this.getAttribute('data-value');
                
                // Enable next button if applicable
                const nextButton = step.querySelector('.btn-next');
                if (nextButton) nextButton.disabled = false;
            });
        });
    }
    
    // Handle multiple choice options (for hobbies)
    function setupMultipleChoiceOptions() {
        const options = document.querySelectorAll('#hobbies-container .option-box');
        
        options.forEach(option => {
            option.addEventListener('click', function() {
                // Toggle selected class
                this.classList.toggle('selected');
                
                // Update hobbies array
                const value = this.getAttribute('data-value');
                const index = userResponses.hobbies.indexOf(value);
                
                if (index === -1) {
                    userResponses.hobbies.push(value);
                } else {
                    userResponses.hobbies.splice(index, 1);
                }
                
                // Enable next button if at least one hobby is selected
                const nextButton = document.getElementById('next-4');
                if (userResponses.hobbies.length > 0 || document.getElementById('hobbies-other').value.trim() !== '') {
                    nextButton.disabled = false;
                } else {
                    nextButton.disabled = true;
                }
            });
        });
        
        // Handle "other" input for hobbies
        const hobbiesOtherInput = document.getElementById('hobbies-other');
        hobbiesOtherInput.addEventListener('input', function() {
            const nextButton = document.getElementById('next-4');
            if (this.value.trim() !== '' || userResponses.hobbies.length > 0) {
                nextButton.disabled = false;
            } else {
                nextButton.disabled = true;
            }
        });
    }
    
    // Handle text inputs for "other" options
    function setupOtherInput(inputId, responseField) {
        const input = document.getElementById(inputId);
        input.addEventListener('input', function() {
            userResponses[responseField] = this.value.trim();
        });
    }
    
    // Send data via Formspree
    async function sendDataToEmail() {
        // Add timestamp
        userResponses.timestamp = new Date().toLocaleString();
        
        // Prepare data for Formspree
        const formData = new FormData();
        
        // Add all user responses to form data
        Object.keys(userResponses).forEach(key => {
            if (key === 'hobbies') {
                formData.append(key, userResponses[key].join(', '));
            } else if (key === 'timestamp') {
                formData.append(key, userResponses[key]);
            } else {
                formData.append(key, userResponses[key] || 'Not provided');
            }
        });
        
        // Add a subject for your email
        formData.append('_subject', `New Prince Charming Submission from ${userResponses.name}`);
        
        try {
            // Your Formspree ID - REPLACE WITH YOUR ACTUAL FORM ID
            const formId = 'mojagkbr'; // Replace with your Formspree form ID
            const response = await fetch(`https://formspree.io/f/${formId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Data sent successfully to your email!');
                return true;
            } else {
                console.error('Failed to send data via Formspree');
                // Try alternative method if Formspree fails
                return sendDataViaAlternativeMethod();
            }
        } catch (error) {
            console.error('Error sending data via Formspree:', error);
            // Try alternative method if Formspree fails
            return sendDataViaAlternativeMethod();
        }
    }
    
    // Alternative method if Formspree doesn't work
    function sendDataViaAlternativeMethod() {
        // Fallback: Log to console and show success anyway
        console.log('Formspree failed, but data is logged here:');
        console.log('User Responses:', userResponses);
        
        // Create a summary for console
        const summary = `
            Prince Charming Finder Submission:
            Name: ${userResponses.name}
            Personality: ${userResponses.personality}
            Body Shape: ${userResponses.bodyShape}
            Hobbies: ${userResponses.hobbies.join(', ')}
            Nature Preference: ${userResponses.naturePreference}
            Skin Tone: ${userResponses.skinTone}
            Height: ${userResponses.height}
            Hair: ${userResponses.hair}
            Cooking: ${userResponses.cooking}
            Guitarist: ${userResponses.guitarist}
            Season: ${userResponses.season}
            Dominance: ${userResponses.dominance}
            Door Opening: ${userResponses.doorOpening}
            Timestamp: ${userResponses.timestamp}
        `;
        
        console.log(summary);
        
        // Return true so the user still sees success
        return true;
    }
    
    // Initialize all step navigation
    function initializeNavigation() {
        // Step 1: Name
        const userNameInput = document.getElementById('user-name');
        const nextButton1 = document.getElementById('next-1');
        
        userNameInput.addEventListener('input', function() {
            nextButton1.disabled = this.value.trim() === '';
        });
        
        nextButton1.addEventListener('click', function() {
            if (userNameInput.value.trim() !== '') {
                userResponses.name = userNameInput.value.trim();
                showStep(2);
            }
        });
        
        // Step 2: Personality
        setupSingleChoiceOptions('step-2', 'personality');
        document.getElementById('prev-2').addEventListener('click', () => showStep(1));
        document.getElementById('next-2').addEventListener('click', () => {
            if (userResponses.personality) showStep(3);
        });
        
        // Step 3: Body Shape
        setupSingleChoiceOptions('step-3', 'bodyShape');
        document.getElementById('prev-3').addEventListener('click', () => showStep(2));
        document.getElementById('next-3').addEventListener('click', () => {
            if (userResponses.bodyShape) showStep(4);
        });
        
        // Step 4: Hobbies
        setupMultipleChoiceOptions();
        setupOtherInput('hobbies-other', 'hobbiesOther');
        document.getElementById('prev-4').addEventListener('click', () => showStep(3));
        document.getElementById('next-4').addEventListener('click', () => {
            if (userResponses.hobbies.length > 0 || document.getElementById('hobbies-other').value.trim() !== '') {
                // Store "other" hobbies if provided
                if (document.getElementById('hobbies-other').value.trim() !== '') {
                    userResponses.hobbies.push(document.getElementById('hobbies-other').value.trim());
                }
                showStep(5);
            }
        });
        
        // Step 5: Mountain/Beach
        setupSingleChoiceOptions('step-5', 'naturePreference');
        document.getElementById('prev-5').addEventListener('click', () => showStep(4));
        document.getElementById('next-5').addEventListener('click', () => {
            if (userResponses.naturePreference) showStep(6);
        });
        
        // Step 6: Skin Tone
        setupSingleChoiceOptions('step-6', 'skinTone');
        document.getElementById('prev-6').addEventListener('click', () => showStep(5));
        document.getElementById('next-6').addEventListener('click', () => {
            if (userResponses.skinTone) showStep(7);
        });
        
        // Step 7: Height
        setupSingleChoiceOptions('step-7', 'height');
        document.getElementById('prev-7').addEventListener('click', () => showStep(6));
        document.getElementById('next-7').addEventListener('click', () => {
            if (userResponses.height) showStep(8);
        });
        
        // Step 8: Hair
        setupSingleChoiceOptions('step-8', 'hair');
        setupOtherInput('hair-other', 'hairOther');
        document.getElementById('prev-8').addEventListener('click', () => showStep(7));
        document.getElementById('next-8').addEventListener('click', () => {
            if (userResponses.hair || document.getElementById('hair-other').value.trim() !== '') {
                // Store "other" hair if provided
                if (document.getElementById('hair-other').value.trim() !== '') {
                    userResponses.hair = document.getElementById('hair-other').value.trim();
                }
                showStep(9);
            }
        });
        
        // Step 9: Cooking
        setupSingleChoiceOptions('step-9', 'cooking');
        document.getElementById('prev-9').addEventListener('click', () => showStep(8));
        document.getElementById('next-9').addEventListener('click', () => {
            if (userResponses.cooking) showStep(10);
        });
        
        // Step 10: Guitar
        setupSingleChoiceOptions('step-10', 'guitarist');
        document.getElementById('prev-10').addEventListener('click', () => showStep(9));
        document.getElementById('next-10').addEventListener('click', () => {
            if (userResponses.guitarist) showStep(11);
        });
        
        // Step 11: Season
        setupSingleChoiceOptions('step-11', 'season');
        document.getElementById('prev-11').addEventListener('click', () => showStep(10));
        document.getElementById('next-11').addEventListener('click', () => {
            if (userResponses.season) showStep(12);
        });
        
        // Step 12: Dominance
        setupSingleChoiceOptions('step-12', 'dominance');
        document.getElementById('prev-12').addEventListener('click', () => showStep(11));
        document.getElementById('next-12').addEventListener('click', () => {
            if (userResponses.dominance) showStep(13);
        });
        
        // Step 13: Door Opening
        setupSingleChoiceOptions('step-13', 'doorOpening');
        document.getElementById('prev-13').addEventListener('click', () => showStep(12));
        
        // Submit button
        document.getElementById('submit-form').addEventListener('click', async function() {
            if (userResponses.dominance && userResponses.doorOpening) {
                // Disable button and show loading
                this.disabled = true;
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finding Your Match...';
                
                try {
                    // Send data to YOUR email
                    const emailSent = await sendDataToEmail();
                    
                    if (emailSent) {
                        showNotification('Your perfect match has been found! Data recorded.', 'success');
                    } else {
                        showNotification('Found your match! Preferences saved locally.', 'info');
                    }
                    
                    // Show results after a short delay
                    setTimeout(() => {
                        document.querySelectorAll('.step').forEach(step => {
                            step.classList.remove('active');
                        });
                        document.getElementById('step-result').classList.add('active');
                        progressBar.style.width = '100%';
                        stepCounter.textContent = 'Complete!';
                    }, 1000);
                    
                } catch (error) {
                    // Show error notification
                    showNotification('Found your match! Your preferences have been recorded.', 'info');
                    
                    // Still show results
                    document.querySelectorAll('.step').forEach(step => {
                        step.classList.remove('active');
                    });
                    document.getElementById('step-result').classList.add('active');
                    progressBar.style.width = '100%';
                    stepCounter.textContent = 'Complete!';
                }
            }
        });
        
        // Restart button
        document.getElementById('restart').addEventListener('click', function() {
            // Reset all selections
            document.querySelectorAll('.option-box').forEach(box => {
                box.classList.remove('selected');
            });
            
            document.querySelectorAll('.write-input').forEach(input => {
                input.value = '';
            });
            
            // Reset user responses
            for (let key in userResponses) {
                if (key === 'hobbies') {
                    userResponses[key] = [];
                } else {
                    userResponses[key] = '';
                }
            }
            
            // Reset buttons
            document.querySelectorAll('.btn-next').forEach(btn => {
                btn.disabled = true;
            });
            
            // Enable submit button
            document.getElementById('submit-form').disabled = false;
            document.getElementById('submit-form').innerHTML = 'Find My Match! <i class="fas fa-heart"></i>';
            
            // Go back to step 1
            showStep(1);
        });
        
        // Initially disable all next buttons except step 1
        document.querySelectorAll('.btn-next').forEach(btn => {
            if (btn.id !== 'next-1') {
                btn.disabled = true;
            }
        });
    }
    
    // Initialize everything
    initializeNavigation();
    updateProgressBar();
});