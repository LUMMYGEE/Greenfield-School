import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { uploadToCloudinary, validateFile } from '../utils/cloudinaryUpload';

const CAROUSEL_COLLECTION = 'carousel_images';

/**
 * Upload carousel image to Cloudinary and save metadata to Firestore
 */
export const uploadCarouselImage = async (file, imageData) => {
  try {
    // Validate the image file
    const validation = validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB max for carousel images
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (!validation.isValid) {
      throw new Error(`Invalid file: ${validation.errors.join(', ')}`);
    }

    // Upload to Cloudinary with carousel-specific folder
    const uploadOptions = {
      folder: 'school/carousel',
      tags: ['carousel', 'homepage', 'school']
    };

    const result = await uploadToCloudinary(file, uploadOptions);

    // Save image metadata to Firestore
    const carouselDoc = {
      src: result.url,
      publicId: result.publicId,
      alt: imageData.alt || '',
      title: imageData.title || '',
      caption: imageData.caption || '',
      isActive: imageData.isActive !== undefined ? imageData.isActive : true,
      order: imageData.order || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, CAROUSEL_COLLECTION), carouselDoc);
    
    console.log('Carousel image uploaded and saved:', result.url);
    return {
      id: docRef.id,
      ...carouselDoc,
      src: result.url
    };
  } catch (error) {
    console.error('Error uploading carousel image:', error);
    throw new Error(`Failed to upload carousel image: ${error.message}`);
  }
};

/**
 * Get all carousel images
 */
export const getCarouselImages = async () => {
  try {
    // Get all documents without any ordering to avoid index requirements
    const querySnapshot = await getDocs(collection(db, CAROUSEL_COLLECTION));
    const images = [];
    
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory by order first, then by createdAt
    return images.sort((a, b) => {
      // Primary sort by order (ascending)
      const orderA = a.order || 0;
      const orderB = b.order || 0;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // Secondary sort by createdAt (newest first) if order is the same
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
  } catch (error) {
    console.error('Error fetching carousel images:', error);
    throw new Error(`Failed to fetch carousel images: ${error.message}`);
  }
};

/**
 * Get only active carousel images for public display
 */
export const getActiveCarouselImages = async () => {
  try {
    const images = await getCarouselImages();
    return images.filter(image => image.isActive);
  } catch (error) {
    console.error('Error fetching active carousel images:', error);
    throw new Error(`Failed to fetch active carousel images: ${error.message}`);
  }
};

/**
 * Update carousel image metadata
 */
export const updateCarouselImage = async (imageId, updateData) => {
  try {
    const docRef = doc(db, CAROUSEL_COLLECTION, imageId);
    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updatedData);
    
    console.log('Carousel image updated:', imageId);
    return { id: imageId, ...updatedData };
  } catch (error) {
    console.error('Error updating carousel image:', error);
    throw new Error(`Failed to update carousel image: ${error.message}`);
  }
};

/**
 * Delete carousel image from Firestore
 * Note: This doesn't delete from Cloudinary - you might want to implement that separately
 */
export const deleteCarouselImage = async (imageId) => {
  try {
    const docRef = doc(db, CAROUSEL_COLLECTION, imageId);
    await deleteDoc(docRef);
    
    console.log('Carousel image deleted:', imageId);
    return true;
  } catch (error) {
    console.error('Error deleting carousel image:', error);
    throw new Error(`Failed to delete carousel image: ${error.message}`);
  }
};

/**
 * Reorder carousel images
 */
export const reorderCarouselImages = async (imageUpdates) => {
  try {
    const updatePromises = imageUpdates.map(({ id, order }) => {
      const docRef = doc(db, CAROUSEL_COLLECTION, id);
      return updateDoc(docRef, { 
        order, 
        updatedAt: serverTimestamp() 
      });
    });
    
    await Promise.all(updatePromises);
    
    console.log('Carousel images reordered');
    return true;
  } catch (error) {
    console.error('Error reordering carousel images:', error);
    throw new Error(`Failed to reorder carousel images: ${error.message}`);
  }
};