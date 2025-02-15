from pymongo import MongoClient
import csv
# import python modules
from constants import predefined_questions, database_name, database_collection,database_connection_url

client = MongoClient(database_connection_url)
db = client.tech_store
collection = db.products
collection_users = db.users

#  - category: Laptop | phone
#  - price
#  - description
#  - name: First work of model + type (HP laptop, Asus laptop)

file_path = "./data/merged_store_db.csv"

def read_csv_file():
    counter = 0
    products = []

    with open(file_path,"r") as file:
        csv_reader = csv.reader(file)
        for row in csv_reader: 
            if(counter > 0):
                products.append({
                    "category": row[0].lower(),
                    "name": row[1].split()[0].lower() +" "+ row[0].lower(),
                    "description": (row[0]+" "+row[1]+" "+row[2]+" "+row[3]+" "+row[4]+" "+row[5]+" "+row[6]).lower(),
                    "price": int(row[7]),
                    "rating": row[8],
                    "count": int(row[10])
                })
            else:
                counter+=1
    
    return products

def insert_products():
    products = read_csv_file()
    result = collection.insert_many(products)

    collection_users.insert_one({
        "username": "admin",
        "password": "admin",
        "gender": "male",
        "location": "isreal"
    })

    print("Inserted Data Succeessfully. \nInsert Ids: "+str(result.inserted_ids))
    print("\n All Data Inserted !!!")

insert_products()
