// firebase.js
import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "./fireBaseConfig.js";
// import { user } from "./auth.js";
// console.log("User is imported :" + user.uid);

const booksCollectionRef = collection(db, 'books'); //collection(db, 'users', `${user.uid}`, 'books')

export const addBookToFirebase = async (book) => {
    try {
        await addDoc(booksCollectionRef, book);
    } catch (e) {
        console.error('Error adding book: ', e);
    }
};

export const getBooksFromFirebase = async () => {
    try {
        const booksSnapshot = await getDocs(booksCollectionRef);
        const booksList = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Books: ", booksList);
        return booksList;
    } catch (e) {
        console.error('Error getting books: ', e);
        return [];
    }
};

export const deleteBookFromFirebase = async (bookId) => {
    try {
        const bookDoc = doc(db, 'books', bookId);
        await deleteDoc(bookDoc);
    } catch (e) {
        console.error('Error deleting book: ', e);
    }
};

export const editBookInFirebase = async (bookId, updatedBook) => {
    try {
        const bookDoc = doc(db, 'books', bookId);
        await updateDoc(bookDoc, updatedBook);
    } catch (e) {
        console.error('Error updating book: ', e);
    }
};

export const getApiKey = async () => {
    try {
        const snapshot = await getDoc(doc(db, "apikey", "googlegenai"));
        if (snapshot.exists()) {
            const apiKey = snapshot.data().key;
            console.log("API Key fetched successfully");
            return apiKey;
        } else {
            console.error("No API key found in Firebase.");
        }
    } catch (error) {
        console.error("Error fetching API key:", error);
    }
};

console.log("firebase.js file initialized");
