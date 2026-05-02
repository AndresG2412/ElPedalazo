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
  where
} from "firebase/firestore";

export interface CategoryData {
  name: string;
  description: string;
}

export interface Category extends CategoryData {
  id: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CreateCategoryResult {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Crea una nueva categoría en la colección 'categorias'
 * El ID del documento será el nombre de la categoría.
 */
export const createCategory = async (data: CategoryData): Promise<CreateCategoryResult> => {
  try {
    // Verificar si el nombre está presente
    if (!data.name || data.name.trim() === '') {
      return {
        success: false,
        error: {
          code: 'REQUIRED_NAME',
          message: "El nombre de la categoría es requerido."
        }
      };
    }

    // Limpiar y normalizar el nombre para usar como ID
    const normalizedName = data.name.trim();
    const docRef = doc(db, "categorias", normalizedName);
    
    // Verificar si ya existe
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_NAME',
          message: `Ya existe una categoría con el nombre "${normalizedName}".`
        }
      };
    }

    // Crear la categoría
    await setDoc(docRef, {
      name: normalizedName,
      description: data.description.trim() || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Devolver éxito con los datos
    return { 
      success: true,
      data: {
        id: normalizedName,
        name: normalizedName,
        description: data.description.trim()
      }
    };
  } catch (error: any) {
    console.error("Error creando categoría:", error);
    
    // Error de permisos
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: "No tienes permisos para crear categorías."
        }
      };
    }
    
    // Error general
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || "Error inesperado al crear la categoría."
      }
    };
  }
};

/**
 * Obtiene todas las categorías ordenadas por fecha de creación
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const categoriasRef = collection(db, "categorias");
    const q = query(categoriasRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      } as Category);
    });
    
    return categories;
  } catch (error: any) {
    console.error("Error obteniendo categorías:", error);
    
    if (error.code === 'permission-denied') {
      throw new Error("No tienes permisos para ver las categorías.");
    }
    
    throw new Error("No se pudieron cargar las categorías.");
  }
};

/**
 * Obtiene una categoría específica por su ID (nombre)
 */
export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const docRef = doc(db, "categorias", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Category;
    }
    
    return null;
  } catch (error: any) {
    console.error("Error obteniendo categoría:", error);
    throw new Error("No se pudo obtener la categoría.");
  }
};

/**
 * Actualiza una categoría existente
 */
export const updateCategory = async (id: string, data: Partial<CategoryData>) => {
  try {
    // Verificar si la categoría existe
    const docRef = doc(db, "categorias", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`No se encontró la categoría con ID: ${id}`);
    }

    // Si se está actualizando el nombre, verificar que el nuevo nombre no exista ya
    if (data.name && data.name.trim() !== id) {
      const newName = data.name.trim();
      const newDocRef = doc(db, "categorias", newName);
      const newDocSnap = await getDoc(newDocRef);
      
      if (newDocSnap.exists()) {
        throw new Error(`Ya existe una categoría con el nombre "${newName}".`);
      }
      
      // Crear nuevo documento con el nuevo nombre
      await setDoc(newDocRef, {
        name: newName,
        description: data.description || docSnap.data().description,
        createdAt: docSnap.data().createdAt,
        updatedAt: serverTimestamp(),
      });
      
      // Eliminar el documento antiguo
      await deleteDoc(docRef);
      
      return { 
        success: true, 
        id: newName,
        message: "Categoría actualizada correctamente"
      };
    } else {
      // Solo actualizar descripción u otros campos
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };
      
      if (data.description !== undefined) {
        updateData.description = data.description.trim();
      }
      
      await updateDoc(docRef, updateData);
      
      return { 
        success: true, 
        id: id,
        message: "Categoría actualizada correctamente"
      };
    }
  } catch (error: any) {
    console.error("Error actualizando categoría:", error);
    throw error;
  }
};

/**
 * Elimina una categoría
 */
export const deleteCategory = async (id: string) => {
  try {
    // Verificar si la categoría existe
    const docRef = doc(db, "categorias", id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`No se encontró la categoría con ID: ${id}`);
    }
    
    // Aquí podrías verificar si hay productos asociados antes de eliminar
    // const hasProducts = await checkIfCategoryHasProducts(id);
    // if (hasProducts) {
    //   throw new Error("No se puede eliminar la categoría porque tiene productos asociados.");
    // }
    
    // Eliminar la categoría
    await deleteDoc(docRef);
    
    return { 
      success: true, 
      message: "Categoría eliminada correctamente"
    };
  } catch (error: any) {
    console.error("Error eliminando categoría:", error);
    
    if (error.code === 'permission-denied') {
      throw new Error("No tienes permisos para eliminar categorías.");
    }
    
    throw error;
  }
};

/**
 * Verifica si una categoría existe
 */
export const categoryExists = async (name: string): Promise<boolean> => {
  try {
    const docRef = doc(db, "categorias", name.trim());
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("Error verificando categoría:", error);
    return false;
  }
};

/**
 * Busca categorías por nombre (búsqueda parcial)
 */
export const searchCategories = async (searchTerm: string): Promise<Category[]> => {
  try {
    const categoriasRef = collection(db, "categorias");
    const q = query(categoriasRef, orderBy("name"));
    const querySnapshot = await getDocs(q);
    
    const categories: Category[] = [];
    const term = searchTerm.toLowerCase().trim();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name.toLowerCase().includes(term)) {
        categories.push({
          id: doc.id,
          ...data
        } as Category);
      }
    });
    
    return categories;
  } catch (error: any) {
    console.error("Error buscando categorías:", error);
    throw new Error("No se pudieron buscar las categorías.");
  }
};