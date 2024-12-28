'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import styles from './JobApplicationForm.module.css';

const JobApplicationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    currentAddress: '',
    sameAsPermanent: false,
    phone: '',
    position: '',
    resume: null as File | null,
    additionalData: {} as { [key: string]: string },
  });

  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // New state to track submission status

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, resume: files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.resume) {
      setStatusMessage('Please upload your resume.');
      return;
    }

    try {
      // Sanitize file name and prepare upload path
      const sanitizedFileName = formData.resume.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const resumePath = `job_openings/resumes/${formData.email}_${sanitizedFileName}`;

      // Upload the resume to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('job_openings')
        .upload(resumePath, formData.resume);



      // Get public URL of the uploaded resume
      const { data: { publicUrl } } = supabase
        .storage
        .from('job_openings')
        .getPublicUrl(resumePath);

      if (!publicUrl) {
        setStatusMessage('Error retrieving the resume URL.');
        return;
      }

      // Insert job application into the database
      const payload = {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        current_address: formData.sameAsPermanent ? formData.address : formData.currentAddress,
        phone: formData.phone,
        position: formData.position,
        resume_url: publicUrl,
        additional_data: formData.additionalData,
      };

      const { error: dbError } = await supabase.from('job_openings').insert([payload]);


      // Show success message and hide the form
      setIsSubmitted(true); // Mark form as submitted
    } catch (err) {
      console.error('Unexpected error:', err);
      setStatusMessage('Unexpected error occurred while submitting your application.');
    }
  };

  return isSubmitted ? (
    <div className={styles.thankYouMessage}>
      <h1>Thank you for your interest in Mateng!</h1>
      <p>We will get in touch with you soon.</p>
    </div>
  ) : (
    <form className={styles.formContainer} onSubmit={handleSubmit}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <input
          type="checkbox"
          name="sameAsPermanent"
          checked={formData.sameAsPermanent}
          onChange={() =>
            setFormData((prev) => ({ ...prev, sameAsPermanent: !prev.sameAsPermanent }))
          }
          className={styles.checkbox}
        />
        <label className={styles.checkboxLabel}>Current Address same as Permanent</label>
      </div>
      {!formData.sameAsPermanent && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>Current Address:</label>
          <input
            type="text"
            name="currentAddress"
            value={formData.currentAddress}
            onChange={handleInputChange}
            required
            className={styles.input}
          />
        </div>
      )}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Phone:</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          className={styles.input}
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Position:</label>
        <select
          name="position"
          value={formData.position}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              position: e.target.value,
              additionalData: {}, // Reset additionalData when position changes
            }));
          }}
          required
          className={styles.select}
        >
          <option value="">Select</option>
          <option value="Delivery Agent">Delivery Agent</option>
          <option value="Video Editor">Video Editor</option>
          <option value="Customer Service Associate">Customer Service Associate</option>
        </select>
      </div>
      {formData.position === 'Video Editor' && (
        <div className={styles.dynamicFields}>
          <p>
            Please create a 30-second video edit featuring motion graphics, sound effects, and interactive elements. Use the resources provided in the following link: 
            <a 
              href="https://drive.google.com/drive/folders/1M_gTBJJgzDGHGSaQU6-SItlq2a_-Vgqq" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.link}
            >
              Project Link
            </a>
          </p>

          <label className={styles.label}>Paste your project link here?</label>
          <textarea
            name="whyHire"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                additionalData: { ...prev.additionalData, whyHire: e.target.value },
              }))
            }
            required
            className={styles.textarea}
          ></textarea>
        </div>
      )}
      {formData.position === 'Delivery Agent' && (
        <div className={styles.dynamicFields}>
          <label className={styles.label}>Can you drive outskirts from the main city?</label>
          <textarea
            name="driveOutskirts"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                additionalData: { ...prev.additionalData, driveOutskirts: e.target.value },
              }))
            }
            required
            className={styles.textarea}
          ></textarea>
          <label className={styles.label}>Do you have a two-wheeler?</label>
          <input
            type="text"
            name="vehicle"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                additionalData: { ...prev.additionalData, vehicle: e.target.value },
              }))
            }
            required
            className={styles.input}
          />
        </div>
      )}
      {formData.position === 'Customer Service Associate' && (
        <div className={styles.dynamicFields}>
          <label className={styles.label}>What do you think is the most important aspect of handling a customer problem?</label>
          <textarea
            name="customerProblem"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                additionalData: { ...prev.additionalData, customerProblem: e.target.value },
              }))
            }
            required
            className={styles.textarea}
          ></textarea>
          <label className={styles.label}>Why should we hire you for this role?</label>
          <textarea
            name="whyHire"
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                additionalData: { ...prev.additionalData, whyHire: e.target.value },
              }))
            }
            required
            className={styles.textarea}
          ></textarea>
        </div>
      )}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Resume:</label>
        <input
          type="file"
          name="resume"
          onChange={handleFileChange}
          required
          className={styles.input}
        />
      </div>
      <button type="submit" className={styles.submitButton}>
        Submit
      </button>
      {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}
    </form>
  );
};

export default JobApplicationForm;
