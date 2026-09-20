import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store';
import './Shop.css';

export default function Shop() {
  const store = useStore();
  const { products, categories: categoryTree } = store;
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Product');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [openDropdownCat, setOpenDropdownCat] = useState(null);

  const activeCategoryObj = useMemo(() => {
    return categoryTree.find(c => c.name === selectedCategory);
  }, [categoryTree, selectedCategory]);

  const handleSelectCategory = (catName) => {
    setSelectedCategory(catName);
    setSelectedSubcategory('');
  };

  const handleSelectSubcategory = (subItem) => {
    setSelectedSubcategory(prev => prev === subItem ? '' : subItem);
  };

  const handleCategoryClick = (catName, hasSub) => {
    handleSelectCategory(catName);
    if (hasSub) {
      setOpenDropdownCat(prev => prev === catName ? null : catName);
    } else {
      setOpenDropdownCat(null);
    }
  };

  const filtered = useMemo(() => {
    let result = [...products];

    // Filter out products explicitly set to invisible or inactive
    result = result.filter(p => p.visible !== false && p.status !== 'Inactive');

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All Product') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory) {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }

    // Sort
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, search, selectedCategory, selectedSubcategory, sortBy]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('All Product');
    setSelectedSubcategory('');
    setSortBy('featured');
    setOpenDropdownCat(null);
  };

  return (
    <>
      <main className="shop-page animate-fade-in-up container-max">
      
      {/* Shop Page Header */}
      <div className="shop-header">
        <div>
          <span className="shop-badge">Explore Catalog</span>
          <h1 className="shop-title">Dental <span className="title-accent">Marketplace</span></h1>
          <p className="shop-subtitle">
            Premium surgical accessories, dental units, instruments & endodontic systems
          </p>
        </div>

        {/* Global Search & Mobile Filter Toggle */}
        <div className="shop-header-actions">
          <div className="shop-search-main">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              placeholder="Search tools, drills, files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear-btn" onClick={() => setSearch('')}>
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Category Navigation Bar */}
      <nav className="shop-top-nav">
        <div className="shop-top-nav-inner">
          <button 
            className={`top-nav-link ${selectedCategory === 'All Product' ? 'top-nav-link--active' : ''}`}
            onClick={() => handleCategoryClick('All Product', false)}
          >
            ALL PRODUCT
          </button>
          
          {categoryTree.map(cat => {
            const hasSub = cat.items && cat.items.length > 0;
            const isActive = selectedCategory === cat.name;
            const isOpen = openDropdownCat === cat.name;
            return (
              <div key={cat.id} className={`top-nav-item-wrap ${isOpen ? 'top-nav-item-wrap--open' : ''}`}>
                <button
                  className={`top-nav-link ${isActive ? 'top-nav-link--active' : ''}`}
                  onClick={() => handleCategoryClick(cat.name, hasSub)}
                >
                  {cat.name.toUpperCase()}
                  {hasSub && (
                    <span className={`material-symbols-outlined nav-dropdown-icon ${isOpen ? 'nav-dropdown-icon--open' : ''}`}>
                      expand_more
                    </span>
                  )}
                </button>
                
                {/* Dropdown for Subcategories */}
                {hasSub && (
                  <div className={`top-nav-dropdown ${isOpen ? 'top-nav-dropdown--open' : ''}`}>
                    {cat.items.map(subItem => (
                      <button
                        key={subItem}
                        className={`top-nav-dropdown-item ${selectedSubcategory === subItem ? 'top-nav-dropdown-item--active' : ''}`}
                        onClick={() => {
                          handleSelectCategory(cat.name);
                          handleSelectSubcategory(subItem);
                          setOpenDropdownCat(null);
                        }}
                      >
                        {subItem}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Secondary Subcategories Quick Pills Bar */}
      {activeCategoryObj?.items?.length > 0 && (
        <div className="shop-subcat-pills-bar">
          <span className="subcat-bar-label">Filters:</span>
          <button
            className={`subcat-pill ${selectedSubcategory === '' ? 'subcat-pill--active' : ''}`}
            onClick={() => setSelectedSubcategory('')}
          >
            All {activeCategoryObj.name}
          </button>
          {activeCategoryObj.items.map(subItem => (
            <button
              key={subItem}
              className={`subcat-pill ${selectedSubcategory === subItem ? 'subcat-pill--active' : ''}`}
              onClick={() => handleSelectSubcategory(subItem)}
            >
              {subItem}
            </button>
          ))}
        </div>
      )}

      {/* Main Layout Grid (Sidebar + Product Cards) */}
      <div className="shop-layout">
        


        {/* Product Grid Area */}
        <div className="shop-grid-area">
          <div className="shop-grid-meta">
            <span className="results-count">
              Showing <strong>{filtered.length}</strong> {filtered.length === 1 ? 'product' : 'products'}
            </span>
            <div className="sort-dropdown-inline">
              <label>Sort:</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="price-asc">Price Low → High</option>
                <option value="price-desc">Price High → Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="shop-grid">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="shop-empty">
              <div className="empty-icon-wrap">
                <span className="material-symbols-outlined">search_off</span>
              </div>
              <h3>No products found</h3>
              <p>No products match your current category and search filter criteria.</p>
              <button className="btn btn-primary" onClick={clearAllFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
      </main>
    </>
  );
}
