import admin from "firebase-admin";
import { readFile } from "fs/promises";

const serviceAccount = JSON.parse(
  await readFile(new URL("./serviceAccountKey.json", import.meta.url))
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Student data based on your Auth users
const students = [
  {
    uid: "4geH3XAz7Wfzcj466XrKbhpqk1A3",
    firstName: "Thomas",
    surname: "Donald",
    admissionNumber: "T12525",
    email: "tdonald125@greenfield.edu.ng",
    class: "JSS 1",
    gender: "Male",
    dateOfBirth: "2010-05-15",
    profileImageUrl: null
  },
  {
    uid: "oWfSifgjIcf84L6dsoNSrX3mSri2", 
    firstName: "Adunni",
    surname: "Grace",
    admissionNumber: "A12525",
    email: "agrace125@greenfield.edu.ng",
    class: "JSS 2",
    gender: "Female", 
    dateOfBirth: "2009-08-22",
    profileImageUrl: null
  },
  {
    uid: "xVB4icP83SN1JaQOO2Mvyv3drUm2",
    firstName: "Bolaji",
    surname: "George", 
    admissionNumber: "B12525",
    email: "bgeorge125@greenfield.edu.ng",
    class: "JSS 3",
    gender: "Male",
    dateOfBirth: "2008-12-10",
    profileImageUrl: null
  },
  {
    uid: "d4PE1nG9RaTMD22doDEqItn9qGb2",
    firstName: "Wunmi",
    surname: "Williams",
    admissionNumber: "W12525", 
    email: "wwunmi125@greenfield.edu.ng",
    class: "Level 1",
    gender: "Female",
    dateOfBirth: "2007-03-18",
    profileImageUrl: null
  }
];

async function createStudentRecords() {
  try {
    for (const student of students) {
      await db.collection('students').doc(student.uid).set(student);
      console.log(`✅ Created student record: ${student.firstName} ${student.surname}`);
    }
    console.log(`🎉 All ${students.length} student records created successfully!`);
  } catch (error) {
    console.error("❌ Error creating student records:", error);
  }
  process.exit(0);
}

createStudentRecords();