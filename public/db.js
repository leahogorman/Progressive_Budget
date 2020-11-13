let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

// Here we are checking to see if the app is online
request.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

// Error function
request.onerror = function(event) {
  console.log("Error: " + event.target.errorCode);
};

// Saving objects to pending database
function saveRecord(record) {
  console.log(`[saveRecord] saving:`, record)
  const transaction = db.transaction(["pending"], "readwrite");

// Here we are accessing the objects that are pending
  const store = transaction.objectStore("pending");

 console.log (`[saveRecord] adding`, record)
  store.add(record);
}

// Function to check the database for pending objects
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  // Here we are accessing the objects that are pending
  const store = transaction.objectStore("pending");
 
  // getting everything from the database
  const getAll = store.getAll();

  // Our on success function
  getAll.onsuccess = function() {
    // if get all is successful then we post the results
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
    // Here we are accessing the objects that are pending
        const transaction = db.transaction(["pending"], "readwrite");

        // access your pending object store
        const store = transaction.objectStore("pending");

// clear
        store.clear();
      });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
