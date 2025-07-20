// Script to initialize core subjects that all students take
// Run this once to set up core subjects in your Firestore database

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAegrFy61gJkk0FkvTbYq5G2OiR_6sCaSk",
  authDomain: "pvschoolportal.firebaseapp.com",
  projectId: "pvschoolportal",
  storageBucket: "pvschoolportal.appspot.com", 
  messagingSenderId: "950640988099",
  appId: "1:950640988099:web:5238e619a6dd4938f1f776"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
    await setDoc(doc(db, 'subjects', 'core'), {
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

    await setDoc(doc(db, 'subjects', 'junior'), {
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

    await setDoc(doc(db, 'subjects', 'science'), {
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

    await setDoc(doc(db, 'subjects', 'art'), {
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

    await setDoc(doc(db, 'subjects', 'commercial'), {
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
    
  } catch (error) {
    console.error('❌ Error initializing subjects:', error);
    console.error('💡 Make sure you have proper Firebase permissions and internet connection.');
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