import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/contact/submit', data);
      setIsSubmitted(true);
      reset();
      toast.success('Message sent successfully! We\'ll get back to you soon.');
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to send message';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-health-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-health-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Message Sent Successfully!
        </h3>
        <p className="text-gray-600 mb-6">
          Thank you for contacting us. We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="btn-secondary"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Send us a Message
        </h3>
        <p className="text-gray-600">
          We'd love to hear from you. Fill out the form below and we'll respond promptly.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Name cannot exceed 100 characters'
                }
              })}
              className={`input-field ${errors.name ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-danger-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
              className={`input-field ${errors.email ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-danger-600">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className="form-label">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            {...register('subject', {
              required: 'Subject is required',
              minLength: {
                value: 5,
                message: 'Subject must be at least 5 characters'
              },
              maxLength: {
                value: 200,
                message: 'Subject cannot exceed 200 characters'
              }
            })}
            className={`input-field ${errors.subject ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            placeholder="What is this message about?"
          />
          {errors.subject && (
            <p className="mt-1 text-sm text-danger-600">
              {errors.subject.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            {...register('category')}
            className="input-field"
          >
            <option value="general">General Inquiry</option>
            <option value="technical">Technical Support</option>
            <option value="support">Customer Support</option>
            <option value="feedback">Feedback</option>
            <option value="partnership">Partnership</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="form-label">
            Message *
          </label>
          <textarea
            id="message"
            rows={5}
            {...register('message', {
              required: 'Message is required',
              minLength: {
                value: 10,
                message: 'Message must be at least 10 characters'
              },
              maxLength: {
                value: 2000,
                message: 'Message cannot exceed 2000 characters'
              }
            })}
            className={`input-field resize-none ${errors.message ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''}`}
            placeholder="Tell us more about your inquiry..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-danger-600">
              {errors.message.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {register('message').value?.length || 0}/2000 characters
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Sending Message...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By submitting this form, you agree to our privacy policy and terms of service.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
