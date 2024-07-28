import os
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import openai
import pdfplumber
import chardet

# Set your OpenAI API key
openai.api_key = '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'  

def read_text_file(file_path):
    with open(file_path, 'rb') as file:
        raw_data = file.read()
        result = chardet.detect(raw_data)
        encoding = result['encoding']
        print(f"Detected encoding: {encoding}")
        
    if encoding is None:
        encoding = 'utf-8'  # Fallback to 'utf-8' if encoding detection fails
        
    with open(file_path, 'r', encoding=encoding, errors='replace') as file:
        content = file.read()
    return content

def read_pdf_file(file_path):
    with pdfplumber.open(file_path) as pdf:
        pages = pdf.pages
        text = ''.join(page.extract_text() for page in pages)
    return text

def get_analysis(prompt):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Specify the GPT-4 model
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=2000  # Adjust as necessary
        )
        return response.choices[0].message['content'].strip()
    except Exception as e:
        print(f"Error calling OpenAI API: {e}")
        return None

@csrf_exempt
def analyze_interview(request):
    if request.method == 'POST':
        transcript_file = request.FILES.get('transcript')
        resume_file = request.FILES.get('resume')
        
        if not transcript_file or not resume_file:
            return JsonResponse({'error': 'Both transcript and resume files are required'}, status=400)
        
        # Save the files to the server
        transcript_path = os.path.join(settings.MEDIA_ROOT, transcript_file.name)
        resume_path = os.path.join(settings.MEDIA_ROOT, resume_file.name)
        
        with open(transcript_path, 'wb') as f:
            for chunk in transcript_file.chunks():
                f.write(chunk)
        
        with open(resume_path, 'wb') as f:
            for chunk in resume_file.chunks():
                f.write(chunk)
        
        transcript = read_text_file(transcript_path)
        resume = read_pdf_file(resume_path)

        print("Transcript Content:", transcript)
        print("Resume Content:", resume)

        prompt = f"""
        Only answer the questions asked. Also address the prompt as if you are talking to the interviewee.
        Given the following resume and interview transcript, provide the following details in JSON format:
        1. Overall interviewee score out of 100.
        2. Confidence score out of 100.
        3. Strengths of the interviewee. Give top 3 in points; no need to give all 3 if not needed (answer only from the interview asked).
        4. Weaknesses of the interviewee. Give top 3; no need to give all 3 if not needed (answer only from the interview asked).
        5. Question by question analysis:
        - The question that was asked
        - What the interviewee said (literally what they said from the interview transcript)
        - What would be an ideal or better answer if any according to the job description and resume.
        
       Provide the output strictly as a JSON object with keys: overall_score, confidence_score, positives, weaknesses, questions(question,answer,ideal_answer).
        Resume:
        {resume}
        
        Transcript:
        {transcript}
        """

        analysis = get_analysis(prompt)

        if analysis:
            try:
                analysis_data = json.loads(analysis)
                return JsonResponse(analysis_data)
            except json.JSONDecodeError as e:
                return JsonResponse({'error': f'Error decoding JSON: {e}', 'response': analysis}, status=500)
        else:
            return JsonResponse({'error': 'No analysis returned from OpenAI API'}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)
