import { useState, useEffect, useMemo } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  Search,
  Filter,
  Shield,
  Loader2,
  AlertCircle,
  FileUp,
  Tag
} from 'lucide-react';
import api from '../services/api';

const CLASSIFICATIONS = [
  { value: 'PUBLIC', label: 'Public', desc: 'Accessible by all authenticated users', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { value: 'INTERNAL', label: 'Internal', desc: 'Accessible by departmental employees & general', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { value: 'CONFIDENTIAL', label: 'Confidential', desc: 'Accessible by Department Managers & HR', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { value: 'RESTRICTED', label: 'Restricted', desc: 'Accessible only by HR Managers & Admins', color: 'bg-red-500/10 text-red-400 border-red-500/30' }
];

const DEPARTMENTS = ['General', 'Finance', 'HR', 'IT', 'Sales', 'Engineering'];

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [classification, setClassification] = useState('INTERNAL');
  const [department, setDepartment] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to ingest.');
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
      setSuccess(`Document '${file.name}' ingested and vector indexed successfully!`);
      setFile(null);
      // Reset input element if needed
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      fetchDocuments();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to ingest document. Ensure file format is valid.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'ALL' || doc.classification === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [documents, searchTerm, selectedFilter]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            Knowledge Base & Document Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ingest and index multi-modal knowledge with deterministic classification levels.
          </p>
        </div>
      </div>

      {/* Ingestion Dropzone & Form */}
      <div className="bg-[#070d1d] border border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <FileUp className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Ingest & Embed Knowledge
          </h2>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* File Input */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select File (.TXT, .PDF)
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".txt,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-300 hover:file:bg-cyan-500/20 file:cursor-pointer cursor-pointer border border-white/10 rounded-xl bg-slate-900/60 p-1"
                required
              />
            </div>

            {/* Classification */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyan-400" />
                Classification Level
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {CLASSIFICATIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label} ({c.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3 h-3 text-cyan-400" />
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Ingest Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Indexing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload & Embed</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </form>
      </div>

      {/* Documents Table & Filter Section */}
      <div className="bg-[#070d1d] border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or department..."
              className="w-full bg-slate-950/60 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Classification Filter Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              Filter:
            </span>
            {['ALL', 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  selectedFilter === lvl
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white border border-transparent hover:bg-white/5'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <th className="py-3 px-5">Document Title</th>
                <th className="py-3 px-5">Classification Level</th>
                <th className="py-3 px-5">Department Scope</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {filteredDocuments.map((doc) => {
                const classConfig = CLASSIFICATIONS.find((c) => c.value === doc.classification) || CLASSIFICATIONS[1];
                return (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-white flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span>{doc.name}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${classConfig.color}`}>
                        {doc.classification}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-400 font-medium">
                      {doc.department}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {doc.status || 'READY'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredDocuments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs text-slate-500">
                    No documents matched the current search or clearance filter.
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
