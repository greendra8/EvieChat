// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     if (message.type === "mediaAccessGranted") {
//       // Media access granted in content script; request again in background script
//       navigator.mediaDevices.getUserMedia({ audio: true })
//         .then(stream => {
//           // Access granted; do something with stream
//         })
//         .catch(error => {
//           // Access denied; handle error
//           console.error(error);
//         });
//     }
//   });
  