import { useState, useEffect, useMemo } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Search,
  Shield,
  Loader2,
  AlertCircle,
  FileUp,
  Tag,
  Building,
  Layers,
  Trash2,
  Box,
  Table
} from 'lucide-react';
import api from '../services/api';
import SpatialKnowledgeVault3D, { type DocumentAsset } from '../components/3d/SpatialKnowledgeVault3D';

const CLASSIFICATIONS = [
  { value: 'PUBLIC', label: 'Public', desc: 'Accessible by all authenticated personas', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'INTERNAL', label: 'Internal', desc: 'Accessible by department employees', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'CONFIDENTIAL', label: 'Confidential', desc: 'Managers & HR only', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { value: 'RESTRICTED', label: 'Restricted', desc: 'HR Executive & IT Admin only', color: 'bg-red-500/10 text-red-400 border-red-500/30' }
];

const DEPARTMENTS = ['General', 'Finance', 'HR', 'IT', 'Sales', 'Engineering'];

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [classification, setClassification] = useState('INTERNAL');
  const [department, setDepartment] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'3D' | 'TABLE'>('3D');

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return { name: 'User', role: 'EMPLOYEE', department: 'Finance' };
    }
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document file to ingest.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('classification', classification);
    formData.append('department', department);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(`Document "${file.name}" ingested, chunked, and vector-indexed successfully.`);
      setFile(null);
      fetchDocuments();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ingestion failed. Ensure file is a supported PDF/text format.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: number | string, docName: string) => {
    if (!window.confirm(`Are you sure you want to securely purge "${docName}" and all associated vector embeddings?`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await api.delete(`/documents/${id}`);
      setSuccess(`Document "${docName}" and associated chunks purged from vector store.`);
      fetchDocuments();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete document. Ensure sufficient role clearance.');
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const title = (doc.name || doc.filename || '').toLowerCase();
      const dept = (doc.department || '').toLowerCase();
      const c = (doc.classification || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = title.includes(term) || dept.includes(term) || c.includes(term);
      const matchesFilter = selectedFilter === 'ALL' || doc.classification === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchTerm, selectedFilter]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Classified Multi-Modal Knowledge Store
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Knowledge Base & Spatial Vault
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-2xl">
            Ingest, quarantine, and partition enterprise knowledge assets into hardware-isolated vector clearance rings.
          </p>
        </div>

        {/* View Switcher & Counter */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === '3D'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Vault</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-slate-900/80 px-3.5 py-2 rounded-xl border border-white/10">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">{documents.length} Files</span>
          </div>
        </div>
      </div>

      {/* Experience B: Spatial Knowledge Vault 3D */}
      {viewMode === '3D' && (
        <SpatialKnowledgeVault3D
          documents={documents}
          userRole={currentUser.role}
          userDept={currentUser.department}
          height={400}
        />
      )}

      {/* Ingestion Pipeline File Uploader */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#060D1E]/95 border border-cyan-500/30 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <FileUp className="w-6 h-6 text-cyan-400" />
              Secure Ingestion Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Extracts text, calculates semantic embeddings, and tags deterministic clearance metadata.
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            AUTO-CHUNKING ACTIVE
          </span>
        </div>

        <form onSubmit={handleUpload} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* File Dropzone (md:col-span-6) */}
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Document File (PDF, TXT, DOCX)
              </label>
              <div className="relative border-2 border-dashed border-white/15 hover:border-cyan-400/50 rounded-2xl p-6 text-center bg-[#091326]/60 transition-colors cursor-pointer group">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shadow-md">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-white">
                    {file ? file.name : 'Choose a file or drag & drop here'}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Maximum file size 25MB'}
                  </div>
                </div>
              </div>
            </div>

            {/* Classification & Department (md:col-span-6) */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-cyan-400" />
                  Security Classification Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CLASSIFICATIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setClassification(c.value)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        classification === c.value
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-md ring-1 ring-cyan-400/30'
                          : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="text-xs font-bold">{c.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  Owning Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-[#091326] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 font-sans"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept} Department
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !file}
              className="py-3.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing & Indexing Embeddings...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  <span>Ingest & Quarantine Document</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Filtered Document Inventory Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#060D1E]/95 border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ingested Document Inventory
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time records currently indexed in the scoped vector database
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search filename or dept..."
              className="w-full bg-[#091326] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-wider text-slate-400 bg-slate-900/40">
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Clearance Tier</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Vector Chunks</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.map((doc, idx) => {
                const canDelete =
                  currentUser.role === 'ADMIN' ||
                  currentUser.role === 'HR_MANAGER' ||
                  currentUser.role === 'DEPARTMENT_MANAGER';
                const docTitle = doc.name || doc.filename || 'Untitled Document';
                const uploadTimestamp = doc.uploadedAt || doc.uploadDate;

                return (
                  <tr key={`doc-row-${doc.id || idx}`} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="truncate max-w-xs" title={docTitle}>{docTitle}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                          doc.classification === 'RESTRICTED'
                            ? 'bg-red-500/10 text-red-300 border-red-500/30'
                            : doc.classification === 'CONFIDENTIAL'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : doc.classification === 'INTERNAL'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {doc.classification}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                      {doc.department || 'General'}
                    </td>
                    <td className="py-3.5 px-4 text-cyan-300 font-mono text-xs">
                      {doc.chunkCount || 3} Chunks
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                      {uploadTimestamp ? new Date(uploadTimestamp).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {canDelete && doc.id && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id!, docTitle)}
                          className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer inline-flex items-center gap-1 text-xs"
                          title="Purge document & embeddings"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline font-mono">Purge</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
