<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=180&section=header&text=AutoSense&fontSize=42&fontAlignY=35&animation=fadeIn"/>

# AutoSense

AutoSense is an AI-powered predictive maintenance and intelligent vehicle analytics platform designed for Electric Vehicles (EVs), Internal Combustion Engine (ICE) vehicles, and heavy-duty trucks.

The platform combines advanced machine learning models, real-time analytics, cloud-ready backend architecture, and intelligent monitoring systems to predict vehicle risks, estimate maintenance requirements, and improve operational reliability.

AutoSense integrates a modern React-based frontend dashboard with a FastAPI-powered backend API, secure authentication system, AI assistant support, and machine learning inference pipelines capable of handling both classical ML and deep learning workloads.

The project demonstrates the integration of intelligent transportation systems, predictive maintenance, cloud-native architecture, and AI-driven analytics into a scalable real-world platform.

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Problem Statement

Modern transportation systems generate massive amounts of telemetry, operational, and maintenance data. However, many organizations still rely on reactive maintenance approaches, resulting in:

- Unexpected vehicle breakdowns
- Increased operational costs
- Downtime and fleet inefficiencies
- Difficulty predicting component failures
- Poor visibility into vehicle health
- Lack of centralized analytics
- Limited AI-driven operational insights

Fleet operators, logistics companies, and intelligent transportation systems require scalable solutions capable of:

- Predicting maintenance risks
- Estimating component degradation
- Monitoring vehicle health continuously
- Analyzing fleet performance
- Providing intelligent decision support
- Supporting real-time analytics workflows

AutoSense addresses these challenges using machine learning, AI-powered analytics, deep learning inference systems, and cloud-native backend architecture.

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Project Objectives

The primary objectives of AutoSense are:

- To build an intelligent predictive maintenance platform
- To analyze vehicle telemetry and operational data
- To predict vehicle health risks
- To estimate Remaining Useful Life (RUL)
- To provide fleet analytics and monitoring
- To support EV, ICE vehicles, and heavy trucks
- To integrate AI-powered assistance systems
- To develop scalable cloud-ready backend services
- To provide secure authentication and user management

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Core Features

## Predictive Maintenance System

AutoSense predicts:

- Vehicle health conditions
- Maintenance requirements
- Operational degradation patterns
- Risk scores
- Remaining Useful Life (RUL)

The system uses machine learning models trained on telemetry and operational datasets.

## EV and ICE Vehicle Prediction

The platform provides intelligent predictive analytics for:

- Electric Vehicles (EVs)
- Internal Combustion Engine (ICE) vehicles

Prediction APIs generate:

- Risk probabilities
- Confidence scores
- Operational insights

## Heavy Truck Risk Prediction

The project includes a dedicated truck prediction pipeline using PyTorch temporal models capable of analyzing heavy vehicle operational behavior.

## AI Assistant Integration

AutoSense includes an intelligent AI assistant named:

```bash
AutoPilot
```

The assistant helps users with:

- Platform guidance
- Navigation support
- Workflow assistance
- Product-related help

## Analytics Dashboard

The dashboard provides:

- Prediction history
- Vehicle analytics
- Risk monitoring
- Operational insights
- User activity tracking

## Secure Authentication System

The platform implements secure authentication using:

- JWT authentication
- Protected routes
- Password hashing
- User authorization

## Model Warmup and Health Monitoring

The backend automatically loads and warms machine learning models during startup to ensure low-latency prediction performance.

Health monitoring APIs track:

- Model availability
- Backend readiness
- System status

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# System Architecture

AutoSense follows a full-stack cloud-ready architecture.

## Frontend

Built using:

- React 18
- Vite
- Tailwind CSS
- React Router
- Zustand
- Framer Motion
- Recharts

The frontend provides:

- Interactive dashboards
- Protected pages
- Prediction interfaces
- Analytics visualizations
- Responsive UI experience

## Backend

Built using:

- FastAPI
- Uvicorn
- MongoDB
- Beanie ODM
- Motor
- PyMongo

The backend handles:

- Authentication
- Prediction APIs
- Database communication
- AI assistant services
- Model inference pipelines

## Machine Learning Layer

The ML system integrates:

- Scikit-learn
- XGBoost
- LightGBM
- CatBoost
- PyTorch

The platform supports both:

- Classical ML pipelines
- Deep learning temporal models

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# API Endpoints

## Authentication APIs

```bash
POST /auth/signup
POST /auth/login
GET  /auth/me
```

## Prediction APIs

```bash
POST /predict/ev
GET  /predict/ev/status
POST /predict/truck
GET  /predict/truck/status
```

## AI Assistant API

```bash
POST /ai/chat
```

## Health APIs

```bash
GET /
GET /health/models
```

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Machine Learning and Inference

The platform combines multiple AI techniques including:

- Regression analysis
- Classification algorithms
- Ensemble learning
- Gradient boosting
- Temporal deep learning models
- Feature engineering
- Predictive analytics

Truck prediction systems use PyTorch temporal model weights for advanced inference workflows.

The backend performs model warmup during startup to optimize inference speed and reduce prediction latency.

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Security and Authentication

AutoSense implements:

- JWT bearer authentication
- Password hashing using bcrypt
- Protected API routes
- Secure session handling
- CORS configuration
- Environment-based configuration management

This improves platform security and user protection.

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Advantages of AutoSense

- Intelligent predictive maintenance
- Real-time analytics and monitoring
- Support for multiple vehicle categories
- AI-powered assistant integration
- Scalable full-stack architecture
- Cloud-ready deployment capability
- Secure authentication system
- Explainable operational insights
- Fleet management support
- Advanced ML and deep learning integration

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Technologies Used

## Frontend Technologies

- React 18
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Zustand
- Recharts
- Axios

## Backend Technologies

- FastAPI
- Uvicorn
- MongoDB
- Motor
- Beanie ODM
- PyMongo

## Machine Learning and AI

- Scikit-learn
- XGBoost
- LightGBM
- CatBoost
- PyTorch
- NumPy
- Pandas
- SciPy

## Authentication and Security

- JWT
- bcrypt
- python-jose

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Installation and Setup

## Install Frontend Dependencies

```bash
npm install
```

## Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Start Backend Server

```bash
uvicorn backend.main:app --reload
```

## Start Frontend Application

```bash
npm run dev
```

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Applications

AutoSense can be applied in:

- Predictive maintenance systems
- Fleet management platforms
- EV monitoring systems
- Logistics and transportation analytics
- Intelligent transportation systems
- Automotive AI research
- Vehicle health monitoring
- Smart mobility solutions

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Future Enhancements

Future improvements planned for AutoSense include:

- Real-time IoT telemetry streaming
- Edge AI deployment
- Cloud-native microservices architecture
- Digital twin integration
- Advanced anomaly detection
- Mobile application support
- Real-time fleet tracking
- Explainable AI dashboards
- Battery degradation forecasting

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Educational Value

This project demonstrates practical implementation of:

- Full-stack application development
- Cloud-ready backend architecture
- FastAPI REST API development
- MongoDB integration
- Predictive maintenance systems
- Machine learning deployment
- Deep learning inference systems
- Secure authentication workflows
- AI-powered analytics platforms

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Conclusion

AutoSense is a scalable AI-powered predictive maintenance and intelligent transportation platform developed to improve vehicle reliability, operational efficiency, and maintenance forecasting.

By integrating modern frontend technologies, cloud-ready backend systems, machine learning pipelines, deep learning models, and intelligent analytics, AutoSense demonstrates the future potential of AI-driven transportation and fleet intelligence systems.

The platform highlights the role of predictive analytics and intelligent monitoring in the evolution of smart mobility ecosystems.

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2.5"/>

# Developer

Gitansh Pise

GitHub:
https://github.com/Gitansh16

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=120&section=footer"/>
