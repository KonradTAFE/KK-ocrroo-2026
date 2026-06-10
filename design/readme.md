# Overview

Put your design documentation in this folder.
This should include rough notes from the familiarization phase.


## Persona

Write a brief persona of your user using design thinking. You can use the following template:

- **Name**: Jeff Jefferson
- **Age**: 30
- **Occupation**: Construction / welder
- **Location**: Perth, WA
- **Goals**: Moving into IT industry to stay closer to family on a daily basis
- **Frustrations**: Years of working as welder on construction site damaged his eyes
- **Motivations**: Drive to leave FIFO jobs and help pregnant wife around the house
- **Technology**: Good with hand tools and simply designed heavy-duty tools
- **Experience**: Took IT class in high school
- **Personality**: Impatient, perfectionist, high attention to detail
- **Interests**: Sports, nature, board games

Notice: This project focuses on assistive technology for people with disabilities. It is important to treat the topic with respect and sensitivity.

Consider:

- People are not defined by their disabilities.
- People with disabilities are not a homogeneous group.

Your persona should reflect the diversity of people with disabilities and their experiences.

## User Journey

What is the user journey? What are the steps the user takes to achieve their goals?

- **Step 1**: User gets the list of videos using /video
- **Step 2**: User picks a video and checks details using /video/{vid}
- **Step 3**: User extracts a frame at a specific time using /video/{vid}/frame/{t}
- **Step 4**: User runs OCR on the frame using /video/{vid}/frame/{t}/ocr to get text

## UI Interaction Patterns

What are the UI interaction patterns you will use in your project?
- Simple API design using clear URLs
- Users move step-by-step from video → frame → OCR
- Uses JSON for data and images for frames
- Each request is independent (no login or session needed)
- Links inside responses help users find the next step

## AI Prompts

Write down any AI prompts you came up with after your first session
- How to extract a video frame using OpenCV
- How to convert an image to text using Tesseract OCR
- How to build a simple FastAPI endpoint for video processing
- How to return JSON and images in the same API
- Why does FastAPI return an error when I return a dict with Response
- What are Interaction Patterns