import { useState } from 'react';

interface GeminiResponse {
  bio: string;
  price: number;
}

export function useGeminiAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProfileContent = async (
    fullName: string,
    skill: string,
    yearsExperience: number,
    location: string
  ): Promise<GeminiResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('Gemini API key not found. Please check your environment variables.');
      }

      const prompt = `You are helping a skilled township freelancer write a short professional bio and estimate a fair starting price. Their name is ${fullName}, they are a ${skill} with ${yearsExperience} years of experience in ${location}. Write a warm, confident, 1–2 sentence bio. Then suggest a fair starting price in ZAR (South African Rand). 

IMPORTANT: Write the bio in a positive, professional tone. Avoid any negative language or words that could be perceived as unprofessional. Focus on skills, experience, and value provided to clients.

Please respond in this exact JSON format:
{
  "bio": "Professional bio here",
  "price": 250
}`;

      // Updated API endpoint for Gemini 1.5 Flash
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API response:', response.status, errorData);
        
        if (response.status === 400) {
          throw new Error('Invalid request to Gemini API. Please check your API key and try again.');
        } else if (response.status === 403) {
          throw new Error('Gemini API access denied. Please check your API key permissions.');
        } else if (response.status === 404) {
          throw new Error('Gemini API endpoint not found. Please verify your API key is valid.');
        } else {
          throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
        }
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No content generated from Gemini API');
      }

      // Try to parse JSON response
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          return {
            bio: parsedResponse.bio,
            price: parsedResponse.price
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON, using fallback parsing');
      }

      // Fallback parsing if JSON format fails
      const bioMatch = generatedText.match(/bio["\s]*:["\s]*([^"]+)/i);
      const priceMatch = generatedText.match(/price["\s]*:["\s]*(\d+)/i);

      return {
        bio: bioMatch ? bioMatch[1] : generateFallbackBio(fullName, skill, yearsExperience, location),
        price: priceMatch ? parseInt(priceMatch[1]) : generateFallbackPrice(skill, yearsExperience)
      };

    } catch (err) {
      console.error('Gemini API error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      
      // Return fallback content
      return {
        bio: generateFallbackBio(fullName, skill, yearsExperience, location),
        price: generateFallbackPrice(skill, yearsExperience)
      };
    } finally {
      setLoading(false);
    }
  };

  const generateBio = async (data: { skill: string; experience: number; location: string }): Promise<string> => {
    // Fallback bio generation for local profiles
    const templates = [
      `Professional ${data.skill.toLowerCase()} with ${data.experience} years of experience serving clients in ${data.location}. Known for delivering high-quality work and exceptional customer service.`,
      `With ${data.experience} years of hands-on experience, this ${data.skill.toLowerCase()} specialist has built a reputation for reliability and expertise in ${data.location}.`,
      `Experienced ${data.skill.toLowerCase()} professional with ${data.experience} years in the field, serving the ${data.location} community with dedication and skill.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  };

  const generatePricing = async (data: { skill: string; experience: number; location: string }): Promise<number> => {
    const basePrices: { [key: string]: number } = {
      'Hairdressing': 150,
      'Plumbing': 300,
      'Tutoring': 180,
      'Makeup': 200,
      'Cleaning': 120,
      'Catering': 250,
      'Photography': 400,
      'Sewing': 180,
      'Crochet': 150,
      'Electrical': 350,
      'Other': 200
    };
    
    const basePrice = basePrices[data.skill] || 200;
    const experienceMultiplier = 1 + (data.experience * 0.1);
    
    return Math.round(basePrice * experienceMultiplier);
  };

  return {
    generateProfileContent,
    generateBio,
    generatePricing,
    loading,
    error
  };
}

function generateFallbackBio(fullName: string, skill: string, yearsExperience: number, location: string): string {
  const templates = [
    `${fullName} is a skilled ${skill.toLowerCase()} with ${yearsExperience} years of experience serving clients in ${location}. Known for delivering high-quality work and exceptional customer service.`,
    `With ${yearsExperience} years of hands-on experience, ${fullName} specializes in ${skill.toLowerCase()} and has built a reputation for reliability and expertise in ${location}.`,
    `${fullName} brings ${yearsExperience} years of professional ${skill.toLowerCase()} experience to every project. Based in ${location}, they are committed to exceeding client expectations.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateFallbackPrice(skill: string, yearsExperience: number): number {
  const basePrices: { [key: string]: number } = {
    'Hairdressing': 150,
    'Plumbing': 300,
    'Tutoring': 180,
    'Makeup': 200,
    'Cleaning': 120,
    'Catering': 250,
    'Photography': 400,
    'Sewing': 180,
    'Crochet': 150,
    'Electrical': 350,
    'Other': 200
  };
  
  const basePrice = basePrices[skill] || 200;
  const experienceMultiplier = 1 + (yearsExperience * 0.1);
  
  return Math.round(basePrice * experienceMultiplier);
}