// Demonstrates calling a function outside of WCS, how to integrate to 3rd party systems
// and how to set context.
// Anthony

var prompt = require('prompt-sync')();
var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var sleep = require('sleep');
// Set up Conversation service wrapper.
var conversation = new ConversationV1({
  username: 'c70b7018-87cb-46ee-aed8-c8b7ed22721f', // replace with service username
  password: 'Htu10kvT6OS8', // replace with service password
  version_date: '2017-05-26'
});

var workspace_id = '21f04533-b5d2-45a0-ab55-e073a16978d4'; // replace with workspace ID
// Start conversation with empty message.
conversation.message({
  workspace_id: workspace_id
}, processResponse);

// Process the conversation response.

function checkAuthorization(username, password, role) {
  // call your authorization service here
  console.log('Checking ... ');
  sleep.sleep(3);
  if (role === 'admin') {
    return 'true';
  } else {
    return 'false';
  }
}

function processResponse(err, response) {
  if (err) {
    console.error(err); // something went wrong
    return;
  }
  var endConversation = false;

  // Get the user context from the chat application and set authorization
  response.context.username = 'anthony';
  response.context.password = 'MyPassword123';
  response.context.role = 'user';

  // prompt is blocking so response isn't received until it exits.
  var dontPrompt = false;
  if (response.output.text.length != 0) {
    console.log(response.output.text[0]);
  }
  // Contexts can be set in WCS dialog, then take action on it here.
  if (response.context.action === 'check_authorization') {

    // The bot needs authorization to proceed with the action.
    //response.context.action = '';
    response.context.authorized = checkAuthorization(response.context.username, response.context.password, response.context.role);
    dontPrompt = true;
    response.context.action = '';
    conversation.message({
      workspace_id: workspace_id,
      // Send back the context to maintain state.
      context: response.context,
    }, processResponse)

  }


if (!endConversation && !dontPrompt) {
  var newMessageFromUser = prompt('>> ');
  conversation.message({
    workspace_id: workspace_id,
    input: {
      text: newMessageFromUser
    },
    // Send back the context to maintain state.
    context: response.context,
  }, processResponse)
}
};
