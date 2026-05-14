import { db } from "./config";
import { doc, setDoc, getDoc } from "firebase/firestore";

/**
 * Guarda el carrito en Firestore para persistencia entre dispositivos
 */
export const saveCartToFirestore = async (userId: string, collectionName: string, cartItems: any[]) => {
  try {
    const userDocRef = doc(db, collectionName, userId);
    await setDoc(userDocRef, {
      carrito: cartItems
    }, { merge: true });
  } catch (error) {
    console.error("Error saving cart to Firestore:", error);
    // Si el documento no existe (ej. usuario de Google no registrado en la colección), 
    // podrías crearlo aquí si fuera necesario, pero por ahora asumimos que existe
    // o que el usuario está en una de las dos colecciones principales.
  }
};

/**
 * Obtiene el carrito desde Firestore
 */
export const getCartFromFirestore = async (userId: string, collectionName: string) => {
  try {
    const userDocRef = doc(db, collectionName, userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data().carrito || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting cart from Firestore:", error);
    return [];
  }
};
