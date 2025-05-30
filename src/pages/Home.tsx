import { useState, useEffect } from 'react';
import { fetchMenu, checkoutCart, setApiUrl, loginUser } from '../service/service';
import type { MenuItem, CartItem } from '../service/service';

// Defina a URL do seu mock server aqui para usar a API
setApiUrl('https://0ef62359-c063-45e6-adaa-f74d684b88c0.mock.pstmn.io');

export default function Home() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    fetchMenu().then((data) => {
      setMenu(data);
      setLoadingMenu(false);
    });
  }, []);

  function handleLogin() {
    setLoginOpen(true);
    setLoginError('');
    setLoginSuccess('');
  }

  async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    setLoginSuccess('');
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const res = await loginUser(email, password);
    setLoginLoading(false);
    if (res.success) {
      setLoginSuccess(res.message);
      setUser(email);
      setTimeout(() => setLoginOpen(false), 1200);
    } else {
      setLoginError(res.message);
    }
  }

  function handleLogout() {
    setUser(null);
  }

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleCheckout() {
    setCheckoutMsg('Processando...');
    const res = await checkoutCart(cart);
    setCheckoutMsg(res.message);
    setCart([]);
    setTimeout(() => setCheckoutMsg(''), 2500);
    setCartOpen(false);
  }

  // Soma total de itens no carrinho
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        paddingLeft: 24,
        paddingRight: 24,
        minHeight: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Modal de Login */}
      {loginOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <form
            onSubmit={handleLoginSubmit}
            style={{
              background: '#fff',
              borderRadius: 8,
              boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
              padding: 32,
              minWidth: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setLoginOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'transparent',
                border: 'none',
                fontSize: 22,
                cursor: 'pointer',
                color: '#888',
              }}
              title="Fechar"
            >×</button>
            <h2 style={{ margin: 0 }}>Login</h2>
            <input
              name="username"
              type="text"
              placeholder="Nome de usuário"
              required
              style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
              autoFocus
            />
            <input
              name="password"
              type="password"
              placeholder="Senha"
              required
              style={{ padding: 10, borderRadius: 4, border: '1px solid #ccc', fontSize: 16 }}
            />
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                background: loginLoading ? '#aaa' : '#222',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '10px 0',
                fontWeight: 600,
                fontSize: 16,
                cursor: loginLoading ? 'not-allowed' : 'pointer',
                marginTop: 8,
              }}
            >
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </button>
            {loginError && <div style={{ color: 'red', fontSize: 15 }}>{loginError}</div>}
            {loginSuccess && <div style={{ color: 'green', fontSize: 15 }}>{loginSuccess}</div>}
          </form>
        </div>
      )}
      {cartOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 300,
            height: '95vh',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.13)',
            zIndex: 200,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInCart 0.2s',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Carrinho</h2>
          <button
            onClick={() => setCartOpen(false)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'transparent',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: '#ffff',
            }}
            title="Fechar"
          >
            ×
          </button>
          <div style={{ flex: 1, overflowY: 'auto', marginTop: 24 }}>
            {cart.length === 0 ? (
              <p>Seu carrinho está vazio.</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                  <img src={item.image} alt={item.name} style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', marginRight: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 14, color: '#555' }}>Qtd: {item.quantity}</div>
                    <div style={{ fontSize: 14, color: '#555' }}>R$ {(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#c00',
                      fontSize: 18,
                      cursor: 'pointer',
                      marginLeft: 8,
                    }}
                    title="Remover"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>
              Total: R$ {cartTotal.toFixed(2)}
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              style={{
                width: '100%',
                background: cart.length === 0 ? '#aaa' : 'green',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '12px 0',
                fontWeight: 600,
                fontSize: 16,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                marginTop: 8,
                transition: 'background 0.18s',
              }}
            >
              Finalizar compra
            </button>
          </div>
        </div>
      )}
      {/* Mensagem de checkout */}
      {checkoutMsg && (
        <div style={{
          position: 'fixed',
          top: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#222',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 18,
          zIndex: 300,
          boxShadow: '0 4px 24px rgba(0,0,0,0.13)'
        }}>{checkoutMsg}</div>
      )}
      <header style={{
        width: '100%',
        background: '#222',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
      }}>
        <span style={{ fontWeight: 700, fontSize: 22 }}>Meu Cardápio</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            style={{
              background: 'transparent',
              color: '#fff',
              border: 'none',
              fontSize: 18,
              position: 'relative',
              cursor: 'pointer',
              marginRight: 8
            }}
            title="Ver carrinho"
            onClick={() => setCartOpen(true)}
          >
            🛒
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -8,
                right: -8,
                background: 'red',
                color: '#fff',
                borderRadius: '50%',
                fontSize: 12,
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                border: '2px solid #222',
              }}>{cartCount}</span>
            )}
          </button>
          {user ? (
            <>
              <span style={{ color: '#fff', fontWeight: 500, fontSize: 15 }}>Olá, {user}</span>
              <button
                onClick={handleLogout}
                style={{
                  background: '#fff',
                  color: '#222',
                  border: 'none',
                  borderRadius: 4,
                  padding: '8px 20px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16
                }}
              >
                Sair
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              style={{
                background: '#fff',
                color: '#222',
                border: 'none',
                borderRadius: 4,
                padding: '8px 20px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 16
              }}
            >
              Login
            </button>
          )}
        </div>
      </header>
      <div style={{ padding: '96px 0 48px 0' }}>
        <h1>Cardápio</h1>
        {loadingMenu ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>Carregando cardápio...</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {menu.map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  padding: 16,
                  width: 240,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px) scale(1.03)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = '';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                <img src={item.image} alt={item.name} style={{ width: '100%', borderRadius: 4, height: 140, objectFit: 'cover' }} />
                <h2 style={{ margin: '12px 0 4px' }}>{item.name}</h2>
                <p style={{ margin: '4px 0' }}>{item.description}</p>
                <strong>R$ {item.price.toFixed(2)}</strong>
                <button
                  onClick={() => addToCart(item)}
                  style={{
                    marginTop: 12,
                    width: '100%',
                    background: '#222',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '10px 0',
                    fontWeight: 600,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'background 0.18s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#444')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#222')}
                >
                  Adicionar ao carrinho
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <footer style={{
        width: '100%',
        background: '#222',
        color: '#fff',
        textAlign: 'center',
        padding: '18px 0 12px 0',
        position: 'fixed',
        left: 0,
        bottom: 0,
        zIndex: 99,
        fontSize: 15,
        letterSpacing: 0.5,
        boxShadow: '0 -2px 8px rgba(0,0,0,0.07)'
      }}>
        &copy; {new Date().getFullYear()} Meu Cardápio. Todos os direitos reservados.
      </footer>
      {/* Animação do modal do carrinho */}
      <style>{`
        @keyframes slideInCart {
          from { right: -400px; opacity: 0; }
          to { right: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}