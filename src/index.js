require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/auth');
const diveRoutes = require('./routes/dives');
const siteRoutes = require('./routes/sites');

const app = express();

app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Divelog API',
      version: '1.0.0',
      description: 'REST API for logging scuba dives',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Divelog API is running' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/dives', diveRoutes);
app.use('/sites', siteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Divelog API running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/docs`);
});
