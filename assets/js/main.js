// Main JavaScript for Projekt AI website

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add active class to navigation links on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollY >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });

        // Add scroll animations for sections
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - window.innerHeight / 1.2)) {
                section.classList.add('animated');
            }
        });
    });
    
    // Button hover effects
    const buttons = document.querySelectorAll('.btn, .demo-button, .workflow-button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });

    // Gradient text effect
    const gradientTextElements = document.querySelectorAll('.gradient-text');
    let gradientAngle = 0;

    function animateGradients() {
        gradientAngle = (gradientAngle + 0.5) % 360;
        gradientTextElements.forEach(el => {
            el.style.background = `linear-gradient(${gradientAngle}deg, #00c6ff, #bc61ff)`;
            el.style.webkitBackgroundClip = 'text';
            el.style.backgroundClip = 'text';
            el.style.color = 'transparent';
        });
        requestAnimationFrame(animateGradients);
    }

    animateGradients();
    
    // API Demo Tab Functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const demoPanels = document.querySelectorAll('.demo-panel');
    
    if (tabButtons.length > 0 && demoPanels.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons and panels
                tabButtons.forEach(btn => btn.classList.remove('active'));
                demoPanels.forEach(panel => panel.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Show corresponding panel
                const targetPanelId = button.getAttribute('data-tab');
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                    
                    // Add animation to the appearing panel
                    targetPanel.style.opacity = 0;
                    targetPanel.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        targetPanel.style.transition = 'opacity 0.5s, transform 0.5s';
                        targetPanel.style.opacity = 1;
                        targetPanel.style.transform = 'translateY(0)';
                    }, 50);
                }
            });
        });
    }
    
    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            // In a real implementation, you would send this data to a server
            // For demo purposes, just show an alert
            alert(`Thank you for your message, ${name}! We'll get back to you at ${email} soon.`);
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Create modal element for workflow diagrams
    const modal = document.querySelector('.workflow-modal');
    const closeModal = document.querySelector('.close-modal');
    
    // Workflow diagrams data
    const workflowData = {
        'customer-support': {
            title: 'Customer Support Automation Workflow',
            image: 'assets/img/workflow-support.png',
            description: `
                <p>This automation workflow reduces response times by 68% through intelligent ticket routing and AI-powered response generation.</p>
                <h4>Key Components:</h4>
                <ul>
                    <li><strong>Intelligent Ticket Classification:</strong> Automatically categorizes incoming support requests based on content analysis</li>
                    <li><strong>Priority Assignment:</strong> Uses predefined rules to assign priority levels based on customer tier, issue type, and keywords</li>
                    <li><strong>Agent Matching:</strong> Routes tickets to the most appropriate agent based on expertise, availability, and historical performance</li>
                    <li><strong>AI Response Generation:</strong> Provides agents with response templates and suggestions based on similar past tickets</li>
                    <li><strong>Automated Follow-up:</strong> Schedules follow-up communications and satisfaction surveys</li>
                </ul>
                <p>This workflow can be customized for your specific support channels, team structure, and business rules.</p>
            `
        },
        'data-processing': {
            title: 'Data Processing Pipeline',
            image: 'assets/img/workflow-data.png',
            description: `
                <p>This end-to-end data automation workflow saves 15+ hours weekly by streamlining data collection, cleaning, analysis, and reporting.</p>
                <h4>Key Components:</h4>
                <ul>
                    <li><strong>Data Collection:</strong> Automated gathering from multiple sources (APIs, databases, files) on schedule or trigger</li>
                    <li><strong>Data Validation:</strong> Checks for missing values, duplicates, and format inconsistencies</li>
                    <li><strong>Data Transformation:</strong> Applies specified business rules and conversions</li>
                    <li><strong>Analysis Engine:</strong> Processes data through predefined models and algorithms</li>
                    <li><strong>Reporting:</strong> Generates dashboards and distributes reports to stakeholders</li>
                    <li><strong>Error Handling:</strong> Detects and resolves common issues without manual intervention</li>
                </ul>
                <p>This workflow can be adapted to your data sources, analysis requirements, and reporting needs.</p>
            `
        },
        'sales-leads': {
            title: 'Sales Lead Qualification System',
            image: 'assets/img/workflow-sales.png',
            description: `
                <p>This AI-powered lead qualification workflow increased conversion rates by 32% by automating the scoring and routing of sales leads.</p>
                <h4>Key Components:</h4>
                <ul>
                    <li><strong>Lead Capture:</strong> Collects prospect information from website forms, social media, and other channels</li>
                    <li><strong>Enrichment:</strong> Augments lead data with information from third-party sources</li>
                    <li><strong>Scoring Algorithm:</strong> Assigns quality scores based on demographic, behavioral, and engagement factors</li>
                    <li><strong>Segmentation:</strong> Categorizes leads by buyer persona, industry, and purchase intent</li>
                    <li><strong>Sales Rep Assignment:</strong> Routes qualified leads to appropriate sales team members</li>
                    <li><strong>Follow-up Automation:</strong> Schedules personalized outreach through preferred channels</li>
                </ul>
                <p>This workflow can be tailored to your specific sales process, qualification criteria, and CRM system.</p>
            `
        }
    };
    
    // Handle workflow button clicks
    const workflowButtons = document.querySelectorAll('.workflow-button');
    
    workflowButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            // Determine which workflow was clicked based on title or index
            let workflowId;
            const cardTitle = this.closest('.workflow-card').querySelector('h3').textContent.toLowerCase();
            
            if (cardTitle.includes('customer support')) {
                workflowId = 'customer-support';
            } else if (cardTitle.includes('data processing')) {
                workflowId = 'data-processing';
            } else if (cardTitle.includes('sales lead')) {
                workflowId = 'sales-leads';
            }
            
            if (workflowId && workflowData[workflowId]) {
                const data = workflowData[workflowId];
                
                // Populate modal with workflow data
                modal.querySelector('.modal-title').textContent = data.title;
                modal.querySelector('.modal-image').src = data.image;
                modal.querySelector('.modal-description').innerHTML = data.description;
                
                // Show modal with animation
                modal.style.display = 'flex';
                modal.style.opacity = 0;
                document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
                
                setTimeout(() => {
                    modal.style.transition = 'opacity 0.3s ease';
                    modal.style.opacity = 1;
                }, 50);
            }
        });
    });
    
    // Close modal when clicking the X
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.opacity = 0;
            
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Enable scrolling again
            }, 300);
        });
    }
    
    // Close modal when clicking outside the content
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.opacity = 0;
                
                setTimeout(() => {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 300);
            }
        });
    }
    
    // Handle demo button clicks
    const demoButtons = document.querySelectorAll('.demo-button');
    
    demoButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get parent demo panel
            const demoPanel = this.closest('.demo-panel');
            if (demoPanel) {
                const demoTitle = demoPanel.querySelector('h3').textContent;
                
                // Create a simple popup
                const popup = document.createElement('div');
                popup.className = 'demo-popup';
                popup.innerHTML = `
                    <div class="demo-popup-content">
                        <button class="close-popup">&times;</button>
                        <h3>Demo Coming Soon</h3>
                        <p>${demoTitle} demo is currently in development.</p>
                        <p>Sign up for early access to our platform demos.</p>
                        <div class="popup-actions">
                            <button class="btn btn-primary popup-signup">Sign Up for Early Access</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(popup);
                document.body.style.overflow = 'hidden';
                
                // Add animation
                setTimeout(() => {
                    popup.style.opacity = 1;
                }, 50);
                
                // Handle popup close
                popup.querySelector('.close-popup').addEventListener('click', () => {
                    popup.style.opacity = 0;
                    setTimeout(() => {
                        document.body.removeChild(popup);
                        document.body.style.overflow = 'auto';
                    }, 300);
                });
                
                // Handle signup button
                popup.querySelector('.popup-signup').addEventListener('click', () => {
                    popup.style.opacity = 0;
                    setTimeout(() => {
                        document.body.removeChild(popup);
                        document.body.style.overflow = 'auto';
                        
                        // Scroll to signup section
                        const contactSection = document.querySelector('#contact');
                        if (contactSection) {
                            window.scrollTo({
                                top: contactSection.offsetTop - 80,
                                behavior: 'smooth'
                            });
                        }
                    }, 300);
                });
            }
        });
    });
    
    // Handle custom workflow request button
    const requestCustomWorkflowBtn = document.querySelector('.workflow-request .btn');
    if (requestCustomWorkflowBtn) {
        requestCustomWorkflowBtn.addEventListener('click', function() {
            // Scroll to contact section
            const contactSection = document.querySelector('#contact');
            if (contactSection) {
                window.scrollTo({
                    top: contactSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Handle modal buttons
    const requestCustomizationBtn = document.querySelector('.request-customization');
    const downloadWorkflowBtn = document.querySelector('.download-workflow');
    
    if (requestCustomizationBtn) {
        requestCustomizationBtn.addEventListener('click', function() {
            // Close modal
            modal.style.opacity = 0;
            
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Scroll to contact section
                const contactSection = document.querySelector('#contact');
                if (contactSection) {
                    window.scrollTo({
                        top: contactSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }, 300);
        });
    }
    
    if (downloadWorkflowBtn) {
        downloadWorkflowBtn.addEventListener('click', function() {
            // Get current workflow diagram
            const workflowImage = modal.querySelector('.modal-image').src;
            const workflowTitle = modal.querySelector('.modal-title').textContent;
            
            // Create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = workflowImage;
            downloadLink.download = workflowTitle.replace(/\s+/g, '-').toLowerCase() + '.png';
            downloadLink.click();
        });
    }
    
    // Handle call-to-action buttons
    const signUpFreeBtn = document.querySelector('.signup-offer .btn');
    
    if (signUpFreeBtn) {
        signUpFreeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Create a signup form popup
            const popup = document.createElement('div');
            popup.className = 'demo-popup';
            popup.innerHTML = `
                <div class="demo-popup-content">
                    <button class="close-popup">&times;</button>
                    <h3>Get Your Free Credits</h3>
                    <p>Sign up now to receive $200 in free credits to try our platform.</p>
                    <form id="signupForm" class="popup-form">
                        <div class="form-group">
                            <label for="signup-name" class="form-label">Your Name</label>
                            <input type="text" id="signup-name" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-email" class="form-label">Your Email</label>
                            <input type="email" id="signup-email" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="signup-company" class="form-label">Company Name</label>
                            <input type="text" id="signup-company" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Sign Up</button>
                    </form>
                </div>
            `;
            
            document.body.appendChild(popup);
            document.body.style.overflow = 'hidden';
            
            // Add animation
            setTimeout(() => {
                popup.style.opacity = 1;
            }, 50);
            
            // Handle popup close
            popup.querySelector('.close-popup').addEventListener('click', () => {
                popup.style.opacity = 0;
                setTimeout(() => {
                    document.body.removeChild(popup);
                    document.body.style.overflow = 'auto';
                }, 300);
            });
            
            // Handle signup form submission
            popup.querySelector('#signupForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const name = popup.querySelector('#signup-name').value;
                const email = popup.querySelector('#signup-email').value;
                
                // Update popup content to show success message
                popup.querySelector('.demo-popup-content').innerHTML = `
                    <h3>Thank You!</h3>
                    <p>Thanks, ${name}! We've sent your free credits information to ${email}.</p>
                    <p>You can start using the platform immediately.</p>
                    <button class="btn btn-primary close-popup">Close</button>
                `;
                
                // Handle close button
                popup.querySelector('.close-popup').addEventListener('click', () => {
                    popup.style.opacity = 0;
                    setTimeout(() => {
                        document.body.removeChild(popup);
                        document.body.style.overflow = 'auto';
                    }, 300);
                });
            });
        });
    }

    // Add CSS for popups
    const popupStyles = document.createElement('style');
    popupStyles.textContent = `
        .demo-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(6, 12, 36, 0.9);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .demo-popup-content {
            background-color: var(--bg-secondary);
            padding: 2.5rem;
            border-radius: var(--border-radius);
            max-width: 500px;
            width: 90%;
            position: relative;
            border: 1px solid var(--border-color);
        }
        
        .close-popup {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 28px;
            color: var(--text-secondary);
            cursor: pointer;
            background: none;
            border: none;
            transition: var(--transition);
        }
        
        .close-popup:hover {
            color: var(--accent-color);
        }
        
        .popup-form {
            margin-top: 1.5rem;
        }
        
        .popup-actions {
            margin-top: 1.5rem;
            display: flex;
            justify-content: center;
        }
    `;
    document.head.appendChild(popupStyles);
}); 