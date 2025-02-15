#Backend Chatbot 

To install all packages:
- pip install Flask pymongo dnspython
- pip install torch
- pip install python-docx
- pip install python-dotenv
- pip install langchain faiss-cpu openai
- pip install PyPDF2
- pip install tiktoken



To extract  data  from .csv file to your database use this command in cmd or terminal:
- commmand: python extract_csv_to_db.py
- the command above will also create a default user with username: admin and password: admin

- To run project simply enter the command:
  command: python app.py

- If in localhost change the value of database_connection_url to: mongodb://localhost:27017/
   it should be done in the file called constants.py

