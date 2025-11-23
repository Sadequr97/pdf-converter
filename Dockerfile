# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies required for OpenCV and other libraries
# pdf2docx uses opencv-python-headless, so we don't need X11 libs
# RUN apt-get update && apt-get install -y ...

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . .

# Create the uploads directory
RUN mkdir -p uploads

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV PORT=8000

# Run main.py when the container launches
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
