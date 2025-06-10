// OpenAI API service for data analysis
import OpenAI from 'openai';

// Check if API key exists
const apiKey = process.env.OPENAI_API_KEY;

// Initialize the OpenAI client
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Function to extract metadata from CSV content
export async function analyzeDatasetContent(
  fileContent: string, 
  fileName: string, 
  fileType: string
): Promise<{ 
  description: string; 
  summary: string;
  suggestedImageTerms: string[];
  columns: string[];
  insights: string[];
}> {
  try {
    // If OpenAI client is not initialized, return default values
    if (!openai || !apiKey) {
      console.warn('OpenAI API key is not configured. Using default values.');
      return {
        description: `Dataset extracted from ${fileName}`,
        summary: fileName,
        suggestedImageTerms: ['data', 'analytics', 'chart'],
        columns: [],
        insights: []
      };
    }
    // For CSV files, we'll send a sample of the content
    // For larger files, consider just sending the header and a few rows
    const sampleContent = fileContent.split('\n').slice(0, 20).join('\n');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a data analysis assistant. Analyze the provided dataset sample and extract useful metadata.
            Format your response as JSON with these fields:
            - description: A detailed paragraph describing what this dataset contains and its potential use cases
            - summary: A brief one-sentence summary of the dataset content
            - columns: An analysis of each column's data type and purpose
            - insights: 2-3 initial insights about patterns or noteworthy aspects of this data
            - suggestedImageTerms: 3 search terms that would yield relevant images to represent this dataset visually (single words or short phrases)`
        },
        {
          role: "user",
          content: `Analyze this ${fileType} file named "${fileName}":\n\n${sampleContent}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response with error handling
    const responseText = response.choices[0]?.message?.content || '{}';
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      return {
        description: `Dataset extracted from ${fileName}`,
        summary: fileName,
        suggestedImageTerms: ['data', 'analytics', 'chart'],
        columns: [],
        insights: []
      };
    }
    
    return {
      description: result.description || `Dataset extracted from ${fileName}`,
      summary: result.summary || fileName,
      suggestedImageTerms: result.suggestedImageTerms || ['data', 'analytics', 'chart'],
      columns: result.columns,
      insights: result.insights
    };
  } catch (error) {
    console.error("Error analyzing dataset with OpenAI:", error);
    return {
      description: `Dataset extracted from ${fileName}`,
      summary: fileName,
      suggestedImageTerms: ['data', 'analytics', 'chart'],
      columns: [],
      insights: []
    };
  }
}

// Function to get a relevant image URL for dataset visualization
export async function getRelevantImagePrompt(terms: string[]): Promise<string> {
  // Create a prompt for generating dataset visualization
  const searchTerm = terms.join(", ");
  return `abstract data visualization of ${searchTerm}, professional, minimalist, business analytics dashboard`;
}
