import os
import dotenv
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.sentence_transformer import SentenceTransformerEmbeddings
from langchain.schema import Document
import chromadb

dotenv.load_dotenv()
OPENAI_API_KEY=os.environ.get("OPENAI_API_KEY")

class ResumeVectorStore:
    def __init__(self, collection_name: str, persist_directory: str = None):
        self.collection_name = collection_name
        self.embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
        # self.embeddings = OpenAIEmbeddings()
        self.persist_directory = persist_directory

        self.client = chromadb.PersistentClient()
        self.collection = self.client.get_or_create_collection(self.collection_name)

    def upsert_resume(self, user_name: str, resume_path: str):
        loader = PyPDFLoader(resume_path)
        docs = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        ids = [f"{user_name}_{i}" for i in range(len(splits))]
        metadatas = [{"user_name": user_name} for _ in range(len(splits))]
        self.collection.add(ids=ids, documents=[split.page_content for split in splits], metadatas=metadatas)

    def get_user_resume(self, user_name: str) -> list[Document]:
        docs = self.collection.get(where={"user_name": user_name})
        return [Document(page_content=doc, metadata={"user_name": user_name}) for doc in docs["documents"]]

    def create_vector_store(self) -> Chroma:
        return Chroma(client=self.client, collection_name=self.collection_name, embedding_function=self.embeddings, persist_directory=self.persist_directory)

    def similarity_search(self, query: str, k: int = 4) -> list[Document]:
        pass

    def as_retriever(self):
        return self.create_vector_store().as_retriever()

persist_directory = "./ml/chroma_db"
resume_store = ResumeVectorStore(collection_name="resumes", persist_directory=persist_directory)

# Upsert a resume for a user
user1_resume_path = "./ml/data/Resume.pdf"
resume_store.upsert_resume(user_name="user1", resume_path=user1_resume_path)

# Get a user's resume
user1_resume :list[Document] = resume_store.get_user_resume(user_name="user1")
for chunk in user1_resume:
    print(chunk.page_content)

# Create a vector store
vector_store = resume_store.create_vector_store()
print("There are", vector_store._collection.count(), "documents in the collection")

# Upsert a resume for a user2
user2_resume_path = "./ml/data/pr.pdf"
resume_store.upsert_resume(user_name="user2", resume_path=user2_resume_path)

# Get a user's resume
user2_resume :list[Document] = resume_store.get_user_resume(user_name="user2")
for chunk in user2_resume:
    print(chunk.page_content)

# Create a vector store
vector_store = resume_store.create_vector_store()
print("There are", vector_store._collection.count(), "documents in the collection")

# Perform similarity search
query = ""
docs = vector_store.similarity_search(query=query, k=3)
print("-----------------------------")
for doc in docs:
    print(doc.page_content)

# Get retriever
retriever = resume_store.as_retriever()