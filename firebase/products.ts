// lib/products.ts
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
  where,
  Timestamp
} from "firebase/firestore";

// Interfaces
export interface ProductData {
  title: string;
  price: number;
  stock: number;
  description: string;
  category: string;
  images: string[];
}

export interface Product extends ProductData {
  id: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId?: string; // Si quieres asociar productos a usuarios
}

export interface CreateProductResult {
  success: boolean;
  data?: {
    id: string;
    title: string;
    price: number;
    stock: number;
    description: string;
    category: string;
    images: string[];
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Genera un ID único para el producto
 */
const generateProductId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Crea un nuevo producto usando el título como ID del documento
 */
export const createProduct = async (
  data: ProductData, 
  userId?: string
): Promise<CreateProductResult> => {
  try {
    // Validaciones
    if (!data.title || data.title.trim() === '') {
      return {
        success: false,
        error: {
          code: 'REQUIRED_TITLE',
          message: "El título del producto es requerido."
        }
      };
    }

    if (!data.price || data.price <= 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_PRICE',
          message: "El precio debe ser mayor a 0."
        }
      };
    }

    // Validación de stock
    if (data.stock === undefined || data.stock === null || data.stock < 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_STOCK',
          message: "El stock debe ser un número válido (0 o más)."
        }
      };
    }

    if (!data.category) {
      return {
        success: false,
        error: {
          code: 'REQUIRED_CATEGORY',
          message: "La categoría es requerida."
        }
      };
    }

    if (!data.images || data.images.length === 0) {
      return {
        success: false,
        error: {
          code: 'REQUIRED_IMAGES',
          message: "Al menos una imagen es requerida."
        }
      };
    }

    // 🔥 IMPORTANTE: Usar el título como ID del documento
    // Reemplazar espacios y caracteres especiales para que sea un ID válido en Firestore
    const productId = data.title
      .trim()
      .toLowerCase() // Convertir a minúsculas
      .replace(/[^a-z0-9]/g, '_') // Reemplazar caracteres no alfanuméricos por _
      .replace(/_+/g, '_'); // Reemplazar múltiples guiones bajos por uno solo

    // Verificar si ya existe un producto con ese ID
    const docRef = doc(db, "productos", productId);
    const existingDoc = await getDoc(docRef);

    if (existingDoc.exists()) {
      return {
        success: false,
        error: {
          code: 'DUPLICATE_TITLE',
          message: `Ya existe un producto con el nombre "${data.title}". Por favor, usa un título diferente.`
        }
      };
    }

    // Crear el producto
    const productData: any = {
      title: data.title.trim(),
      price: Number(data.price),
      stock: Number(data.stock),
      description: data.description.trim(),
      category: data.category,
      images: data.images, // URLs de Cloudinary
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Si hay userId, lo agregamos
    if (userId) {
      productData.userId = userId;
    }

    await setDoc(docRef, productData);

    return {
      success: true,
      data: {
        id: productId,
        title: data.title.trim(),
        price: Number(data.price),
        stock: Number(data.stock),
        description: data.description.trim(),
        category: data.category,
        images: data.images,
      }
    };
  } catch (error: any) {
    console.error("Error creando producto:", error);

    if (error.code === 'permission-denied') {
      return {
        success: false,
        error: {
          code: 'PERMISSION_DENIED',
          message: "No tienes permisos para crear productos."
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || "Error inesperado al crear el producto."
      }
    };
  }
};

/**
 * Obtiene todos los productos ordenados por fecha de creación
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productosRef = collection(db, "productos");
    const q = query(productosRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });

    return products;
  } catch (error: any) {
    console.error("Error obteniendo productos:", error);

    if (error.code === 'permission-denied') {
      throw new Error("No tienes permisos para ver los productos.");
    }

    throw new Error("No se pudieron cargar los productos.");
  }
};

/**
 * Obtiene productos por categoría
 */
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const productosRef = collection(db, "productos");
    const q = query(
      productosRef, 
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });

    return products;
  } catch (error: any) {
    console.error("Error obteniendo productos por categoría:", error);
    throw new Error("No se pudieron cargar los productos de esta categoría.");
  }
};

/**
 * Obtiene un producto específico por su ID
 */
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    }

    return null;
  } catch (error: any) {
    console.error("Error obteniendo producto:", error);
    throw new Error("No se pudo obtener el producto.");
  }
};

/**
 * Actualiza un producto existente
 */
export const updateProduct = async (
  id: string, 
  data: Partial<ProductData>
): Promise<{ success: boolean; message: string }> => {
  try {
    // Verificar si el producto existe
    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`No se encontró el producto con ID: ${id}`);
    }

    // Preparar datos para actualizar
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.stock !== undefined) updateData.stock = Number(data.stock); // ✅ Añadido stock
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.images !== undefined) updateData.images = data.images;

    await updateDoc(docRef, updateData);

    return {
      success: true,
      message: "Producto actualizado correctamente"
    };
  } catch (error: any) {
    console.error("Error actualizando producto:", error);

    if (error.code === 'permission-denied') {
      throw new Error("No tienes permisos para actualizar este producto.");
    }

    throw error;
  }
};

/**
 * Elimina un producto
 */
export const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Verificar si el producto existe
    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`No se encontró el producto con ID: ${id}`);
    }

    // Eliminar el producto
    await deleteDoc(docRef);

    return {
      success: true,
      message: "Producto eliminado correctamente"
    };
  } catch (error: any) {
    console.error("Error eliminando producto:", error);

    if (error.code === 'permission-denied') {
      throw new Error("No tienes permisos para eliminar este producto.");
    }

    throw error;
  }
};

/**
 * Busca productos por título (búsqueda parcial)
 */
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const productosRef = collection(db, "productos");
    const q = query(productosRef, orderBy("title"));
    const querySnapshot = await getDocs(q);

    const products: Product[] = [];
    const term = searchTerm.toLowerCase().trim();

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.title.toLowerCase().includes(term)) {
        products.push({
          id: doc.id,
          ...data
        } as Product);
      }
    });

    return products;
  } catch (error: any) {
    console.error("Error buscando productos:", error);
    throw new Error("No se pudieron buscar los productos.");
  }
};

/**
 * Obtiene productos por usuario
 */
export const getProductsByUser = async (userId: string): Promise<Product[]> => {
  try {
    const productosRef = collection(db, "productos");
    const q = query(
      productosRef, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const products: Product[] = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      } as Product);
    });

    return products;
  } catch (error: any) {
    console.error("Error obteniendo productos del usuario:", error);
    throw new Error("No se pudieron cargar los productos del usuario.");
  }
};

/**
 * Actualiza el stock de un producto (útil para ventas)
 */
export const updateProductStock = async (
  id: string, 
  quantity: number,
  operation: 'add' | 'subtract' | 'set'
): Promise<{ success: boolean; message: string; newStock?: number }> => {
  try {
    const docRef = doc(db, "productos", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`No se encontró el producto con ID: ${id}`);
    }

    const currentStock = docSnap.data().stock || 0;
    let newStock: number;

    switch (operation) {
      case 'add':
        newStock = currentStock + quantity;
        break;
      case 'subtract':
        if (currentStock < quantity) {
          throw new Error(`Stock insuficiente. Stock actual: ${currentStock}`);
        }
        newStock = currentStock - quantity;
        break;
      case 'set':
        if (quantity < 0) {
          throw new Error('El stock no puede ser negativo');
        }
        newStock = quantity;
        break;
      default:
        throw new Error('Operación no válida');
    }

    await updateDoc(docRef, {
      stock: newStock,
      updatedAt: serverTimestamp()
    });

    return {
      success: true,
      message: `Stock actualizado correctamente. Nuevo stock: ${newStock}`,
      newStock
    };
  } catch (error: any) {
    console.error("Error actualizando stock:", error);
    throw error;
  }
};