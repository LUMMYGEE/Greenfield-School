// Script to initialize core subjects that all students take
// Run this once to set up core subjects in your Firestore database

import admin from "firebase-admin";
import { readFile } from "fs/promises";

// Dynamically import the service account key
const serviceAccount = JSON.parse(
  await readFile(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const initializeCoreSubjects = async () => {
  try {
    console.log('🚀 Starting subject initialization...');
    
    // Core subjects that ALL students take regardless of category
    const coreSubjects = [
      'English Language',
      'Mathematics',
      'Civic Education',
      'Physical Education',
      'Computer Studies'
    ];

    // Set core subjects in Firestore
    await db.collection('subjects').doc('core').set({
      subjects: coreSubjects
    });

    console.log('✅ Core subjects initialized successfully!');
    console.log('📚 Core subjects:', coreSubjects);
    
    // Initialize Junior subjects
    const juniorSubjects = [
      'Basic Science',
      'Basic Technology',
      'Social Studies',
      'Creative Arts',
      'French Language'
    ];

    await db.collection('subjects').doc('junior').set({
      subjects: juniorSubjects
    });

    console.log('✅ Junior subjects initialized!');
    console.log('📚 Junior subjects:', juniorSubjects);

    // Initialize Science subjects
    const scienceSubjects = [
      'Physics',
      'Chemistry',
      'Biology',
      'Further Mathematics',
      'Geography'
    ];

    await db.collection('subjects').doc('science').set({
      subjects: scienceSubjects
    });

    console.log('✅ Science subjects initialized!');
    console.log('📚 Science subjects:', scienceSubjects);

    // Initialize Art subjects
    const artSubjects = [
      'Literature in English',
      'Government',
      'History',
      'Christian Religious Studies',
      'Fine Arts',
      'Music'
    ];

    await db.collection('subjects').doc('art').set({
      subjects: artSubjects
    });

    console.log('✅ Art subjects initialized!');
    console.log('📚 Art subjects:', artSubjects);

    // Initialize Commercial subjects
    const commercialSubjects = [
      'Economics',
      'Accounting',
      'Commerce',
      'Business Studies',
      'Geography'
    ];

    await db.collection('subjects').doc('commercial').set({
      subjects: commercialSubjects
    });

    console.log('✅ Commercial subjects initialized!');
    console.log('📚 Commercial subjects:', commercialSubjects);

    console.log('\n🎉 ALL SUBJECT DEPARTMENTS INITIALIZED SUCCESSFULLY!');
    console.log('\n📋 Summary:');
    console.log(`   • Core subjects: ${coreSubjects.length} (All students)`);
    console.log(`   • Junior subjects: ${juniorSubjects.length} (Junior level only)`);
    console.log(`   • Science subjects: ${scienceSubjects.length} (Science category)`);
    console.log(`   • Art subjects: ${artSubjects.length} (Art category)`);
    console.log(`   • Commercial subjects: ${commercialSubjects.length} (Commercial category)`);
    
    console.log('\n✨ Your school portal is now ready with proper subject categorization!');
    console.log('\n🔧 Next steps:');
    console.log('   1. Go to your admin panel → Subjects');
    console.log('   2. You should now see all 5 departments (Core, Junior, Science, Art, Commercial)');
    console.log('   3. Assign teachers to subjects in your class management');
    console.log('   4. Test the enhanced assignment system!');
    
  } catch (error) {
    console.error('❌ Error initializing subjects:', error);
    console.error('💡 Make sure your serviceAccountKey.json file exists and has proper permissions.');
  }
};

// Run the initialization
initializeCoreSubjects()
  .then(() => {
    console.log('\n🏁 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });