// utils/api.ts
import { getAuth } from "firebase/auth";
export const apiCall = async (endpoint: string, data: any = {}) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No autenticado');
  }
  
  const token = await user.getIdToken();
  
  const response = await fetch(
    `https://us-central1-anexodb-9f806.cloudfunctions.net/${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    }
  );
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Error en la petición');
  }
  
  return result;
};