import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const fallbackImages = [
  'photo-1542838132-92c53300491e',
  'photo-1542291026-7eec264c27ff',
  'photo-1505740420928-5e560c06d30e',
  'photo-1523275335684-37898b6baf30',
  'photo-1553062407-98eeb64c6a62',
  'photo-1608248543803-ba4f8c70ae0b',
];

function productImage(product, index) {
  const name = `${product.product_name} ${product.description || ''}`.toLowerCase();
  const matches = [
    [/coffee|tea|drink|bottle|mug/, 'photo-1447933601403-0c6688de566e'],
    [/shoe|sneaker|trainer/, 'photo-1542291026-7eec264c27ff'],
    [/headphone|audio|speaker/, 'photo-1505740420928-5e560c06d30e'],
    [/watch|clock/, 'photo-1523275335684-37898b6baf30'],
    [/bag|pack|purse/, 'photo-1553062407-98eeb64c6a62'],
    [/skin|beauty|cream|lotion|soap/, 'photo-1608248543803-ba4f8c70ae0b'],
    [/shirt|clothing|jacket|wear/, 'photo-1521572163474-6864f9cf17ab'],
    [/camera|photo/, 'photo-1516035069371-29a1b244cc32'],
  ];
  const image = matches.find(([pattern]) => pattern.test(name))?.[1] || fallbackImages[index % fallbackImages.length];
  return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=85`;
}

export default function ProductList({ user, onLogout }) {
  const canManageProducts = user.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  const visibleProducts = products
    .filter((product) => {
      const matchesQuery = `${product.product_name} ${product.description || ''}`.toLowerCase().includes(query.toLowerCase());
      const matchesStock = stockFilter === 'all'
        || (stockFilter === 'available' && Number(product.quantity) > 0)
        || (stockFilter === 'low' && Number(product.quantity) > 0 && Number(product.quantity) <= 5);
      return matchesQuery && matchesStock;
    })
    .sort((first, second) => {
      if (sortBy === 'price-low') return Number(first.price) - Number(second.price);
      if (sortBy === 'price-high') return Number(second.price) - Number(first.price);
      if (sortBy === 'name') return first.product_name.localeCompare(second.product_name);
      return Number(second.id) - Number(first.id);
    });

  return (
    <div className="market-shell">
      <div className="market-note">A little more thoughtful. A lot more useful.</div>
      <header className="market-nav">
        <a className="wordmark" href="#top" aria-label="Common Market home"><span className="wordmark-mark">c.</span><span>common<span className="wordmark-light">market</span></span></a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#shop">Shop all</a>
          <a href="#about">Our point of view</a>
        </nav>
        <div className="account-tools">
          <span className="account-label"><span className="account-dot" />{user.username}<span className="role-tag">{canManageProducts ? 'Admin' : 'Member'}</span></span>
          <button className="text-button" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <main id="top">
        <section className="hero" id="about">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-line" />The good things shop</p>
            <h1>Good finds.<br /><em>Better days.</em></h1>
            <p className="hero-description">Useful things, made to be kept. Browse a considered collection of everyday goods from our shelves to yours.</p>
            <a className="button button-dark" href="#shop">Explore the market <span aria-hidden="true">↘</span></a>
            <div className="hero-footnote"><span className="tiny-spark" aria-hidden="true">✳</span> Thoughtfully picked, ready for real life.</div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=90" alt="A colorful display of fresh market produce" />
            <div className="image-caption"><span>THE EVERYDAY EDIT</span><span>NO. 01 / 2026</span></div>
            <div className="hero-stamp" aria-hidden="true">GOOD<br />THINGS<br /><span>LIVE HERE</span></div>
          </div>
        </section>

        <section className="catalog-section" id="shop">
          <div className="section-heading">
            <div><p className="eyebrow">The collection</p><h2>Find your <em>something.</em></h2></div>
            <p className="section-aside">Everyday essentials with a little extra thought.<br />{products.length} {products.length === 1 ? 'good thing' : 'good things'} on the shelves.</p>
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status"><span>{notice}</span><button className="notice-close" onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}

          <div className="catalog-tools">
            <label className="search-field"><span className="search-glyph" aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the shelves" aria-label="Search products" /></label>
            <div className="filter-tabs" role="group" aria-label="Filter products by stock">
              <button aria-pressed={stockFilter === 'all'} className={stockFilter === 'all' ? 'filter-tab active' : 'filter-tab'} onClick={() => setStockFilter('all')}>Everything</button>
              <button aria-pressed={stockFilter === 'available'} className={stockFilter === 'available' ? 'filter-tab active' : 'filter-tab'} onClick={() => setStockFilter('available')}>In stock</button>
              <button aria-pressed={stockFilter === 'low'} className={stockFilter === 'low' ? 'filter-tab active' : 'filter-tab'} onClick={() => setStockFilter('low')}>Few left</button>
            </div>
            <label className="sort-field"><span>Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort products"><option value="newest">Recently added</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option></select></label>
            {canManageProducts && <button className="button button-accent add-button" onClick={() => setFormFor({})}>＋ Add item</button>}
          </div>

          {loading ? (
            <div className="product-grid" aria-label="Loading products">{[0, 1, 2, 3].map((item) => <div className="product-skeleton" key={item}><div /><span /><span /></div>)}</div>
          ) : visibleProducts.length === 0 ? (
            <div className="empty-market"><span aria-hidden="true">✳</span><h3>{products.length ? 'Nothing on this shelf.' : 'The shelves are taking a breath.'}</h3><p>{products.length ? 'Try another search or stock filter.' : 'There are no products to browse just yet.'}</p></div>
          ) : (
            <div className="product-grid">
              {visibleProducts.map((product, index) => {
                const quantity = Number(product.quantity);
                const stockLabel = quantity <= 0 ? 'Out of stock' : quantity <= 5 ? 'Few left' : 'In stock';
                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      <img className="product-image" src={productImage(product, index)} alt={product.product_name} loading={index > 3 ? 'lazy' : 'eager'} />
                      <span className={`stock-pill ${quantity <= 0 ? 'sold-out' : quantity <= 5 ? 'low-stock' : ''}`}><span />{stockLabel}</span>
                      {canManageProducts && <span className="item-number">ITEM / {String(product.id).padStart(3, '0')}</span>}
                    </div>
                    <div className="product-card-content">
                      <div className="product-name-row"><h3>{product.product_name}</h3><span className="product-price">{peso.format(product.price)}</span></div>
                      <p className="product-description">{product.description || 'A useful little addition to the everyday.'}</p>
                      <div className="product-card-footer">
                        <span className="stock-count">{quantity > 0 ? `${quantity} available` : 'Currently unavailable'}</span>
                        {canManageProducts && <div className="item-actions"><button className="inline-action" onClick={() => setFormFor(product)}>Edit</button><button className="inline-action delete-action" onClick={() => handleDelete(product)}>Remove</button></div>}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
          <div className="catalog-endnote"><span /> THAT'S THE CURRENT COLLECTION <span /></div>
        </section>
      </main>

      <footer className="market-footer"><a className="wordmark footer-wordmark" href="#top"><span className="wordmark-mark">c.</span><span>common<span className="wordmark-light">market</span></span></a><span>Good things, for everyday living.</span><a href="#top">Back to top ↑</a></footer>

      {canManageProducts && formFor && <ProductForm product={formFor.id ? formFor : null} onSaved={handleSaved} onCancel={() => setFormFor(null)} />}
    </div>
  );
}
