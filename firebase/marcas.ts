import { db } from "./config";
import { 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  deleteDoc, 
  updateDoc,
} from "firebase/firestore";

export interface MarcaData {
  name: string;
}

export interface Marca extends MarcaData {
  id: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateMarcaResult {
  success: boolean;
  data?: {
    id: string;
    name: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Crea una nueva marca en la colección 'marcas'
 * El ID del documento será el nombre de la marca.
 */
export const createMarca = async (data: MarcaData): Promise<CreateMarcaResult> => {
  try {
    if (!data.name || data.name.trim() === '') {
      return {
        success: false,
        error: {
          code: 'REQUIRED_NAME',
          message: "El nombre de la marca es requerido."
        }
      };
    }

    const normalizedName = data.name.trim();
    const docRef = doc(db, "marcas", normalizedName);
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_NAME',
          message: `Ya existe una marca con el nombre "${normalizedName}".`
        }
      };
    }

    await setDoc(docRef, {
      name: normalizedName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { 
      success: true,
      data: {
        id: normalizedName,
        name: normalizedName,
      }
    };
  } catch (error: any) {
    console.error("Error creando marca:", error);
    
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: "No tienes permisos para crear marcas."
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || "Error inesperado al crear la marca."
      }
    };
  }
};

/**
 * Obtiene todas las marcas ordenadas por fecha de creación
 */
export const getAllMarcas = async (): Promise<Marca[]> => {
  try {
    const marcasRef = collection(db, "marcas");
    const q = query(marcasRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const marcas: Marca[] = [];
    querySnapshot.forEach((doc) => {
      marcas.push({
        id: doc.id,
        ...doc.data()
      } as Marca);
    });
    
    return marcas;
  } catch (error: any) {
    console.error("Error obteniendo marcas:", error);
    throw new Error("No se pudieron cargar las marcas.");
  }
};

/**
 * Obtiene una marca específica por su ID (nombre)
 */
export const getMarcaById = async (id: string): Promise<Marca | null> => {
  try {
    const docRef = doc(db, "marcas", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Marca;
    }
    
    return null;
  } catch (error: any) {
    console.error("Error obteniendo marca:", error);
    throw new Error("No se pudo obtener la marca.");
  }
};

/**
 * Actualiza una marca existente
 */
export const updateMarca = async (id: string, data: Partial<MarcaData>) => {
  try {
    const docRef = doc(db, "marcas", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`No se encontró la marca con ID: ${id}`);
    }

    if (data.name && data.name.trim() !== id) {
      const newName = data.name.trim();
      const newDocRef = doc(db, "marcas", newName);
      const newDocSnap = await getDoc(newDocRef);
      
      if (newDocSnap.exists()) {
        throw new Error(`Ya existe una marca con el nombre "${newName}".`);
      }
      
      await setDoc(newDocRef, {
        name: newName,
        createdAt: docSnap.data().createdAt,
        updatedAt: serverTimestamp(),
      });
      
      await deleteDoc(docRef);
      
      return { 
        success: true, 
        id: newName,
        message: "Marca actualizada correctamente"
      };
    } else {
      await updateDoc(docRef, {
        updatedAt: serverTimestamp(),
      });
      
      return { 
        success: true, 
        id: id,
        message: "Marca actualizada correctamente"
      };
    }
  } catch (error: any) {
    console.error("Error actualizando marca:", error);
    throw error;
  }
};

/**
 * Elimina una marca
 */
export const deleteMarca = async (id: string) => {
  try {
    const docRef = doc(db, "marcas", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`No se encontró la marca con ID: ${id}`);
    }
    
    await deleteDoc(docRef);
    
    return { 
      success: true, 
      message: "Marca eliminada correctamente"
    };
  } catch (error: any) {
    console.error("Error eliminando marca:", error);
    throw error;
  }
};

/**
 * Busca marcas por nombre (búsqueda parcial)
 */
export const searchMarcas = async (searchTerm: string): Promise<Marca[]> => {
  try {
    const marcasRef = collection(db, "marcas");
    const q = query(marcasRef, orderBy("name"));
    const querySnapshot = await getDocs(q);
    
    const marcas: Marca[] = [];
    const term = searchTerm.toLowerCase().trim();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name.toLowerCase().includes(term)) {
        marcas.push({
          id: doc.id,
          ...data
        } as Marca);
      }
    });
    
    return marcas;
  } catch (error: any) {
    console.error("Error buscando marcas:", error);
    throw new Error("No se pudieron buscar las marcas.");
  }
};
