# Sustentar Diagnostic

Web application for evaluating municipal sustainable mobility using real-time spatial data and a structured diagnostic flow.

---

## Overview

Sustentar Diagnostic enables users to assess urban mobility conditions through an interactive interface. It combines user inputs with external spatial data to generate standardized indicators for transport infrastructure.

---

## Problem

Urban mobility data is fragmented and difficult to interpret without technical expertise, limiting its practical use in decision-making.

---

## Solution

The application provides a guided diagnostic flow and integrates external data sources to produce accessible mobility metrics for cities.

---

## Tech Stack

- Frontend: React (Vite)  
- Backend: FastAPI (Python)  
- Database: Supabase  
- APIs: Geoapify  

---

## Features

- Interactive diagnostic (multi-step flow)  
- Real-time spatial data integration  
- Backend caching  
- Feedback collection  

---

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend
```
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
### API
- GET /api/health
- GET /api/spatial/{city_name}
- POST /api/feedback

