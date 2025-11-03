import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDeuF0wiOxFEJrkHJ8StvumGhN4l_Y7ocA');

export async function processFeedbackWithAI(rawComment, rating, schemeName) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are analyzing citizen feedback for a government scheme. The citizen has rated the scheme ${rating}/5 stars and provided this comment:

"${rawComment}"

Scheme Name: ${schemeName}

Please analyze this feedback and provide:
1. A professional, anonymized summary (remove any identifying information like names, personal details, or writing style markers)
2. Main concerns or issues mentioned (as bullet points)
3. Sentiment classification (Positive/Neutral/Negative/Critical)
4. Issue categories (select all that apply: Quality, Delay, Budget, Vendor, Communication, Accessibility, Other)
5. Urgency level (Low/Medium/High/Critical)

Format your response as JSON:
{
  "summary": "Brief professional summary in 2-3 sentences",
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "sentiment": "Positive/Neutral/Negative/Critical",
  "categories": ["Quality", "Delay"],
  "urgency": "Low/Medium/High/Critical",
  "suggestedRating": 3
}

Important:
- Remove any personal identifiers, names, or unique phrases
- Make the summary professional and objective
- Focus on actionable issues
- If the comment is in a language other than English, translate to English
- Suggested rating should align with the sentiment (1-5 scale)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiAnalysis = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        analysis: aiAnalysis
      };
    }
    
    throw new Error('Could not parse AI response');
    
  } catch (error) {
    console.error('❌ Gemini AI Error:', error);
    
    // Fallback to basic processing
    return {
      success: false,
      analysis: {
        summary: rawComment.substring(0, 200) + (rawComment.length > 200 ? '...' : ''),
        concerns: ['Feedback processing failed - showing original comment'],
        sentiment: rating >= 4 ? 'Positive' : rating >= 3 ? 'Neutral' : 'Negative',
        categories: ['Other'],
        urgency: 'Medium',
        suggestedRating: rating
      }
    };
  }
}
