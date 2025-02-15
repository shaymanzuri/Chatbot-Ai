from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
import csv
import requests
import time
import random
import json
import pandas as pd
import logging

##LLM modules import
import os
from PyPDF2 import PdfReader
import docx  #pip install python-docx
import openai
from dotenv import load_dotenv

from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.llms import OpenAI
from langchain.callbacks import get_openai_callback
import uuid
logging.basicConfig(level=logging.INFO)
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s [%(levelname)s] %(message)s',
                    handlers=[
                        logging.FileHandler("app.log"),
                        logging.StreamHandler()
                    ])

# import python modules
from constants import predefined_questions, database_name, database_collection,database_connection_url

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

## Set OpenAPI Key
if os.getenv('OPENAI_API_KEY')is None:
    raise ValueError("Did not find OPENAI_API_KEY in environment variables")
openai.api_key = os.getenv('OPENAI_API_KEY')
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

# MongoDB database setup
client = MongoClient(database_connection_url)
db = client[database_name]
collection = db[database_collection]
collection_user = db.users
collection_history = db.history

### OpenAI Model prompt:
promptttt ="""You are an AI assistant with a comprehensive database of electronics, including phones and laptops. Your primary function is to provide information from this database in response to user queries. Follow these guidelines:

1. Only answer questions related to the electronics in your database. Do not respond to unrelated queries or personal questions.

2. Provide concise but detailed answers, focusing on relevant specifications and features.

3. Avoid unnecessary commentary or filler phrases. Get straight to the point.

4. When listing multiple options dont forget to list the price of the article in NIS  like this "₪" for example: "₪1000", use an unordered list format with proper indentation and line breaks. For example:

  • Option 1: [Brief description] 

  • Option 2: [Brief description] 

  • Option 3: [Brief description] 
  
 dont forget to always start with Option then the number list option before the description of the article found in the database.
dont forget to always add the price a the end of the options please and at the beginning of every option set this "•" and For every price of an article you will be giving state it in the NIS Currency for example: "NIS 500". it is very import respect all these prescription .
5. If asked about preferences or recommendations, base your response on objective factors like specifications, features, and user requirements.

6. If a query is unclear or lacks specifics, ask for clarification to provide the most accurate information.

7. When comparing products, use a structured format to highlight key differences.

8. If you don't have information on a specific product, clearly state that it's not in your database.

9. For every price of an article you will be giving state it in the NIS Currency for example: "₪500"

10. When recommending me a model of a product do it like this <st> "Name of the model" <en>. for example  <st> Asus TUF Gaming F15 FX507ZC4-HN105 <en>. that is always at the "<st>" tag at the beginning and "<en>" tag at the end. Always respect this rule it is very important please.Never you return the model name without adding those tags.
11. Make sure to always complete your responses, never you return half response of an option or anything.
Remember, your purpose is to be a knowledgeable and efficient source of information about electronics in your database. Stick to this role at all times. 
base your self on the document uploaded and limit you self there.Please read thoroughly the document it will act as your database,also when giving the price dont forget to add ₪ at the beginning,and i want correct answers also dont mention any document when you reply to question replace it by our database.

If someone asks you a question about something in USD, always convert that to NIS first and then compare. For example if you say "give me 5 phones under 500$." Then always first convert 500 to NIS and then compare that NIS amount to the products in the database. Never ever show in ur output anything about USD or the symbol $. Only talk in NIS and shekel sign. Also make your answers concise. No fluff. 
"""



# end point to get all chat bot questions
@app.route("/chatbot-questions",methods=['GET'])
def getBotQuestions():
    return jsonify({"questions": predefined_questions})


#-------------------------------------------------------------------------------------------
## Reading product data from pdf file
#New--------------------------------------------------------------------------------------------

# ChatGPT API details
CHATGPT_API_URL = 'https://api.openai.com/v1/chat/completions'
MODEL = 'gpt-4'  # Use the latest GPT-4 model



def create_prompt(question, data,history):
    # Create a dynamic prompt based on the user question and relevant data
    prompt="Data:\n"+data.to_csv(index=False)
    prompt += f"\n Based on the following data and and This is the chat history (the previous response to the question the user ask you previously):=> {history}.Before answering to the new question check if the new question is related or not the previous answer you gave.If yes respond to it as a continuos chat if not respond to it as a new chat. answer the question: {question} "
    return prompt



def query_chatgpt(question, data, chat_history, max_retries=5, initial_wait=1):
    headers = {
        'Authorization': f"Bearer {os.getenv('OPENAI_API_KEY')}",
        'Content-Type': 'application/json'
    }
    prompt = create_prompt(question, data,chat_history)
    payload = {
        'model': MODEL,
        'messages': [
           {
    "role": "system",
    "content":f"You are an assistant that provides answers based on the given data. Follow these instructions carefully: {promptttt}. Adhere to them accordingly. When listing an article model from our database, always include the <st> and <en> tags. Read the new question attentively before answering to avoid giving incorrect responses. Remember to include the <st> and <en> tags when listing a product model.The new question is: {prompt}"
},

        ],
        'max_tokens': 1500,
        'temperature': 0.5
    }

    retries = 0
    wait_time = initial_wait
    while retries < max_retries:
        try:
            response = requests.post(CHATGPT_API_URL, headers=headers, json=payload)
            response.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)
            response_json = response.json()
            
            if 'choices' in response_json and len(response_json['choices']) > 0:
                answer = response_json['choices'][0]['message']['content'].strip()
            else:
                answer = "I'm sorry, but I couldn't generate a response based on the given data and question."
            return answer
        except requests.exceptions.HTTPError as e:
            if response.status_code == 429:
                # Handle rate limit exceeded error
                print(f"Rate limit exceeded. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
                retries += 1
                wait_time *= 2  # Exponential backoff
            else:
                print(f"HTTP error occurred: {e}")
                return "I'm sorry, but I encountered an HTTP error while processing your request."
        except requests.exceptions.RequestException as e:
            # Handle network or other requests-related errors
            print(f"Request error: {e}")
            return "I'm sorry, but I encountered a network error while processing your request."
        except Exception as e:
            # Handle unexpected errors
            print(f"Unexpected error: {e}")
            return "I'm sorry, but an unexpected error occurred while processing your request."

    return "I'm sorry, but I couldn't complete your request due to repeated rate limit issues."



 

@app.route('/chatbot', methods=['POST'])
def chatbot():
    # Load CSV data in chunks to handle large files
    csv_file_path = 'merged_store_db.csv'  # Path to your CSV file
    chunksize = 10000
    data_chunks = pd.read_csv(csv_file_path, chunksize=chunksize)
    data = pd.concat(data_chunks)
    user_query = request.json.get('query')
    username = request.json.get('username')
    session_id = request.json.get('session_id', str(uuid.uuid4())) 
    logging.info(f"username is {username}")
    # Retrieve chat history from session
    chat_history = request.json.get('chat_history', '')
    
    # Get response based on history and current query
    try:
        response = query_chatgpt(user_query, data,chat_history)
        # response = get_response(user_query, chat_history)
        # Store question and answer in MongoDB
        user_record = collection_history.find_one({"username": username, "session_id": session_id})
        if user_record:
            logging.info('I am her find one')
            result = collection_history.update_one(
            {"username": username, "session_id": session_id},
            {"$push": {"history": {"question": user_query, "response": response}}})
        else:
            logging.info('Not here')
            result = collection_history.insert_one({
            "username": username,
            "session_id": session_id,
            "history": [{"question": user_query, "response": response}]})
        return jsonify({"response": response, "session_id": session_id})
    except Exception as error:
        return jsonify({"error": error}),500
        




# end point to login user
@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    docs = collection_user.find({"username": username, "password": password})
    data = []
    for doc in docs:
        doc['_id'] = str(doc['_id']) 
        data.append(doc)

    res = False
    if len(data) > 0:
        res = True
    return jsonify({"data": data,"success": res,"username":username})
        

# end point to signup user
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    
    result = collection_user.insert_one({
        "username": data['username'],
        "password": data['password'],
        "gender": data['gender'],
        "location": data['location']
    })
    
    if result.inserted_id:
        return jsonify({"data": data, "success": True,"username":data['username']})

    return jsonify({"data": {}, "success":False })

# Endpoint to get chat history for a user
@app.route('/history', methods=['POST'])
def history():
    data = request.json
    username = data.get('username', 'default_user')
    # session_id = data.get('session_id')
    
    query = {"username": username}
    try:
        # Count the number of documents matching the query
        num_documents = collection_history.count_documents(query)
        # logging.info(f"Number of documents found: {num_documents}")
        
        # Fetch documents without projection for debugging
        user_histories = list(collection_history.find(query))
        # logging.info(f"Documents fetched without projection: {user_histories}")

        # Now apply the projection
        user_histories_projected = list(collection_history.find(query, {"_id": 0, "history": 1, "session_id": 1}))
        # logging.info(f"Documents fetched with projection: {user_histories_projected}")
        
        history_list = []
        for user_history in user_histories_projected:
            # logging.info("I am here")
            # logging.info(f"Processing document: {user_history}")
            history_list.append({
                "session_id": user_history.get("session_id"),
                "history": user_history.get("history")
            })
        return jsonify({"history": history_list})

    except Exception as e:
        logging.error(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

    # return jsonify({"history": user_history})

@app.route('/update_quantity', methods=['POST'])
def update_quantity():
    # Get data from request
    products = request.json.get('items')
    logging.info(products)
    # logging.info(dict(products).items)

    if not products:
        return jsonify({"error": "No products provided"}), 400
    
    # Read the CSV file
    df = pd.read_csv("merged_store_db.csv")
    
    for product in products:
        model = product['Description']
        logging.info(model)
        quantity_to_subtract = product['Quantity']
        
        # Check if the model exists in the CSV file
        if model not in df['Model'].values:
            return jsonify({"error": f"Model {model} not found"}), 404
        
        # Subtract the quantity
        if(df.loc[df['Model'] == model, 'COUNT']) is 0:
            return jsonify({"message": "Product not available"}), 200
        else:
            df.loc[df['Model'] == model, 'COUNT'] -= quantity_to_subtract
        df.to_csv("merged_store_db.csv", index=False)
    
    return jsonify({"message": "Quantity updated successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)
