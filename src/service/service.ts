export interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
}

export interface CartItem extends MenuItem {
    quantity: number;
}

export let API_URL = "";
export function setApiUrl(url: string) {
    API_URL = url;
}

export async function fetchMenu(): Promise<MenuItem[]> {
    try {
        const res = await fetch(`${API_URL}/menu`);
        if (!res.ok) throw new Error("Erro ao buscar cardápio na API");
        const data = await res.json();
        return data.menu || data || [];
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function checkoutCart(cart: CartItem[]): Promise<{ success: boolean; message: string }> {
    try {
        const res = await fetch(`${API_URL}/checkout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cart }),
        });
        if (!res.ok) throw new Error("Erro ao finalizar compra na API");
        const data = await res.json();
        return { success: true, message: data.message || "Compra finalizada com sucesso!" };
    } catch (e) {
        console.error(e);
        return { success: false, message: "Erro ao finalizar compra." };
    }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; message: string; token?: string }> {
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Erro ao autenticar');
        const data = await res.json();
        return { success: true, message: data.message || 'Login realizado com sucesso!', token: data.token };
    } catch (e) {
        return { success: false, message: 'Erro ao autenticar.' };
    }
}