const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
const { HuggingFaceInferenceEmbeddings } = require('@langchain/community/embeddings/hf');
const { Chroma } = require('@langchain/community/vectorstores/chroma');
const { ChromaClient } = require('chromadb');
const { RunnablePassthrough, RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { HuggingFaceInference } = require("@langchain/community/llms/hf");
// const { HuggingFaceInference } = require("langchain/llms/hf"); // not working
const { ConversationBufferMemory } = require('langchain/memory');
const { ConsoleCallbackHandler } = require('langchain/callbacks');
const readline = require('readline');
const { BaseTool } = require('langchain/tools');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { createRetrieverTool } = require("langchain/tools/retriever");
const { createToolCallingAgent, AgentExecutor } = require("langchain/agents");

require('dotenv').config();
const retrieverTool = createRetrieverTool(retriever, {
    name: "ask_follow_up_questions",
    description:
        "Ask follow-up question based on the user-input. For any questions about development, you must use this tool!",
});

const formatDocumentsAsString = (documents) => {
    return documents.map((document) => document.pageContent).join("\n\n");
};
// const hf = new HfInference(process.env.HUGGINGFACEHUB_API_KEY);

class InterviewTool extends BaseTool {
    constructor() {
        super();
        this.name = 'Interview Tool';
        this.description = 'Use this tool to decide whether to ask a follow-up question to the user or ask an interview question based on the resume. The input should be the user\'s message or the resume text.';
    }

    async _run(inputStr) {
        if (inputStr.toLowerCase().includes('resume')) {
            return 'Ask an interview question based on the resume';
        } else {
            return 'Ask a follow-up question to the user';
        }
    }
}

async function createAgent() {
    // Load the language model
    const llm = new HuggingFaceInference({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        temperature: 0.4,
    });

    // Create the custom tool
    const interviewTool = new InterviewTool();

    // Create the agent
    const tools = [interviewTool];
    const memory = new ConversationBufferMemory({ memoryKey: 'chat_history' });
    const callbackHandler = new ConsoleCallbackHandler();

    const executor = await new AgentExecutor(
        tools,
        llm,
        'conversational-react-description',
        true,
        callbackHandler,
        memory
    );

    return executor;
}


async function runAgent() {
    const agent = await createAgent();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('Welcome to the Interview Agent!');
    console.log('Type "exit" to quit.\n');

    rl.on('line', async (input) => {
        if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        const result = await agent.evoke({ input });
        console.log(`Assistant: ${result.output}\n`);
    });
}

(async () => {
    // Load documents

    const loader = new PDFLoader("./resume.pdf");
    const rawDocs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const docs = await splitter.splitDocuments(rawDocs);

    // Embedding
    const emb_model = new HuggingFaceInferenceEmbeddings({
        apiKey: "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",
        model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const chromaClient = new ChromaClient();

    const vectorStore = await MemoryVectorStore.fromDocuments(
        docs,
        emb_model,
        {
            client: chromaClient,
            collectionName: 'resume',
        }
    );

    const vectorStoreRetriever = vectorStore.asRetriever();

    // Create a system & human prompt for the chat model
    const SYSTEM_TEMPLATE = `You are an AI interviewer, conducting professional interviews with candidates. Your goal is to be as natural, empathetic, and engaging as a human interviewer.Ask questions one at a time, giving the interviewee ample time to respond.Use a mix of open-ended and specific questions to gather comprehensive insights.For open-ended questions, encourage the interviewee to elaborate.Based on the interviewee’s responses, ask follow-up questions to delve deeper.After total 5 questions, ask if the interviewee has any questions or needs further information to end the interview
    ----------------
    {context}`;

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", SYSTEM_TEMPLATE],
        ["human", "{question}"],
    ]);

    const model = new HuggingFaceInference({
        model: "mistralai/Mistral-7B-Instruct-v0.2",
        temperature: 0.4,
    });

    const chain = RunnableSequence.from([
        {
            context: vectorStoreRetriever.pipe(formatDocumentsAsString),
            question: new RunnablePassthrough(),
        },
        prompt,
        model,
        new StringOutputParser(),
    ]);


    const answer = await chain.invoke(
        "Generate a skill based interview question based on the context?"
    );

    console.log({ answer });

})();
