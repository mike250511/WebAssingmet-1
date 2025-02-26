        //app.js
        console.log("app.js is running");
        import { collection, getDocs, addDoc, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
        import { db } from "./fireBaseConfig.js";
        // import apiKey from "./api.js";
        import { getUser } from "./auth.js";

        const user = await getUser();
        console.log("User is imported :", user);

        const userBooksDBName=`books_${user.uid}`;
        //----------------------------------------------------------
        const booksCollectionRef = collection(db, userBooksDBName); //collection(db, 'users', `${user.uid}`, 'books')
        
        export const addBookToFirebase = async (book) => {
            console.log('adding book', book);
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
        
        const deleteBookFromFirebase = async (bookId) => {
            try {
                const bookDoc = doc(booksCollectionRef, bookId);
                await deleteDoc(bookDoc);
            } catch (e) {
                console.error('Error deleting book: ', e);
            }
        };
        
        const editBookInFirebase = async (bookId, updatedBook) => {
            try {
                const bookDoc = doc(booksCollectionRef, bookId);
                await updateDoc(bookDoc, updatedBook);
            } catch (e) {
                console.error('Error updating book: ', e);
            }
        };
        
        const getApiKey = async () => {
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
        
        //------------------------------------------------------------
        
        const appendMessage = (message) => {
            const chatHistory = document.getElementById('chat-history');
            // aiInput.value = "";
            
            // Check if chatHistory exists in the DOM
            if (chatHistory) {
                const msgElement = document.createElement('div');
                msgElement.textContent = message;
                chatHistory.appendChild(msgElement);
            } else {
                console.error('chat-history element not found!');
            }
        };


        let aiInput = document.getElementById("chat-input");

        let aiInstructions = `
            If you askked about adding new book - send me response in JSON using following format (give rating 5 as default in string format):
            {
                "response": "book",
                "name": "<book title>",
                "author": "<author>",
                "genre": "<genre>",
                "rating": "<rating>"
            }
            `;
    
        const handleAiChatBot = async () => {
            console.log("Send button clicked");

            const userMessage = aiInput.value;
            
            let message = aiInstructions + userMessage;

            console.log("Message : " + message);

            const apiKey = await getApiKey(); // Call getApiKey to fetch the API key from Firebase
            if (!apiKey) {
                console.error("Error: API key is missing.");
                appendMessage("Error: Unable to fetch API key.");
                return; // Return early if the API key is not available
            }

            const fetchAIResponse = async (apiKey, message) => {

                
                console.log("Sending AI request, prompt: " + message);

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: message
                            }]
                        }]
                    })
                });

                console.log("Received response:", response);  // Log the entire response object
        
                const data = await response.json();
                console.log("Full AI Response: ", JSON.stringify(data, null, 2));
                // console.log("Full AI Response: ", data);  // Log the full AI response

                // Check response structure
                const aiResponse = data.candidates ? data.candidates[0].content.parts[0].text : "No AI response available";
                console.log("AI Response Text: ", aiResponse);  // Log the actual AI response
                // Clean the response by removing markdown formatting
                let cleanResponse = aiResponse.replace(/```json\s*\n|\n\s*```/g, '').trim();
                console.log("Cleaned AI Response Text: ", cleanResponse);  // Log the cleaned response
                
                
                try {
                    let parsedReply = JSON.parse(cleanResponse);
                    console.log("Extracting the ai response, " + parsedReply);
                    if(parsedReply.response != "book") {
                        throw "Ai responded in unexpected format";
                    }
                    let title = parsedReply.name;
                    let author = parsedReply.author;
                    let genre = parsedReply.genre;
                    let rating = parsedReply.rating;
                    if(!title || !author || !genre || !rating) {
                        throw `
                        Ai didn't send some required fields
                        `
                    }
                    handleAddBook({title, author, genre, rating});
                    appendMessage("The book was added successfully!");
                    
                }catch(error) {
                    console.log("Something wrong with ai response: " + bookTitle);
                    appendMessage("Something wrong with ai response, try again!");
                }

            };

            // Ensure the API key is fetched before making the AI request
            // const loadApiKey = async () => {
            //     apiKey = await getApiKey();  // Wait for API key to be fetched
            //     console.log("API Key loaded: ", apiKey);  // Log the API key
            // };

            // await loadApiKey();

            // console.log("AI request parameters:", { apiKey, prompt });  // Log the parameters being sent to the API

            // Now, fetch AI response only after the API key has been fetched
            if (apiKey && message) {
                console.log("API key and prompt are valid, calling fetchAIResponse...");
                await fetchAIResponse(apiKey, message);
            } else {
                console.error("Error: API key or prompt is missing.");
                appendMessage("Error: Unable to fetch API key or no prompt provided.");
            }

            document.getElementById("chat-input").value = "";
        };

        const aiButton = document.getElementById('send-btn');
        if (aiButton) {
            aiButton.addEventListener('click', handleAiChatBot);
            console.log("send button is pressed");
        } else {
            console.log("Send button not found");
        }

        const renderBooks = (booksToRender = books) => {
            const bookList = document.getElementById('book-list');
            if (bookList) {
                bookList.innerHTML = ''; // Clear current list
                booksToRender.forEach((book) => {
                    const bookItem = document.createElement('li');
                    bookItem.innerHTML = `
                        <div class="container">
                            <div>
                                <span class="book-title">${book.title}</span>
                                <span>written by</span>
                                <span class="book-author"> ${book.author}</span>
                                <span class="book-genre">(${book.genre})</span>
                                <span class="book-rating">Rating: ${book.rating}</span>
                            </div>
                            <div>
                                <button class="delete-btn">Delete</button>
                                <button class="edit-btn">Edit</button>
                            </div>
                        </div>
                    `;
                    bookList.appendChild(bookItem);
                    const handleDeleteBook = (bookId) => {
                        deleteBookFromFirebase(bookId).then(() => {
                            loadBooks();
                        });
                    };
                    // Add event listeners for delete and edit buttons
                    const deleteBtn = bookItem.querySelector('.delete-btn');
                    const editBtn = bookItem.querySelector('.edit-btn');
                    deleteBtn.addEventListener('click', () => handleDeleteBook(book.id));
                    if(editBtn) {
                        editBtn.addEventListener('click', () => {
                            // Prompt user for updated book details
                            const newTitle = prompt('Edit title', book.title);
                            const newAuthor = prompt('Edit author', book.author);
                            const newGenre = prompt('Edit genre', book.genre);
                            const newRating = prompt('Edit rating', book.rating);
                        
                            // Only update if the new values are valid
                            if (newTitle && newAuthor && newGenre && newRating) {
                                handleEditBook(book.id, { title: newTitle, author: newAuthor, genre: newGenre, rating: newRating });
                            } else {
                                alert('Please provide valid details to edit the book');
                            }
                        });
                    } else{
                        console.log("edit button doesn't exist");
                    }
                });
            }
        };

        

        // State variables
        let books = [];
        let filter = { author: '', genre: '' };

        // Load books on page load
        const loadBooks = async () => {
            books = await getBooksFromFirebase();
            renderBooks();
        };

        await loadBooks();
        
        const handleAddBook = (book) => {
            addBookToFirebase(book).then(() => {
                loadBooks();
            });
        };
        
        const addBtn = document.getElementById('add-btn');
        addBtn.addEventListener('click', (event) => {
            console.log('adding')
            event.preventDefault();
            const title = document.getElementById('book-title').value.trim();
            const author = document.getElementById('book-author').value.trim();
            const genre = document.getElementById('book-genre').value.trim();
            const rating = document.getElementById('book-rating').value.trim();

            // Ensure all fields are filled before adding the book
            if (title && author && genre && rating) {
                handleAddBook({ title, author, genre, rating });
            } else {
                alert('Please fill out all fields');
            }
            
            document.getElementById('book-title').value = "";
            document.getElementById('book-author').value = "";
            document.getElementById('book-genre').value = "";
            document.getElementById('book-rating').value = "";
        });
        

        // Initialize other app logic
            // Filter functionality
        // Filter functionality
        const titleFilterBtn = document.getElementById("title");
        const ratingFilterBtn = document.getElementById("rating");
        const genreFilterBtn = document.getElementById("genre");
        const authorFilterBtn = document.getElementById("author");
        const applyBtn = document.getElementById("apply-filter");
        const clearFields = document.getElementById("clear-fields");
        

        const handleFilterChange = (event) => {
            const { name, value } = event.target;
            filter = { ...filter, [name]: value }; // Update the filter state
            applyFilter(); // Apply the filter and render the books immediately
        };

        const applyFilter = () => {
            const filteredBooks = books.filter((book) => {
                return (
                    (filter.title ? book.title.toLowerCase().includes(filter.title.toLowerCase()) : true) &&
                    (filter.author ? book.author.toLowerCase().includes(filter.author.toLowerCase()) : true) &&
                    (filter.genre ? book.genre.toLowerCase().includes(filter.genre.toLowerCase()) : true) &&
                    (filter.rating ? book.rating.includes(filter.rating) : true)
                    
                );
            });
            renderBooks(filteredBooks); // Render filtered books immediately
        };

        

        // Apply the event listeners to the filter fields
        if (titleFilterBtn) {
            titleFilterBtn.addEventListener('input', handleFilterChange);
        }

        if (authorFilterBtn) {
            authorFilterBtn.addEventListener('input', handleFilterChange);
        }

        if (genreFilterBtn) {
            genreFilterBtn.addEventListener('input', handleFilterChange);
        }

        if (ratingFilterBtn) {
            ratingFilterBtn.addEventListener('input', handleFilterChange);
        }

        if (applyBtn) {
            applyBtn.addEventListener('click', applyFilter); // Optional: keep the apply button functionality if needed
        } else {
            console.log("Filter buttons not found");
        }

        if (clearFields) {
            clearFields.addEventListener('click', () => {
                titleFilterBtn.value = "";
                ratingFilterBtn.value = "";
                genreFilterBtn.value = "";
                authorFilterBtn.value = "";
                renderBooks();
            }); 
        } else {
            console.log("Clear Fields button is not found");
        }

        const handleEditBook = (bookId, updatedBook) => {
            console.log("edit button is pressed");
            editBookInFirebase(bookId, updatedBook).then(() => {
                loadBooks();
            });
        };

        aiInput.addEventListener("keypress", (event) => {
            if(event.key === "Enter") {
                console.log("Enter button was pressed");
                handleAiChatBot();
            }
        })
        const signOutBtn = document.getElementById("signOutBtn");
        signOutBtn.addEventListener("click", function (event) {
            localStorage.removeItem("credential");
            window.location.href = "index.html";
          });

        console.log("app.js is initialized");