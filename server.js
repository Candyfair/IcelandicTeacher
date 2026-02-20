import app from './app.js';
import { HOST, PORT } from './src/config/config.js';

app.listen(PORT, HOST, () => {
  console.log(`Icelandic Teacher API running at http://${HOST}:${PORT}`);
});
