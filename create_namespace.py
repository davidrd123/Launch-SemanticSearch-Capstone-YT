import os
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv()) # read local .env file

pinecone_api_key = os.getenv("PINECONE_API_KEY")

import pinecone

pinecone.init(api_key="YOUR_API_KEY", environment="YOUR_ENVIRONMENT")

index_name = "capstone-yt-semantic-search"
namespace_name = "capstone-yt-semantic-search-ns"

pinecone.create_namespace(index_name=index_name, namespace=namespace_name)

pinecone.deinit()