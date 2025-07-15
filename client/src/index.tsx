import 'bulmaswatch/superhero/bulmaswatch.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './state';
import CellList from './components/cell-list';
import { BrowserRouter, Routes, Route, useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './index.css';

const HomePage: React.FC = () => {
  const [lists, setLists] = useState<{ name: string; description?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [originalListName, setOriginalListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const navigate = useNavigate();

  const fetchLists = () => {
    setLoading(true);
    setError(null);
    axios.get('/cells/list')
      .then(res => {
        setLists(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setShowModal(true);
    setNewListName('');
    setNewListDesc('');
    setOriginalListName('');
    setCreateError(null);
    setCreateSuccess(false);
    setCreating(false);
  };

  const openEditModal = (name: string, description?: string) => {
    setModalMode('edit');
    setShowModal(true);
    setNewListName(name);
    setNewListDesc(description || '');
    setOriginalListName(name);
    setCreateError(null);
    setCreateSuccess(false);
    setCreating(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(false);
    try {
      if (modalMode === 'create') {
        await axios.post('/cells/list', {
          name: newListName.trim(),
          description: newListDesc.trim(),
        });
        setCreateSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setNewListName('');
          setNewListDesc('');
          setCreating(false);
          setCreateSuccess(false);
          fetchLists();
          navigate(`/${encodeURIComponent(newListName.trim())}`);
        }, 800);
      } else {
        await axios.patch(`/cells/list/${encodeURIComponent(originalListName)}`, {
          name: newListName.trim(),
          description: newListDesc.trim(),
        });
        setCreateSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setNewListName('');
          setNewListDesc('');
          setCreating(false);
          setCreateSuccess(false);
          fetchLists();
        }, 800);
      }
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || err.message || 'Failed to save list');
      setCreating(false);
    }
  };

  return (
    <div className="cell-list-home-container">
      <h1 className="cell-list-home-title">📋 Cell Lists</h1>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
        <button className="cell-list-home-create-btn" onClick={openCreateModal}>
          + Create New Cell List
        </button>
      </div>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center', fontWeight: 500 }}>
          Error: {error}
          <button style={{ marginLeft: 8, background: '#eee', border: 'none', borderRadius: 4, padding: '0.2rem 0.8rem', cursor: 'pointer' }} onClick={fetchLists}>Retry</button>
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: 'center', margin: '2rem', fontSize: 20, color: '#888' }}>Loading...</div>
      ) : lists.length === 0 ? (
        <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#888', fontSize: 18 }}>No cell lists found.</div>
      ) : (
        <ul className="cell-list-home-list">
          {lists.map(({ name, description }) => (
            <li className="cell-list-home-list-item" key={name}>
              <div>
                <Link className="cell-list-home-list-link" to={`/${name}`}>{name}</Link>
                <div className="cell-list-home-list-desc">{description || <span style={{ color: '#bbb' }}>No description</span>}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link className="cell-list-home-list-open" to={`/${name}`}>Open</Link>
                <button className="cell-list-home-edit-btn" onClick={() => openEditModal(name, description)}>
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {/* Modal for creating/editing cell list */}
      {showModal && (
        <div className="cell-list-home-modal-overlay">
          <div className="cell-list-home-modal">
            <button
              className="cell-list-home-modal-close"
              onClick={() => { setShowModal(false); setNewListName(''); setNewListDesc(''); setCreating(false); setCreateError(null); setCreateSuccess(false); }}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="cell-list-home-modal-title">{modalMode === 'create' ? 'Create New Cell List' : 'Edit Cell List'}</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: 18 }}>
                <label className="cell-list-home-modal-label" htmlFor="new-list-name">Name</label>
                <input
                  className="cell-list-home-modal-input"
                  id="new-list-name"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                  disabled={creating}
                  autoFocus
                  required
                />
              </div>
              <div style={{ marginBottom: 26 }}>
                <label className="cell-list-home-modal-label" htmlFor="new-list-desc">Description</label>
                <textarea
                  className="cell-list-home-modal-textarea"
                  id="new-list-desc"
                  value={newListDesc}
                  onChange={e => setNewListDesc(e.target.value)}
                  placeholder="Enter description (optional)"
                  disabled={creating}
                />
              </div>
              {createError && <div className="cell-list-home-modal-error">{createError}</div>}
              {createSuccess && <div className="cell-list-home-modal-success">{modalMode === 'create' ? 'Created! Redirecting...' : 'Saved!'}</div>}
              <div className="cell-list-home-modal-actions">
                <button
                  className="cell-list-home-modal-submit"
                  type="submit"
                  disabled={creating || !newListName.trim()}
                >
                  {creating ? (modalMode === 'create' ? 'Creating...' : 'Saving...') : (modalMode === 'create' ? 'Create' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CellListRoute: React.FC = () => {
  const { cellListName } = useParams<{ cellListName?: string }>();
  return <CellList cellListName={cellListName || 'default'} />;
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:cellListName" element={<CellListRoute />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

const el = document.getElementById('root');
const root = ReactDOM.createRoot(el!);

root.render(<App />);
