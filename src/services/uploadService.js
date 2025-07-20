// src/services/uploadService.js
import { uploadToCloudinary, validateFile } from '../utils/cloudinaryUpload';

export const uploadStudentImage = async (file, admissionNumber) => {
  try {
    // Validate the image file
    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB max for profile images
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (!validation.isValid) {
      throw new Error(`Invalid file: ${validation.errors.join(', ')}`);
    }

    // Upload to Cloudinary with student-specific folder and public ID
    const uploadOptions = {
      folder: 'students/profiles',
      publicId: `student_${admissionNumber}_profile`,
      tags: ['student', 'profile', admissionNumber]
    };

    const result = await uploadToCloudinary(file, uploadOptions);
    
    console.log('Student image uploaded to Cloudinary:', result.url);
    return result.url;
  } catch (error) {
    console.error('Error uploading student image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Additional utility for uploading other types of student documents
export const uploadStudentDocument = async (file, admissionNumber, documentType) => {
  try {
    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB max for documents
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp']
    });

    if (!validation.isValid) {
      throw new Error(`Invalid file: ${validation.errors.join(', ')}`);
    }

    const uploadOptions = {
      folder: `students/documents/${documentType}`,
      publicId: `student_${admissionNumber}_${documentType}_${Date.now()}`,
      tags: ['student', 'document', documentType, admissionNumber]
    };

    const result = await uploadToCloudinary(file, uploadOptions);
    
    console.log(`Student ${documentType} uploaded to Cloudinary:`, result.url);
    return result.url;
  } catch (error) {
    console.error(`Error uploading student ${documentType}:`, error);
    throw new Error(`Failed to upload ${documentType}: ${error.message}`);
  }
};