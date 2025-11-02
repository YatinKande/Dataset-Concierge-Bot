var slotOrder = ['userID', 'topic', 'source', 'format', 'date', 'name', 'email'];
var slotPrompts = {
  userID: "Enter your UserID (email or any ID for personal tracking):",
  prevOrNew: "Type 'previous' to access your saved links, or 'new' to search for new datasets.",
  topic: "What topic dataset are you looking for?",
  source: "Two sources available: HuggingFace and Kaggle. Please choose from where you want your dataset.",
  format: "Which format? (e.g. CSV, JSON, or 'any' for all formats)",
  date: "Which date do you want data for? (e.g. 2025-01-01, or 'any' for top 10 datasets)",
  name: "Please enter your name:",
  email: "Your email (for results notification):"
};
var slotValues = { userID: null, topic: null, source: null, format: null, date: null, name: null, email: null, prevOrNew: null, userType: null };
var phase = "greeting";
var conversationStarted = false;
var slotFillingMode = false;
var onboardingSuggested = false;

function parseFlexibleDate(userInput) {
  if (/^(any|all|top|latest)$/i.test(userInput.trim())) return userInput.trim();
  let dateStr = userInput.trim().replace(/(\d{1,2})(st|nd|rd|th)\s+/gi, "$1 ");
  let parsedDate = new Date(dateStr);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split("T")[0];
  }
  return userInput.trim();
}

$(document).ready(function() {
  var $messages = $('.messages-content'), d, m, i = 0;
  window.alreadySuggestedHelp = false;

  $(window).load(function() {
    $messages.mCustomScrollbar();
    insertResponseMessage("Hello, I am your personal Concierge bot.");
    conversationStarted = true;
    phase = "greeting";
    onboardingSuggested = false;
  });

  function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', { scrollInertia: 10, timeout: 0 });
  }

  function setDate() {
    d = new Date();
    if (m != d.getMinutes()) {
      m = d.getMinutes();
      $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
    }
  }

  function startSlotFilling() {
    slotFillingMode = true;
    phase = "slotFilling";
    currentSlotIdx = 0;
    nextSlotPrompt();
  }

  function nextSlotPrompt() {
    while (currentSlotIdx < slotOrder.length && slotValues[slotOrder[currentSlotIdx]]) {
      currentSlotIdx++;
    }
    if (currentSlotIdx < slotOrder.length) {
      insertResponseMessage(slotPrompts[slotOrder[currentSlotIdx]]);
    } else {
      callChatbotApi();
    }
  }

  function fetchHistory(userID) {
    fetch('https://n4fzv7s4ua.execute-api.us-east-1.amazonaws.com/dev/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: true, userID: userID })
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.history && data.history.length > 0) {
        let msg = "Your saved datasets:<br>";
        data.history.forEach(item => {
          if (item.datasets) {
            item.datasets.forEach(ds => {
              msg += `<a href="${ds.url}" target="_blank">${ds.name}</a><br>`;
            });
          }
        });
        insertResponseMessage(msg);
      } else {
        insertResponseMessage("No saved datasets found for your ID.");
      }
      insertResponseMessage("Thank you for using the Chatbot Concierge! If you want another dataset, just ask.");
      resetSlots();
      slotFillingMode = false;
      phase = "greeting";
      window.alreadySuggestedHelp = false;
    })
    .catch((error) => {
      insertResponseMessage("Error fetching your history. Please try again later.");
      resetSlots();
      slotFillingMode = false;
      phase = "greeting";
      window.alreadySuggestedHelp = false;
    });
  }

  function callChatbotApi() {
    var payload = {
      sessionId: "web-chat-session-" + Date.now(),
      sessionState: {
        intent: {
          name: "DatasetRequestIntent",
          slots: {
            userID: { value: { interpretedValue: slotValues.userID } },
            topic: { value: { interpretedValue: slotValues.topic } },
            source: { value: { interpretedValue: slotValues.source || 'Kaggle' } },
            format: { value: { interpretedValue: slotValues.format } },
            date: { value: { interpretedValue: slotValues.date } },
            name: { value: { interpretedValue: slotValues.name } },
            email: { value: { interpretedValue: slotValues.email } }
          },
          state: "InProgress"
        }
      }
    };

    fetch('https://n4fzv7s4ua.execute-api.us-east-1.amazonaws.com/dev/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.datasets) {
        let msg = "Here are your datasets:<br>";
        data.datasets.forEach(ds => {
          msg += `<a href="${ds.url}" target="_blank">${ds.name}</a><br>`;
        });
        insertResponseMessage(msg);
      } else if (data && data.messages && data.messages.length > 0) {
        if (
          /couldn\'?t find any datasets/i.test(data.messages[0].content) ||
          /not found|no data/i.test(data.messages[0].content)
        ) {
          let msg = "No datasets found for your request.<br>";
          if (slotValues.topic && slotValues.format && slotValues.date) {
            msg += `• The topic <b>${slotValues.topic}</b> may not exist, or <b>${slotValues.format}</b> format for that topic might be unavailable, or there may be no data for <b>${slotValues.date}</b>.<br>`;
          } else if (slotValues.topic && slotValues.format) {
            msg += `• The topic <b>${slotValues.topic}</b> may not have data in <b>${slotValues.format}</b> format. Try changing your format or topic.<br>`;
          } else if (slotValues.topic) {
            msg += `• The topic <b>${slotValues.topic}</b> may not be available. Try other relevant topics or rephrase.<br>`;
          } else if (slotValues.format) {
            msg += `• No datasets found in <b>${slotValues.format}</b> format for your search.<br>`;
          } else {
            msg += "• This may be due to an unfamiliar topic, unavailable data format, or rare data request. Try altering your topic or format.<br>";
          }
          msg += "If you need help, type <b>help</b> to see command options!";
          insertResponseMessage(msg);
        } else {
          insertResponseMessage(data.messages[0].content);
        }
      } else if (data && data.response) {
        insertResponseMessage(data.response);
      } else {
        insertResponseMessage('Oops, something went wrong. Please try again.');
      }
      insertResponseMessage("Thank you for using the Chatbot Concierge! If you want another dataset, just ask.");
      resetSlots();
      slotFillingMode = false;
      phase = "greeting";
      window.alreadySuggestedHelp = false;
      onboardingSuggested = false;
    })
    .catch((error) => {
      insertResponseMessage('Oops, something went wrong. Please try again.');
      insertResponseMessage("Thank you for using the Chatbot Concierge! If you want another dataset, just ask.");
      resetSlots();
      slotFillingMode = false;
      phase = "greeting";
      window.alreadySuggestedHelp = false;
      onboardingSuggested = false;
    });
  }

  function resetSlots() {
    for (var slot in slotValues) slotValues[slot] = null;
    slotValues.prevOrNew = null;
    currentSlotIdx = 0;
  }

  function showHelp() {
    insertResponseMessage(
      "Here’s what I can help with:<br>" +
      "<ul>" +
      "<li><b>search for a dataset</b>: Find new datasets (just say: <b>search for a dataset</b>)</li>" +
      "<li><b>show my saved links</b>: View your previous saved dataset links (just say: <b>show my saved links</b>)</li>" +
      "<li><b>about</b>: See what I can do for you</li>" +
      "<li><b>restart</b>: Start the conversation over</li>" +
      "<li><b>help</b> or <b>commands</b>: See this help guide again</li>" +
      "<li><b>Edit answers anytime</b>: Type <b>change [slot]</b> or <b>return/back/go back to [slot]</b> (example: <b>change format</b> or <b>return to topic</b>)</li>" +
      "</ul>"
    );
  }

  // ---- CUSTOM ABOUT COMMAND ----
  function showAbout() {
    insertResponseMessage(
      "This chatbot helps you search, save, and manage links to datasets from HuggingFace and Kaggle. " +
      "You can find new datasets, save your search results, and retrieve previous links using your UserID. " +
      "Commands include: search for a dataset, show my saved links, help, restart, and editing slot answers. " +
      "For more, type <b>help</b>."
    );
  }

  function insertMessage() {
    var msg = $('.message-input').val();
    if ($.trim(msg) == '') return false;
    $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    $('.message-input').val(null);
    updateScrollbar();

    // Restart command handler
    if (/^restart$/i.test(msg.trim())) {
      resetSlots();
      slotValues.userID = null;
      slotValues.userType = null;
      insertResponseMessage("Conversation restarted. Hello, I am your personal Concierge bot.");
      phase = "greeting";
      window.alreadySuggestedHelp = false;
      onboardingSuggested = false;
      slotFillingMode = false;
      return;
    }

    // Show help/commands
    if (/^(help|commands|what can you do|options)$/i.test(msg.trim())) {
      showHelp();
      window.alreadySuggestedHelp = true;
      return;
    }

    // ---- About command ----
    if (/^about$/i.test(msg.trim())) {
      showAbout();
      return;
    }

    // --- SHOW MY SAVED LINKS HANDLING ---
    if (/^(show my saved links)$/i.test(msg.trim())) {
      if (slotValues.userID) {
        fetchHistory(slotValues.userID);
        phase = "greeting";
        slotFillingMode = false;
        return;
      } else {
        insertResponseMessage(slotPrompts.userID);
        phase = "getUserIDForHistory";
        return;
      }
    }
    if (phase === "getUserIDForHistory") {
      slotValues.userID = msg.trim();
      fetchHistory(slotValues.userID);
      phase = "greeting";
      slotFillingMode = false;
      return;
    }

    if (phase === "greeting" || phase === "help") {
      if (/^(hello|hi|hey|good morning|good afternoon|good evening)$/i.test(msg.trim())) {
        insertResponseMessage("Hello! How are you today?");
        return;
      }
      if (/(how are you|how do you do|what's up|sup|hows it going)/i.test(msg.trim())) {
        insertResponseMessage("I'm great, thank you! How can I help you today? If you need any help please enter \"help\" in the chat.");
        phase = "help";
        return;
      }
      if (/^i(\'?m| am) (good|fine|okay|well|great|awesome|fantastic|not bad).*$/i.test(msg.trim())) {
        insertResponseMessage("Glad to hear! How can I help you today?");
        phase = "help";
        return;
      }
      if (/^another dataset$|^search (for )?a dataset$|^i want (a |some )?dataset$|^dataset$|new dataset/i.test(msg.trim())) {
        if (slotValues.userID && slotValues.userType) {
          startSlotFilling();
          return;
        }
        phase = "userType";
        insertResponseMessage("Are you a new user or existing user? (Reply 'new' or 'existing')");
        return;
      }
      insertResponseMessage("For a guide, type: <b>help</b>. Or try 'search for a dataset'.");
      return;
    }

    if (phase === "userType") {
      msg = msg.trim().toLowerCase();
      if (msg === "new" || msg === "existing") {
        slotValues.userType = msg;
        insertResponseMessage(slotPrompts.userID);
        phase = "getUserID";
        return;
      } else {
        insertResponseMessage("Please reply 'new' if you're a new user or 'existing' if you're a returning user.");
        return;
      }
    }

    if (phase === "getUserID") {
      slotValues.userID = msg.trim();
      if (slotValues.userType === "new") {
        fetch('https://n4fzv7s4ua.execute-api.us-east-1.amazonaws.com/dev/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkUser: true, userID: slotValues.userID })
        })
        .then(response => response.json())
        .then(data => {
          if (data.exists) {
            insertResponseMessage("We identify you as an existing user. Please select 'existing' if you want to access your saved data or history.");
            slotValues.userType = "existing";
            insertResponseMessage(`Welcome back, ${slotValues.userID}!`);
            insertResponseMessage(slotPrompts.prevOrNew);
            phase = "prevOrNew";
          } else {
            startSlotFilling();
          }
        })
        .catch(() => {
          insertResponseMessage("Error checking user. Please try again.");
        });
        return;
      }
      if (slotValues.userType === "existing") {
        insertResponseMessage(`Welcome back, ${slotValues.userID}!`);
        insertResponseMessage(slotPrompts.prevOrNew);
        phase = "prevOrNew";
      }
      return;
    }

    if (phase === "prevOrNew") {
      msg = msg.trim().toLowerCase();
      if (msg === "previous") {
        slotValues.prevOrNew = "previous";
        fetchHistory(slotValues.userID);
        return;
      } else if (msg === "new") {
        slotValues.prevOrNew = "new";
        startSlotFilling();
        return;
      } else {
        insertResponseMessage("Please type 'previous' to see your datasets or 'new' to search new ones.");
        return;
      }
    }

    if (slotFillingMode) {
      var slotName = slotOrder[currentSlotIdx];
      if (slotName === "date") {
        slotValues[slotName] = parseFlexibleDate(msg);
      } else {
        slotValues[slotName] = msg;
      }
      currentSlotIdx++;
      nextSlotPrompt();
      return;
    }

    if (!window.alreadySuggestedHelp) {
      insertResponseMessage("Not sure what to do? Type <b>help</b> for commands, or say 'search for a dataset' or 'show my saved links'.");
      window.alreadySuggestedHelp = true;
    } else {
      insertResponseMessage("Try 'search for a dataset', 'show my saved links', 'help', or type 'about'.");
    }
    return;
  }

  $('.message-submit').click(function() { insertMessage(); });
  $(window).on('keydown', function(e) {
    if (e.which == 13) { insertMessage(); return false; }
  });

  function insertResponseMessage(content) {
    $('<div class="message loading new"><figure class="avatar"><img src="https://media.tenor.com/images/4c347ea7198af12fd0a66790515f958f/tenor.gif" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();
    setTimeout(function() {
      $('.message.loading').remove();
      $('<div class="message new"><figure class="avatar"><img src="https://media.tenor.com/images/4c347ea7198af12fd0a66790515f958f/tenor.gif" /></figure>' + content + '</div>').appendTo($('.mCSB_container')).addClass('new');
      setDate();
      updateScrollbar();
      i++;
    }, 500);
  }
});
