const https = require('https');
https.get('https://v2.coders.codes/', (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    const classes = body.match(/class="([^"]+)"/g) || [];
    const hex = body.match(/#[a-fA-F0-9]{3,6}/gi) || [];
    console.log("Classes snapshot:\n", classes.slice(0, 30).join(' | '));
    console.log("\nColors snapshot:\n", [...new Set(hex)].join(', '));
  });
});
