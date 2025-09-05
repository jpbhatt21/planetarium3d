import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

// pass the link directly

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests

app.use('/files', createProxyMiddleware({
    target: 'https://cdn.bhatt.jp',
    changeOrigin: true,
    pathRewrite: {'/files':"/" },
  
   
    
  }));
// app.use('/api', createProxyMiddleware({
//   target: 'https://back.jpbhatt.tech',
//   changeOrigin: true,
//   pathRewrite: { '': '/api' },
 
  
// }));

// Serve the index.html for all other routes (for SPA)
app.get('*', (req, res) => {

  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT);
