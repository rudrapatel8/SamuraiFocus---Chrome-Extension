chrome.runtime.onInstalled.addListener(() => {
    console.log("Samurai Focus extension installed")
  })
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "TIMER_COMPLETE") {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "images/icon128.png",
        title: "Samurai Focus",
        message: request.isBreak
          ? "Break time is over. Ready to focus again?"
          : "Focus session complete! Time for a break.",
        priority: 2,
      })
    }
  })
  
  