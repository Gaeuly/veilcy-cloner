# veilcy-cloner

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.javascript.com/)
[![License: Unlicensed](https://img.shields.io/badge/license-Unlicensed-red)](https://unlicense.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)

📝 veilcy-cloner is a selfbot designed to clone Discord servers. It allows users to create a complete replica of a Discord server, including channels, roles, categories, permissions, and settings, onto a new or existing Discord server. This tool is intended for users who want to quickly and efficiently migrate a server structure or create backup copies for security or testing purposes.

This selfbot leverages the Discord API through the discord.js library to interact with the Discord platform.  It automates the tedious process of manually recreating a server's infrastructure. It efficiently handles large servers with complex permission structures. The cloner is designed to be customizable, allowing users to tailor the cloning process to their specific needs and preferences. This project is best suited for experienced Discord users and developers who understand the implications of using selfbots and are aware of Discord's Terms of Service regarding automation.

The primary goal of veilcy-cloner is to provide a streamlined and reliable solution for server duplication. It simplifies the server management process by offering a one-click cloning option, saving significant time and effort. Keep in mind that using selfbots can violate Discord's Terms of Service, so use this tool at your own risk and discretion. The developers are not responsible for any consequences arising from the use of this selfbot.

✨ Key Features

*   **Full Server Cloning:** Clones all channels (text, voice, category), roles, permissions, emoji and server settings from the source server to the target server. This includes channel topics, role names, and server descriptions.
*   **Role Recreation:** Accurately recreates all roles from the original server, including their permissions, color, and name. This ensures the cloned server retains the same role hierarchy as the original.
*   **Channel and Category Recreation:** Replicates the entire channel structure, including categories and all channels within them. This preserves the organizational layout of the original server.
*   **Permission Synchronization:** Copies all channel and role permissions, ensuring that users have the same access levels in the cloned server as they did in the original server. This ensures that the new server functions identically to the original regarding user access.
*   **Customizable Options:** Allows users to configure the cloning process through environment variables, allowing for tailored cloning based on user preferences and specific requirements.
*   **Message Handling:** Implements intelligent message handling to avoid rate limits and ensure smooth cloning operation.
*   **Detailed Logging:** Provides comprehensive logging information throughout the cloning process, allowing users to track progress, identify errors, and troubleshoot issues effectively.

🛠️ Tech Stack & Tools

| Category    | Technology/Tool           | Description                                                                                                |
|-------------|---------------------------|------------------------------------------------------------------------------------------------------------|
| Language    | JavaScript                | Primary programming language for the selfbot.                                                              |
| Library     | discord.js/selfbot                | Node.js module for interacting with the Discord API.                                                      |
| Environment | Node.js                   | JavaScript runtime environment.                                                                              |
| Package Manager| npm                       | Used for managing project dependencies.                                                                   |
| Utilities   | .env (dotenv)             | Used for managing environment variables and sensitive data.                                                  |
| Other       | Git                       | Version control system.                                                                                     |

🚀 Installation & Running Locally

1.  **Prerequisites:**
    *   Node.js (version 16 or higher) and npm (Node Package Manager) must be installed on your system. You can download them from [https://nodejs.org/](https://nodejs.org/).

2.  **Clone the repository:**

    ```bash
    git clone https://github.com/Gaeuly/veilcy-cloner.git
    ```

3.  **Navigate to the project directory:**

    ```bash
    cd veilcy-cloner
    ```

4.  **Install dependencies:**

    ```bash
    npm install
    ```

5.  **Configure environment variables:**

    *   Create a `.env` file in the project root directory based on the `example.env` file.
    *   Populate the `.env` file with your Discord bot token.

    ```bash
    cp example.env .env
    ```

    Edit `.env` and add the following (replace with your actual token):

    ```
    TOKEN=YOUR_DISCORD_BOT_TOKEN
    ALLOWED_USER_IDS=YOUR ID
    ```

    **Important:** Never commit your token to a public repository.

6.  **Run the bot:**

    ```bash
    node index.js
    ```

7.  **Usage**:

    Follow the prompts in the console to use the cloner. You will need to provide the ID of the source server you want to clone and the ID of the target server where you want to clone it.

🤝 How to Contribute

We welcome contributions to veilcy-cloner! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and ensure they are well-documented.
4.  Submit a pull request with a clear description of your changes.

Please ensure your code follows the project's coding standards and includes relevant tests.
