const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({ dest: 'uploads/' });

const templatePath = path.join(__dirname, '../templates/app-template.html');

app.post('/generate-preview', upload.single('logo'), (req, res) => {
  const { businessName = 'My Shop', products = '[]' } = req.body;

  let html;
  try {
    html = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    return res.status(500).send('Template missing');
  }

  html = html.replace(/{BUSINESS_NAME}/g, businessName);

  let logoUrl = '';
  if (req.file) {
    logoUrl = `http://localhost:3001/uploads/${req.file.filename}`;
  }
  html = html.replace('{LOGO_URL}', logoUrl);

  let prices = {};
  try {
    const parsed = JSON.parse(products);
    parsed.forEach(item => {
      const name = (item.name || '').trim();
      const price = Number(item.price);
      if (name && !isNaN(price)) {
        prices[name] = price;
      }
    });
  } catch (e) {
    console.error('Parse error:', e.message);
  }

  html = html.replace('{PRODUCTS}', JSON.stringify(prices));

  res.send(html);
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});






