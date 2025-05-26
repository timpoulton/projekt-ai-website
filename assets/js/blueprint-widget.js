/**
 * Blueprint Generator AI Widget
 * Integrates with blueprint.projekt-ai.net backend
 * Provides floating chat interface for automation consulting
 */

class BlueprintWidget {
    constructor() {
        this.apiBase = 'https://blueprint.projekt-ai.net/api';
        this.sessionId = null;
        this.isOpen = false;
        this.conversationStep = 'start';
        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.loadStyles();
    }

    createWidget() {
        // Create floating chat button
        const chatButton = document.createElement('div');
        chatButton.id = 'blueprint-chat-button';
        chatButton.innerHTML = `
            <div class="chat-button-icon">
                <i class="fas fa-robot"></i>
            </div>
            <div class="chat-button-text">Get Custom Blueprint</div>
        `;
        document.body.appendChild(chatButton);

        // Create chat modal
        const chatModal = document.createElement('div');
        chatModal.id = 'blueprint-chat-modal';
        chatModal.innerHTML = `
            <div class="chat-modal-overlay"></div>
            <div class="chat-modal-content">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="chat-title">
                            <h3>Blueprint Generator AI</h3>
                            <p>Get a custom automation blueprint for your business</p>
                        </div>
                    </div>
                    <button class="chat-close" id="blueprint-chat-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chat-messages" id="blueprint-chat-messages">
                    <div class="welcome-message">
                        <div class="message bot-message">
                            <div class="message-content">
                                <p>👋 Hi! I'm your AI automation consultant.</p>
                                <p>I'll help you create a custom automation blueprint for your business. This usually takes 3-5 minutes.</p>
                                <p><strong>What would you like to automate?</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="chat-input-area">
                    <div class="chat-input-container">
                        <input type="text" id="blueprint-chat-input" placeholder="Describe what you'd like to automate..." />
                        <button id="blueprint-chat-send">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    <div class="chat-suggestions" id="blueprint-chat-suggestions">
                        <button class="suggestion-btn" data-suggestion="Social media posting and content creation">📱 Social Media Automation</button>
                        <button class="suggestion-btn" data-suggestion="Customer support and inquiry management">💬 Customer Support</button>
                        <button class="suggestion-btn" data-suggestion="Data entry and document processing">📄 Data Processing</button>
                        <button class="suggestion-btn" data-suggestion="Email marketing and lead nurturing">📧 Email Marketing</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(chatModal);
    }

    loadStyles() {
        const styles = `
            #blueprint-chat-button {
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #00ff88, #ff0080);
                color: white;
                border-radius: 50px;
                padding: 15px 25px;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 12px;
                font-family: 'Inter', sans-serif;
                font-weight: 600;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            }

            #blueprint-chat-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 40px rgba(0, 255, 136, 0.4);
            }

            @keyframes pulse {
                0%, 100% { box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3); }
                50% { box-shadow: 0 8px 32px rgba(0, 255, 136, 0.6); }
            }

            .chat-button-icon {
                font-size: 20px;
            }

            .chat-button-text {
                font-size: 14px;
                white-space: nowrap;
            }

            #blueprint-chat-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: none;
                font-family: 'Inter', sans-serif;
            }

            #blueprint-chat-modal.open {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chat-modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
            }

            .chat-modal-content {
                position: relative;
                width: 90%;
                max-width: 500px;
                height: 80%;
                max-height: 700px;
                background: #1a1a1a;
                border-radius: 20px;
                border: 1px solid #333;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }

            .chat-header {
                background: linear-gradient(135deg, #00ff88, #ff0080);
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: white;
            }

            .chat-header-info {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .chat-avatar {
                width: 50px;
                height: 50px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }

            .chat-title h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 700;
            }

            .chat-title p {
                margin: 5px 0 0 0;
                font-size: 14px;
                opacity: 0.9;
            }

            .chat-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 10px;
                border-radius: 50%;
                transition: background 0.3s ease;
            }

            .chat-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #0a0a0a;
            }

            .message {
                margin-bottom: 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
            }

            .bot-message {
                justify-content: flex-start;
            }

            .user-message {
                justify-content: flex-end;
            }

            .message-content {
                max-width: 80%;
                padding: 15px 20px;
                border-radius: 20px;
                line-height: 1.5;
            }

            .bot-message .message-content {
                background: #1a1a1a;
                color: #ffffff;
                border: 1px solid #333;
            }

            .user-message .message-content {
                background: linear-gradient(135deg, #00ff88, #ff0080);
                color: white;
                margin-left: auto;
            }

            .chat-input-area {
                padding: 20px;
                background: #1a1a1a;
                border-top: 1px solid #333;
            }

            .chat-input-container {
                display: flex;
                gap: 10px;
                margin-bottom: 15px;
            }

            #blueprint-chat-input {
                flex: 1;
                padding: 15px 20px;
                background: #0a0a0a;
                border: 1px solid #333;
                border-radius: 25px;
                color: white;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s ease;
            }

            #blueprint-chat-input:focus {
                border-color: #00ff88;
            }

            #blueprint-chat-send {
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #00ff88, #ff0080);
                border: none;
                border-radius: 50%;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s ease;
            }

            #blueprint-chat-send:hover {
                transform: scale(1.1);
            }

            .chat-suggestions {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .suggestion-btn {
                background: #333;
                border: 1px solid #555;
                color: white;
                padding: 8px 15px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s ease;
            }

            .suggestion-btn:hover {
                background: linear-gradient(135deg, #00ff88, #ff0080);
                border-color: transparent;
            }

            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 15px 20px;
                background: #1a1a1a;
                border-radius: 20px;
                margin-bottom: 20px;
                border: 1px solid #333;
            }

            .typing-dot {
                width: 8px;
                height: 8px;
                background: #00ff88;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }

            @media (max-width: 768px) {
                .chat-modal-content {
                    width: 95%;
                    height: 90%;
                }

                #blueprint-chat-button {
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                }

                .chat-button-text {
                    display: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    attachEventListeners() {
        // Chat button click
        document.getElementById('blueprint-chat-button').addEventListener('click', () => {
            this.openChat();
        });

        // Close button click
        document.getElementById('blueprint-chat-close').addEventListener('click', () => {
            this.closeChat();
        });

        // Overlay click
        document.querySelector('.chat-modal-overlay').addEventListener('click', () => {
            this.closeChat();
        });

        // Send message
        document.getElementById('blueprint-chat-send').addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key in input
        document.getElementById('blueprint-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Suggestion buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-btn')) {
                const suggestion = e.target.getAttribute('data-suggestion');
                document.getElementById('blueprint-chat-input').value = suggestion;
                this.sendMessage();
            }
        });
    }

    async openChat() {
        this.isOpen = true;
        document.getElementById('blueprint-chat-modal').classList.add('open');
        
        // Start conversation if not already started
        if (!this.sessionId) {
            await this.startConversation();
        }
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('blueprint-chat-modal').classList.remove('open');
    }

    async startConversation() {
        try {
            const response = await fetch(`${this.apiBase}/conversation/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: 'projekt-ai-website'
                })
            });

            const data = await response.json();
            if (data.success) {
                this.sessionId = data.sessionId;
            }
        } catch (error) {
            console.error('Failed to start conversation:', error);
        }
    }

    async sendMessage() {
        const input = document.getElementById('blueprint-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        input.value = '';

        // Hide suggestions after first message
        document.getElementById('blueprint-chat-suggestions').style.display = 'none';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch(`${this.apiBase}/conversation/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    message: message
                })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.hideTypingIndicator();

            if (data.success) {
                this.addMessage(data.message, 'bot');
                
                // Handle different conversation steps
                if (data.step === 'email_capture') {
                    this.showEmailCapture();
                } else if (data.step === 'blueprint_ready') {
                    this.showBlueprintDownload(data.blueprint);
                }
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
            console.error('Failed to send message:', error);
        }
    }

    addMessage(content, type) {
        const messagesContainer = document.getElementById('blueprint-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('blueprint-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showEmailCapture() {
        const inputArea = document.querySelector('.chat-input-area');
        inputArea.innerHTML = `
            <div class="email-capture">
                <h4 style="color: #00ff88; margin-bottom: 15px;">📧 Get Your Custom Blueprint</h4>
                <p style="color: #ccc; margin-bottom: 20px;">Enter your email to receive your personalized automation blueprint:</p>
                <div class="chat-input-container">
                    <input type="email" id="blueprint-email-input" placeholder="your@email.com" />
                    <button id="blueprint-email-send">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('blueprint-email-send').addEventListener('click', () => {
            this.submitEmail();
        });

        document.getElementById('blueprint-email-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitEmail();
            }
        });
    }

    async submitEmail() {
        const emailInput = document.getElementById('blueprint-email-input');
        const email = emailInput.value.trim();
        
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/blueprint/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    email: email
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.showBlueprintDownload(data.blueprint);
                this.addMessage('🎉 Perfect! Your custom automation blueprint has been generated and sent to your email.', 'bot');
            }
        } catch (error) {
            console.error('Failed to generate blueprint:', error);
            this.addMessage('Sorry, there was an error generating your blueprint. Please try again.', 'bot');
        }
    }

    showBlueprintDownload(blueprint) {
        const inputArea = document.querySelector('.chat-input-area');
        inputArea.innerHTML = `
            <div class="blueprint-download">
                <h4 style="color: #00ff88; margin-bottom: 15px;">✅ Blueprint Generated!</h4>
                <div style="background: #1a1a1a; padding: 20px; border-radius: 15px; margin-bottom: 20px; border: 1px solid #333;">
                    <h5 style="color: #fff; margin-bottom: 10px;">${blueprint.name}</h5>
                    <p style="color: #ccc; margin-bottom: 15px;">${blueprint.description}</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <span style="background: rgba(0,255,136,0.2); color: #00ff88; padding: 5px 12px; border-radius: 15px; font-size: 12px;">
                            ${blueprint.complexity} complexity
                        </span>
                        <span style="background: rgba(255,0,128,0.2); color: #ff0080; padding: 5px 12px; border-radius: 15px; font-size: 12px;">
                            ~${blueprint.estimated_setup_time} min setup
                        </span>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button id="blueprint-download-btn" style="flex: 1; background: linear-gradient(135deg, #00ff88, #ff0080); border: none; color: white; padding: 15px; border-radius: 10px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-download"></i> Download Blueprint
                    </button>
                    <button id="blueprint-contact-btn" style="flex: 1; background: #333; border: 1px solid #555; color: white; padding: 15px; border-radius: 10px; cursor: pointer;">
                        <i class="fas fa-comments"></i> Discuss Project
                    </button>
                </div>
            </div>
        `;

        document.getElementById('blueprint-download-btn').addEventListener('click', () => {
            window.open(`${this.apiBase}/blueprint/download/${blueprint.id}`, '_blank');
        });

        document.getElementById('blueprint-contact-btn').addEventListener('click', () => {
            window.location.href = 'mailto:hello@projekt-ai.net?subject=Automation Project Discussion&body=Hi! I just generated a custom automation blueprint and would like to discuss implementing it for my business.';
        });
    }
}

// Initialize the widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new BlueprintWidget();
}); 