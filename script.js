document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const books = [];
const RENDER_EVENT = "render-book";

function addBook() {
  const textBook = document.getElementById("inputBookTitle").value;
  const authorBook = document.getElementById("inputBookAuthor").value;
  const timestamp = document.getElementById("inputBookYear").value;
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    textBook,
    authorBook,
    timestamp,
    isComplete
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(books);
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = "Judul: " + bookObject.title;
  textTitle.setAttribute("data-testid", "bookItemTitle");

  const textAuthor = document.createElement("p");
  textAuthor.innerText = "Penulis: " + bookObject.author;
  textAuthor.setAttribute("data-testid", "bookItemAuthor");

  const textTimestamp = document.createElement("p");
  textTimestamp.innerText = "Tahun: " + bookObject.year;
  textTimestamp.setAttribute("data-testid", "bookItemYear");

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textTimestamp);

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(textContainer);
  container.setAttribute("data-bookid", `book-${bookObject.id}`);
  container.setAttribute("data-testid", "bookItem");

  const editButton = document.createElement("i");
  editButton.classList.add("ph", "ph-pencil-line");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.addEventListener("click", function () {
    showEditForm(bookObject.id);
  });
  container.append(editButton);

  if (bookObject.isComplete) {
    const undoButton = document.createElement("i");
    undoButton.classList.add("ph", "ph-x-circle");
    undoButton.setAttribute("data-testid", "bookItemIsCompleteButton");

    undoButton.addEventListener("click", function () {
      undoTaskFromComplete(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.setAttribute("data-testid", "bookItemDeleteButton");
    trashButton.id = "trash";

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("ph", "ph-trash");

    trashButton.appendChild(trashIcon);

    trashButton.addEventListener("click", function () {
      Swal.fire({
        title: "Apakah Kamu Yakin?",
        text: "Kamu tidak dapat mengembalikan buku ini!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus buku ini!",
      }).then((result) => {
        if (result.isConfirmed) {
          removeTaskFromComplete(bookObject.id);
          Swal.fire({
            title: "Terhapus!",
            text: "Bukumu telah terhapus.",
            icon: "success",
          });
        }
      });
    });

    container.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("i");
    checkButton.classList.add("ph", "ph-check-circle");
    checkButton.setAttribute("data-testid", "bookItemInCompleteButton");

    checkButton.addEventListener("click", function () {
      addTaskToComplete(bookObject.id);
    });

    const trashButton = document.createElement("button");
    trashButton.setAttribute("data-testid", "bookItemDeleteButton");
    trashButton.id = "trash";

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("ph", "ph-trash");

    trashButton.appendChild(trashIcon);

    trashButton.addEventListener("click", function () {
      Swal.fire({
        title: "Apakah Kamu Yakin?",
        text: "Kamu tidak dapat mengembalikan buku ini!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus buku ini!",
      }).then((result) => {
        if (result.isConfirmed) {
          removeTaskFromComplete(bookObject.id);
          Swal.fire({
            title: "Terhapus!",
            text: "Bukumu telah terhapus.",
            icon: "success",
          });
        }
      });
    });

    container.append(checkButton, trashButton);
  }

  document.getElementById("inputBookTitle").value = "";
  document.getElementById("inputBookAuthor").value = "";
  document.getElementById("inputBookYear").value = "";
  document.getElementById("inputBookIsComplete").checked = false;

  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompleteBOOKList = document.getElementById("incompleteBookshelfList");
  uncompleteBOOKList.innerHTML = "";

  const completeBOOKList = document.getElementById("completeBookshelfList");
  completeBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) uncompleteBOOKList.append(bookElement);
    else completeBOOKList.append(bookElement);
  }
});

function addTaskToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeTaskFromComplete(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function myComplete() {
  const isComplete = document.getElementById("inputBookIsComplete");
  const output = document.getElementById("completeBookshelfList");
  if (isComplete.checked == true) {
    inputBookIsComplete;
  } else {
    output;
  }
}

const searchBook = document.getElementById("searchBook");
const searchBookTitle = document.getElementById("searchBookTitle");

searchBook.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = searchBookTitle.value.toLowerCase().trim();

  const searchResults = books.filter((bookObject) => {
    return (
      bookObject.title.toLowerCase().includes(query) ||
      bookObject.author.toLowerCase().includes(query) ||
      bookObject.year.toString().includes(query)
    );
  });

  updateSearchResults(searchResults);
});

function updateSearchResults(results) {
  incompleteBookshelfList.innerHTML = "";
  completeBookshelfList.innerHTML = "";

  for (const bookObject of results) {
    const bukuItem = makeBook(bookObject);
    if (bookObject.isComplete) {
      completeBookshelfList.appendChild(bukuItem);
    } else {
      incompleteBookshelfList.appendChild(bukuItem);
    }
  }
}

document
  .getElementById("editBookForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    updateBook();
  });

function updateBook() {
  const bookTitle = document.getElementById("editTitle").value;
  const bookAuthor = document.getElementById("editAuthor").value;
  const bookYear = document.getElementById("editYear").value;
  const bookIsComplete = document.getElementById("editIsComplete").checked;

  const book = findBook(editingBookId);

  if (book) {
    book.title = bookTitle;
    book.author = bookAuthor;
    book.year = parseInt(bookYear);
    book.isComplete = bookIsComplete;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    closeEditForm();
  }
}

let editingBookId = null;

function showEditForm(bookId) {
  editingBookId = bookId;
  const book = findBook(bookId);

  if (book) {
    document.getElementById("editTitle").value = book.title;
    document.getElementById("editAuthor").value = book.author;
    document.getElementById("editYear").value = book.year;
    document.getElementById("editIsComplete").checked = book.isComplete;
    document.getElementById("editModal").style.display = "flex";
  }
}

function closeEditForm() {
  document.getElementById("editModal").style.display = "none";
}
