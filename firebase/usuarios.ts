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
  deleteDoc
} from "firebase/firestore";

export interface AdminData {
  name: string;
  email: string;
  role?: string;
}

export interface Admin extends AdminData {
  id: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface AdminOperationResult {
  success: boolean;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Agrega un nuevo administrador a la colección 'admins'
 * El ID del documento será el correo electrónico.
 */
export const addAdmin = async (data: AdminData): Promise<AdminOperationResult> => {
  try {
    if (!data.email || data.email.trim() === '') {
      return {
        success: false,
        error: {
          code: 'REQUIRED_EMAIL',
          message: "El correo electrónico es requerido."
        }
      };
    }

    const email = data.email.toLowerCase().trim();
    const docRef = doc(db, "admins", email);
    
    // Verificar si ya existe
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_ADMIN',
          message: `El usuario con correo "${email}" ya es administrador.`
        }
      };
    }

    // Crear el administrador
    await setDoc(docRef, {
      name: data.name.trim(),
      email: email,
      role: data.role || 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return { 
      success: true,
      message: "Administrador agregado correctamente."
    };
  } catch (error: any) {
    console.error("Error agregando administrador:", error);
    
    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: "No tienes permisos para realizar esta acción."
        }
      };
    }
    
    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || "Error inesperado al agregar el administrador."
      }
    };
  }
};

/**
 * Obtiene todos los administradores ordenados por fecha de creación
 */
export const getAllAdmins = async (): Promise<Admin[]> => {
  try {
    const adminsRef = collection(db, "admins");
    const q = query(adminsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    const admins: Admin[] = [];
    querySnapshot.forEach((doc) => {
      admins.push({
        id: doc.id,
        ...doc.data()
      } as Admin);
    });
    
    return admins;
  } catch (error: any) {
    console.error("Error obteniendo administradores:", error);
    throw new Error("No se pudieron cargar los administradores.");
  }
};

/**
 * Elimina un administrador por su correo (ID)
 */
export const deleteAdmin = async (email: string): Promise<AdminOperationResult> => {
  try {
    const docRef = doc(db, "admins", email.toLowerCase().trim());
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: "El administrador no existe."
        }
      };
    }
    
    await deleteDoc(docRef);
    
    return { 
      success: true, 
      message: "Administrador eliminado correctamente."
    };
  } catch (error: any) {
    console.error("Error eliminando administrador:", error);
    return {
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: error.message || "Error al eliminar el administrador."
      }
    };
  }
};
