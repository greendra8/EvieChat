// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


//example of using a message handler from the inject scripts
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
  	chrome.pageAction.show(sender.tab.id);
    sendResponse();
  });

// This function will be called when the user clicks on the context menu item
function summariseText(info, tab) {
  
  // create an alert with the selected text
  alert("Selected text: " + info.selectionText);
}

// This will create a context menu item with the title "Summarise Text"
// It will appear only when some text is selected (contexts: ["selection"])
// It will call the summariseText function when clicked (onclick: summariseText)
// chrome.contextMenus.create({
//   title: "Summarise Text",
//   contexts: ["selection"],
//   onclick: summariseText
// });
