# WhatsApp Demo Chatbot

A demonstration chatbot showcasing the capabilities of
the [@green-api/whatsapp-chatbot-js-v2](https://github.com/green-api/whatsapp-chatbot-js-v2) library, using the API
service for WhatsApp [green-api.com](https://green-api.com/en/). This chatbot
demonstrates various GREEN-API features including message sending, file handling, polls, contacts, and group
management using a state-based architecture.

## Support Links

[![Support](https://img.shields.io/badge/support@green--api.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:support@green-api.com)
[![Support](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/greenapi_support_eng_bot)
[![Support](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/77273122366)

## Environment Setup

1. **Node.js Installation**
    - Download and install the latest version of Node.js from the [official website](https://nodejs.org/)
    - Verify installation by running:
      ```bash
      node -v
      ```

2. **Project Setup**
   ```bash
   # Clone the repository
   git clone https://github.com/green-api/whatsapp-demo-chatbot-js-v2

   # Install dependencies
   cd whatsapp-demo-chatbot-js-v2
   npm install
   ```

## Configuration

1. **GREEN-API Account Setup**
    - Register at [GREEN-API](https://green-api.com/)
    - Create your first instance and copy its `idInstance` and `apiTokenInstance`

2. **Environment Configuration**
   Create a `.env` file in the project root:
   ```env
   INSTANCE_ID=your_instance_id
   INSTANCE_TOKEN=your_api_token
   ```

## Project Structure

### Core Files

- `bot.ts` - Main bot implementation
- `strings.yml` - Multi-language message strings
- `.env` - Environment configuration

### State Organization

The chatbot uses a state-based architecture with three main states:

1. **Start State** (`startState`)
    - Entry point for all conversations
    - Handles language selection
    - Available languages: EN, KZ, RU, ES, HE, AR
    - Transitions to Main state upon language selection

2. **Main State** (`mainState`)
    - Central hub for all functionality
    - Handles 13 different demo commands
    - Processes poll updates
    - Manages transitions to Create Group state

3. **Create Group State** (`createGroupState`)
    - Handles group creation flow
    - Manages bot contact addition
    - Sets group avatar and initial message

### Global Handlers

- Stop commands (`stop`, `0`) - Return to language selection
- Menu commands (`menu`, `меню`) - Return to main menu
- Fallback handler for unrecognized messages

## Running the Bot

1. **Launch**
   ```bash
   npm run start 
   ```
   Or to see additional debug information:
   ```bash
   npm run start:debug
   ```

2. **Initialization Process**
    - Clears webhook queue
    - Begins message processing

3. **Instance Settings**
   The bot automatically configures these settings:
   ```json
   {
       "webhookUrl": "",
       "webhookUrlToken": "",
       "outgoingWebhook": "no",
       "stateWebhook": "no",
       "incomingWebhook": "yes",
       "outgoingAPIMessageWebhook": "no",
       "outgoingMessageWebhook": "no",
       "pollMessageWebhook": "yes",
       "markIncomingMessagesReaded": "yes"
   }
   ```

## Features and Usage

### 1. Language Selection

Users first select their preferred language:

```
1 - English
2 - Kazakh
3 - Russian
4 - Spanish
5 - Hebrew
```

### 2. Main Menu Options

After language selection, users can test various WhatsApp API features:

1. **Text Messages** (📩)
    - Demonstrates basic text sending
    - Shows message formatting options

2. **File Sharing** (📋)
    - PDF document sharing
    - Shows file upload capabilities

3. **Image Sharing** (🖼)
    - Image sending with captions
    - Demonstrates media handling

4. **Audio Messages** (🎵)
    - Audio file sharing
    - Supports multiple formats

5. **Video Messages** (📽)
    - Video file sharing
    - Demonstrates large media handling

6. **Contact Sharing** (👤)
    - Contact card creation
    - vCard format handling

7. **Location Sharing** (📍)
    - Static location sending
    - Includes address and coordinates

8. **Polls** (📊)
    - Poll creation
    - Vote handling
    - Multiple choice support

9. **Avatar Handling** (🖼)
    - Profile picture retrieval
    - Avatar URL handling

10. **Link Preview** (🔗)
    - URL preview toggling
    - Link formatting options

11. **Group Creation** (👥)
    - Contact addition flow
    - Group picture setting
    - Invite link generation

12. **Message Quoting** (💬)
    - Reply to specific messages

13. **About Section** (ℹ️)
    - Library information
    - Documentation links
    - Support resources

### Navigation Commands

- `stop` or `0` - Return to language selection
- `menu` or `меню` - Show available options

## Code Examples

### State Definition

```typescript
const startState: State<CustomSessionData> = {
	name: "start",
	async onEnter(message) {
		await bot.sendText(message.chatId, strings.select_language);
	},
	async onMessage(message, data) {
		// Handler implementation
	}
};
```

### File Sending

```typescript
await bot.sendFileByUrl(message.chatId, {
	url: "https://example.com/file.pdf",
	fileName: "document.pdf",
	caption: "File caption"
});
```

### Group Creation

```typescript
const group = await bot.api.group.createGroup(
	groupName,
	[message.chatId]
);

if (group.created) {
	await bot.api.group.setGroupPicture(
		group.chatId,
		"assets/group_avatar.jpg"
	);
}
```

## License

Licensed
under [Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)](https://creativecommons.org/licenses/by-nd/4.0/).

[LICENSE](./LICENSE)

## Related Resources

- [GREEN-API Documentation](https://green-api.com/docs/)
- [@green-api/whatsapp-chatbot-js-v2](https://github.com/green-api/whatsapp-chatbot-js-v2)
