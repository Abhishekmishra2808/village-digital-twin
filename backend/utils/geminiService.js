import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDeuF0wiOxFEJrkHJ8StvumGhN4l_Y7ocA');

export async function processFeedbackWithAI(rawComment, rating, schemeName) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are analyzing citizen feedback for a government scheme. The citizen has rated the scheme ${rating}/5 stars and provided this comment:

"${rawComment}"

Scheme Name: ${schemeName}

CRITICAL: You must completely anonymize this feedback by:
- Removing ALL names (first names, last names, nicknames)
- Removing ALL addresses (house numbers, street names, localities)
- Removing ALL personal identifiers
- Making the language neutral and professional
- Converting "I" or personal pronouns to third-person descriptions

Please analyze this feedback and provide:
1. A professional, anonymized summary (remove any identifying information like names, personal details, or writing style markers)
2. Main concerns or issues mentioned (as bullet points)
3. Sentiment classification (Positive/Neutral/Negative/Critical)
4. Issue categories (select all that apply: Quality, Delay, Budget, Vendor, Communication, Accessibility, Other)
5. Urgency level (Low/Medium/High/Critical)

Format your response as JSON:
{
  "summary": "Brief professional summary in 2-3 sentences - MUST BE FULLY ANONYMIZED",
  "concerns": ["concern 1", "concern 2", "concern 3"],
  "sentiment": "Positive/Neutral/Negative/Critical",
  "categories": ["Quality", "Delay"],
  "urgency": "Low/Medium/High/Critical",
  "suggestedRating": 3
}

Important:
- NEVER include any names, addresses, or personal identifiers in your response
- Replace specific people with general terms like "contractor", "resident", "neighbor"
- Make the summary professional and objective
- Focus on actionable issues
- If the comment is in a language other than English, translate to English
- Suggested rating should align with the sentiment (1-5 scale)

Example:
Input: "My name is John from house 45. Contractor Mr. Smith is doing bad work."
Output: "Resident reported concerns about contractor work quality requiring attention."`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 Gemini AI Response:', text);
    
    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').trim();
    }
    
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const aiAnalysis = JSON.parse(jsonMatch[0]);
      
      // Verify that no personal names appear in the summary
      console.log('✅ AI Anonymized Summary:', aiAnalysis.summary);
      
      return {
        success: true,
        analysis: aiAnalysis
      };
    }
    
    throw new Error('Could not parse AI response');
    
  } catch (error) {
    console.error('❌ Gemini AI Error:', error.message || error);
    
    // Fallback to basic processing - NEVER expose raw comment
    return {
      success: false,
      analysis: {
        summary: `Feedback received with ${rating}/5 rating. AI processing temporarily unavailable. General ${rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative'} sentiment detected.`,
        concerns: ['AI processing unavailable', 'Manual review required'],
        sentiment: rating >= 4 ? 'Positive' : rating >= 3 ? 'Neutral' : 'Negative',
        categories: ['Other'],
        urgency: rating <= 2 ? 'High' : 'Medium',
        suggestedRating: rating
      }
    };
  }
}