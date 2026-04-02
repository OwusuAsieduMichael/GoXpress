import { useState, useEffect, useRef } from "react";

const Help = () => {
  const [activeSection, setActiveSection] = useState("getting-started");
  
  // Contact form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Ref for focus management
  const nameInputRef = useRef(null);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }
    
    return newErrors;
  };

  // Modal control handlers
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", category: "", message: "" });
    setErrors({});
    setShowSuccess(false);
    setIsSubmitting(false);
  };

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Submit form via API
    setIsSubmitting(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/contact/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to send message' }));
        throw new Error(data.message || 'Failed to send message');
      }

      const data = await response.json();

      // Show success message
      setShowSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        closeModal();
      }, 2000);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: error.message || 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Escape key handler
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isModalOpen]);

  // Focus management
  useEffect(() => {
    if (isModalOpen && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isModalOpen]);

  const sections = {
    "getting-started": {
      title: "Getting Started",
      icon: "rocket_launch",
      content: [
        {
          question: "How do I process a sale?",
          answer: "Navigate to POS Sales from the sidebar. Search for products, add them to cart, enter customer details, and process payment."
        },
        {
          question: "How do I add a new product?",
          answer: "Go to Products page and click 'Add Product'. Fill in the product details including name, SKU, price, and category. Only Admin and Manager roles can add products."
        },
        {
          question: "How do I update inventory?",
          answer: "Visit the Inventory page, find the product, and click 'Update Stock'. You can add or reduce stock quantities. Only Admin and Manager roles can adjust inventory."
        }
      ]
    },
    "roles": {
      title: "User Roles & Permissions",
      icon: "admin_panel_settings",
      content: [
        {
          question: "What can an Admin do?",
          answer: "Admins have full access to all features including managing products, categories, inventory, processing sales, managing customers, and viewing reports."
        },
        {
          question: "What can a Manager do?",
          answer: "Managers have the same permissions as Admins - full access to manage products, inventory, sales, customers, and reports."
        },
        {
          question: "What can a Cashier do?",
          answer: "Cashiers can process sales at POS, manage customers, and view reports. They have read-only access to Products and Inventory pages."
        }
      ]
    },
    "features": {
      title: "Features Guide",
      icon: "lightbulb",
      content: [
        {
          question: "How does the POS system work?",
          answer: "The POS allows you to quickly add products to cart, calculate totals, apply discounts, and process payments. Stock is automatically reduced after each sale."
        },
        {
          question: "What reports are available?",
          answer: "View sales reports, inventory reports, customer analytics, and revenue trends. Filter by date range to analyze performance."
        },
        {
          question: "How do I manage customers?",
          answer: "Add new customers with their contact details, view purchase history, and track customer transactions from the Customers page."
        }
      ]
    },
    "troubleshooting": {
      title: "Troubleshooting",
      icon: "build",
      content: [
        {
          question: "I can't update products or inventory",
          answer: "Check your user role. Only Admin and Manager roles can edit products and adjust inventory. Cashiers have read-only access."
        },
        {
          question: "Products are not displaying",
          answer: "Ensure the backend server is running and your internet connection is stable. Try refreshing the page."
        },
        {
          question: "Payment processing failed",
          answer: "Verify that all required fields are filled correctly. Check that the customer information is valid and the payment amount matches the total."
        }
      ]
    }
  };

  return (
    <div className="help-page-wrapper">
      <div className="help-sticky-header">
        <h1>Help & Support</h1>
        <p className="page-subtitle">Find answers and learn how to use GoXpress</p>
      </div>

      <div className="help-scrollable-content">
        <div className="help-layout">
          <div className="help-sidebar">
            {Object.entries(sections).map(([key, section]) => (
              <button
                key={key}
                className={`help-category-btn ${activeSection === key ? "active" : ""}`}
                onClick={() => setActiveSection(key)}
              >
                <span className="material-icons-outlined">{section.icon}</span>
                <span>{section.title}</span>
              </button>
            ))}
          </div>

          <div className="help-content">
            <div className="help-section-header">
              <span className="material-icons-outlined help-section-icon">
                {sections[activeSection].icon}
              </span>
              <h2>{sections[activeSection].title}</h2>
            </div>

            <div className="help-faq">
              {sections[activeSection].content.map((item, index) => (
                <div key={index} className="help-faq-item">
                  <h3 className="help-question">
                    <span className="material-icons-outlined">help_outline</span>
                    {item.question}
                  </h3>
                  <p className="help-answer">{item.answer}</p>
                </div>
              ))}
            </div>

            <div className="help-contact">
              <div className="help-contact-card">
                <span className="material-icons-outlined">support_agent</span>
                <div>
                  <h4>Need More Help?</h4>
                  <p>Contact our support team for assistance</p>
                  <button className="contact-support-btn" onClick={openModal}>
                    <span className="material-icons-outlined">mail</span>
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal contact-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Support</h2>
              <button 
                className="ghost-btn" 
                onClick={closeModal}
                style={{ padding: "8px", minWidth: "auto" }}
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              {!showSuccess ? (
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="contact-name">
                      Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      ref={nameInputRef}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact-email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-category">
                      Issue Category <span className="required">*</span>
                    </label>
                    <select
                      id="contact-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="general">General Inquiry</option>
                    </select>
                    {errors.category && <span className="form-error">{errors.category}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-message">
                      Message <span className="required">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Describe your issue or question..."
                      rows="5"
                    />
                    {errors.message && <span className="form-error">{errors.message}</span>}
                  </div>

                  {errors.submit && (
                    <div className="form-error" style={{ marginBottom: '16px', padding: '12px', background: '#fee', borderRadius: '4px' }}>
                      {errors.submit}
                    </div>
                  )}

                  <p className="form-helper-text">
                    <span className="material-icons-outlined" style={{ fontSize: "16px" }}>schedule</span>
                    We typically respond within 24 hours
                  </p>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="ghost-btn"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="primary-btn contact-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="success-message">
                  <div className="success-message-icon">
                    <span className="material-icons-outlined">check_circle</span>
                  </div>
                  <h3>Thank You!</h3>
                  <p>Your message has been sent successfully. We typically respond within 24 hours.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
