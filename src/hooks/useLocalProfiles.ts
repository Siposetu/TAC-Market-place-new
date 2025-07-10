import { useState, useEffect } from 'react';
import { useGeminiAI } from './useGeminiAI';
import { useGoogleSheets } from './useGoogleSheets';

export interface FlexibleHour {
  id?: string;
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface LocalProfile {
  id: string;
  fullName: string;
  skill: string;
  yearsExperience: number;
  location: string;
  contact: string;
  availability: FlexibleHour[];
  status: string;
  bioAI?: string;
  suggestedPriceZAR: number;
  profileImage?: string;
}

export function useLocalProfiles() {
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const { generateBio, generatePricing } = useGeminiAI();
  const { addProfile: syncToGoogleSheets } = useGoogleSheets();

  // Load profiles from localStorage on mount
  useEffect(() => {
    const savedProfiles = localStorage.getItem('localProfiles');
    if (savedProfiles) {
      try {
        setProfiles(JSON.parse(savedProfiles));
      } catch (error) {
        console.error('Error loading profiles from localStorage:', error);
      }
    }
  }, []);

  // Save profiles to localStorage whenever profiles change
  useEffect(() => {
    localStorage.setItem('localProfiles', JSON.stringify(profiles));
  }, [profiles]);

  const updateProfile = async (id: string, updates: Partial<LocalProfile>) => {
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === id ? { ...profile, ...updates } : profile
      )
    );
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== id));
  };

  const submitProfile = async (formData: any) => {
    setLoading(true);
    try {
      // Generate unique ID
      const id = Date.now().toString();
      
      // Convert profile image to base64 if provided
      let profileImageBase64 = '';
      if (formData.profileImage) {
        profileImageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(formData.profileImage);
        });
      }
      
      // Format availability as FlexibleHour array
      let availability: FlexibleHour[] = [];
      if (formData.availability === 'Flexible hours (set custom schedule)' && formData.flexibleHours) {
        availability = formData.flexibleHours;
      } else {
        // Generate default availability based on selection
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        availability = daysOfWeek.map(day => ({
          id: `${day}-${Date.now()}`,
          day,
          startTime: '09:00',
          endTime: '17:00',
          available: formData.availability === 'Full-time' || 
                    (formData.availability === 'Part-time' && day !== 'Sunday') ||
                    (formData.availability === 'Weekends only' && (day === 'Saturday' || day === 'Sunday'))
        }));
      }
      
      // Generate AI bio and pricing
      const bioAI = await generateBio({
        skill: formData.skill,
        experience: formData.yearsExperience,
        location: formData.location
      });
      
      const suggestedPriceZAR = await generatePricing({
        skill: formData.skill,
        experience: formData.yearsExperience,
        location: formData.location
      });
      
      // Create new profile
      const newProfile: LocalProfile = {
        id,
        fullName: formData.fullName,
        skill: formData.skill,
        yearsExperience: formData.yearsExperience,
        location: formData.location,
        contact: formData.contact,
        availability,
        status: 'Ready',
        bioAI,
        suggestedPriceZAR,
        profileImage: profileImageBase64
      };
      
      // Add to local profiles
      setProfiles(prev => [...prev, newProfile]);
      
      // Sync to Google Sheets if available
      try {
        await syncToGoogleSheets(newProfile);
      } catch (error) {
        console.warn('Failed to sync to Google Sheets:', error);
        // Continue anyway - profile is saved locally
      }
      
    } catch (error) {
      console.error('Error submitting profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const regenerateAIContent = async (profileId: string) => {
    setLoading(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        const newBio = `Professional ${profile.skill} with ${profile.yearsExperience} years of experience in ${profile.location}. Skilled in delivering high-quality services with attention to detail and customer satisfaction.`;
        
        await updateProfile(profileId, { 
          bioAI: newBio,
          status: 'Ready'
        });
      }
    } catch (error) {
      console.error('Error regenerating AI content:', error);
      await updateProfile(profileId, { status: 'AI Generation Failed' });
    } finally {
      setLoading(false);
    }
  };

  return {
    profiles,
    submitProfile,
    updateProfile,
    deleteProfile,
    regenerateAIContent,
    loading
  };
}