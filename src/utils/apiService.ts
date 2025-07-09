import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const getOpenAIApiKey = async (): Promise<string | null> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'apikey'));
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.data().api || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching OpenAI API key:", error);
    return null;
  }
};
