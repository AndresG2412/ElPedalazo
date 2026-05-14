import { db } from "./config";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  setDoc,
  doc
} from "firebase/firestore";

export interface ClienteData {
  id?: string;
  nombre: string;
  email: string;
  password?: string;
  createdAt?: any;
  tipo?: string;
}

/**
 * Registra un nuevo cliente manualmente en la colección 'clientes'
 * No se registra en Firebase Auth.
 */
export const registrarClienteManual = async (data: ClienteData) => {
  try {
    const clientesRef = collection(db, "clientes");
    
    // Verificar si ya existe el correo
    const q = query(clientesRef, where("email", "==", data.email.toLowerCase().trim()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, message: "El correo ya está registrado en nuestra base de datos." };
    }

    // Crear el documento con un ID basado en el email para facilitar búsquedas
    const docId = data.email.toLowerCase().trim();
    await setDoc(doc(db, "clientes", docId), {
      nombre: data.nombre,
      email: data.email.toLowerCase().trim(),
      password: data.password, // Se guarda en Firestore como solicitó el usuario
      tipo: "cliente_manual",
      createdAt: serverTimestamp()
    });

    return { success: true, message: "Cuenta de cliente creada correctamente." };
  } catch (error: any) {
    console.error("Error al registrar cliente:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Inicia sesión buscando en la colección 'clientes' (Manual)
 */
export const loginClienteManual = async (email: string, password: string) => {
  try {
    const clientesRef = collection(db, "clientes");
    const q = query(
      clientesRef, 
      where("email", "==", email.toLowerCase().trim()),
      where("password", "==", password)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, message: "Correo o contraseña incorrectos." };
    }

    const doc = querySnapshot.docs[0];
    const cliente = {
      id: doc.id,
      ...doc.data()
    };

    return { success: true, cliente };
  } catch (error: any) {
    console.error("Error en login manual:", error);
    return { success: false, message: error.message };
  }
};
