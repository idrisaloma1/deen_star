import './category-rail.css';

export default function CategoryRail({ categories, active, onSelect }) {
  return (
    <div className="category-rail">
      <button
        className={`category-pill ${!active ? 'is-active' : ''}`}
        onClick={() => onSelect('')}
      >
        All stalls
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`category-pill ${active === cat.slug ? 'is-active' : ''}`}
          onClick={() => onSelect(cat.slug)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
