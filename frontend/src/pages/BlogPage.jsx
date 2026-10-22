import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import './BlogPage.css'

const categories = ['All', 'Buying Guide', 'Legal Tips', 'Investment', 'Foreign Buyers', 'Market News']
const colorMap = {
  'Legal Tips': ['#EEEDFE', '#3C3489'],
  'Foreign Buyers': ['#E6F1FB', '#185FA5'],
  Investment: ['#FAEEDA', '#854F0B'],
  'Buying Guide': ['#E1F5EE', '#0F6E56'],
  'Market News': ['#FBEAF0', '#993556'],
}

export default function BlogPage({ onNavigate }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    try {
      const res = await axios.get('/api/blog/posts')
      setPosts(res.data.data || [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return posts.filter(post => {
      const matchCat = activeCategory === 'All' || post.category === activeCategory
      const text = `${post.title} ${post.excerpt || ''} ${post.content || ''}`.toLowerCase()
      const matchSearch = !search || text.includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [posts, activeCategory, search])

  const featured = filtered[0]
  const rest = featured ? filtered.slice(1) : []

  return (
    <div className="page">
      <div className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <button onClick={() => onNavigate('home')}>Home</button>
            <span>/</span>
            <span>Blog</span>
          </div>
          <h1 className="page-hero__title">Property Insights &amp; Legal Guides</h1>
          <p className="page-hero__sub">Approved articles from KNW PRO REALTOR lawyers and property experts.</p>
          <div className="blog-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container blog-body">
        <div className="category-bar">
          {categories.map(category => (
            <button key={category} className={`cat-btn${activeCategory === category ? ' active' : ''}`} onClick={() => setActiveCategory(category)}>
              {category}
            </button>
          ))}
        </div>

        {loading && <div className="no-results"><p>Loading approved blog posts...</p></div>}

        {!loading && filtered.length === 0 && (
          <div className="no-results">
            <span style={{ fontSize: '40px' }}>No posts</span>
            <p>No approved blog posts found.</p>
          </div>
        )}

        {featured && (
          <div className="featured-post">
            <div className="featured-post__thumb" style={{ background: getColors(featured.category)[0] }}>
              <span className="featured-post__emoji">Legal</span>
              <span className="featured-post__label">Featured</span>
            </div>
            <div className="featured-post__body">
              <span className="post-category" style={{ background: getColors(featured.category)[0], color: getColors(featured.category)[1] }}>
                {featured.category}
              </span>
              <h2 className="featured-post__title">{featured.title}</h2>
              <p className="featured-post__excerpt">{featured.excerpt || featured.content}</p>
              <div className="post-meta">
                <span className="post-author">{featured.author?.name || 'KNW PRO REALTOR'}</span>
                <span className="post-dot">·</span>
                <span className="post-role">{featured.author?.role || 'Legal team'}</span>
                <span className="post-dot">·</span>
                <span>{featured.published_at ? new Date(featured.published_at).toLocaleDateString() : 'Published'}</span>
              </div>
              <div className="post-tags">
                {(featured.tags || []).map(tag => <span key={tag} className="post-tag">{tag}</span>)}
              </div>
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="posts-grid">
            {rest.map(post => (
              <article key={post.id} className="post-card">
                <div className="post-card__thumb" style={{ background: getColors(post.category)[0] }}>
                  <span className="post-card__emoji">Guide</span>
                </div>
                <div className="post-card__body">
                  <span className="post-category" style={{ background: getColors(post.category)[0], color: getColors(post.category)[1] }}>{post.category}</span>
                  <h3 className="post-card__title">{post.title}</h3>
                  <p className="post-card__excerpt">{post.excerpt || post.content}</p>
                  <div className="post-tags">
                    {(post.tags || []).map(tag => <span key={tag} className="post-tag">{tag}</span>)}
                  </div>
                  <div className="post-meta post-meta--sm">
                    <div>
                      <p className="post-author">{post.author?.name || 'KNW PRO REALTOR'}</p>
                      <p style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Published'}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getColors(category) {
  return colorMap[category] || ['#E1F5EE', '#0F6E56']
}
