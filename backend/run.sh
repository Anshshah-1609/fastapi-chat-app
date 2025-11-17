#!/bin/bash
# Script to run the FastAPI server with uvicorn

poetry run uvicorn main:app --reload --host 0.0.0.0 --port 8000

