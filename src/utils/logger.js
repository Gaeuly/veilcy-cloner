const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

const log = {
    success: (msg) => console.log(`${colors.green}[+] ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}[-] ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}[!] ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.cyan}[i] ${msg}${colors.reset}`),
    header: (msg) => console.log(`${colors.magenta}${msg}${colors.reset}`)
};

module.exports = log;