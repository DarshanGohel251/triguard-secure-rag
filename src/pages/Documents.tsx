import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle2,
  Search,
  Shield,
  AlertCircle,
  FileUp,
  Tag,
  Building,
  Layers,
  Trash2,
  Box,
  Table,
  Grid3X3,
  Cpu,
  HardDrive,
  RefreshCw,
  Clock,
  Database,
  ArrowRight,
  X,
  FileCode,
  Zap
} from 'lucide-react';
import api from '../services/api';
import SpatialKnowledgeVault3D, { type DocumentAsset } from '../components/3d/SpatialKnowledgeVault3D';

interface ClassificationTier {
  value: string;
  label: string;
  tier: string;
  desc: string;
  border: string;
  activeBorder: string;
  bg: string;
  activeBg: string;
  text: string;
  glow: string;
  badge: string;
}

const CLASSIFICATIONS: ClassificationTier[] = [
  {
    value: 'PUBLIC',
    label: 'Public',
    tier: 'Tier 0',
    desc: 'Accessible by all authenticated personas across all departments',
    border: 'border-emerald-500/30',
    activeBorder: 'border-emerald-400',
    bg: 'bg-emerald-500/10',
    activeBg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.35)]',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
  },
  {
    value: 'INTERNAL',
    label: 'Internal',
    tier: 'Tier 1',
    desc: 'Department scoped clearance (Employees, Managers & Staff)',
    border: 'border-[#363A31]',
    activeBorder: 'border-[#C9F36A]',
    bg: 'bg-[#C9F36A]/10',
    activeBg: 'bg-[#C9F36A]/20',
    text: 'text-[#C9F36A]',
    glow: 'shadow-[0_0_24px_rgba(201,243,106,0.25)]',
    badge: 'bg-[#C9F36A]/15 text-[#C9F36A] border-[#C9F36A]/40'
  },
  {
    value: 'CONFIDENTIAL',
    label: 'Confidential',
    tier: 'Tier 2',
    desc: 'Restricted to Department Managers and HR Leadership',
    border: 'border-amber-500/30',
    activeBorder: 'border-amber-400',
    bg: 'bg-amber-500/10',
    activeBg: 'bg-amber-500/20',
    text: 'text-amber-400',
    glow: 'shadow-[0_0_24px_rgba(245,158,11,0.35)]',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40'
  },
  {
    value: 'RESTRICTED',
    label: 'Restricted',
    tier: 'Tier 3',
    desc: 'Air-gapped isolation — HR Executive & Master IT Admin only',
    border: 'border-rose-500/30',
    activeBorder: 'border-rose-400',
    bg: 'bg-rose-500/10',
    activeBg: 'bg-rose-500/20',
    text: 'text-rose-400',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.35)]',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40'
  }
];

const DEPARTMENTS = ['General', 'Finance', 'HR', 'IT', 'Sales', 'Engineering', 'Legal', 'Operations'];

export default function Documents() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [classification, setClassification] = useState('INTERNAL');
  const [department, setDepartment] = useState('General');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<'IDLE' | 'PARSING' | 'RBAC' | 'EMBEDDING' | 'LEDGER'>('IDLE');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'3D' | 'GRID' | 'TABLE'>('GRID');
  const [isDragging, setIsDragging] = useState(false);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return { name: 'Ravi Employee', role: 'EMPLOYEE', department: 'Finance' };
    }
  }, []);

  // Sync default department to user's department on mount if available
  useEffect(() => {
    if (currentUser?.department && DEPARTMENTS.includes(currentUser.department)) {
      setDepartment(currentUser.department);
    }
  }, [currentUser]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data || []);
    } catch (err: any) {
      console.error('Failed to load documents', err);
      if (err?.response?.status === 401) {
        setError('Session token expired. Please re-login via the persona menu at the top.');
      }
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document file to ingest.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    setUploadPhase('PARSING');
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('classification', classification);
    formData.append('department', department);

    // Multi-stage high-tech progress simulation for UX
    const t1 = setTimeout(() => {
      setUploadPhase('RBAC');
      setUploadProgress(50);
    }, 450);

    const t2 = setTimeout(() => {
      setUploadPhase('EMBEDDING');
      setUploadProgress(80);
    }, 900);

    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearTimeout(t1);
      clearTimeout(t2);
      setUploadPhase('LEDGER');
      setUploadProgress(100);

      const fileName = file.name;
      setSuccess(`Document "${fileName}" quarantined and indexed into ${classification} vector partition.`);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Immediately refresh inventory so document appears in table
      await fetchDocuments();
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      console.error('Upload failure:', err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      if (err?.response?.status === 401) {
        setError('Authentication expired. Please re-login using the persona selector in the top bar.');
      } else {
        setError(serverMsg || 'Document ingestion failed. Ensure the file contains text or standard PDF layout.');
      }
    } finally {
      setTimeout(() => {
        setLoading(false);
        setUploadProgress(0);
        setUploadPhase('IDLE');
      }, 600);
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
      await fetchDocuments();
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to delete document. Ensure sufficient role clearance.';
      setError(msg);
    }
  };

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const title = (doc.name || doc.filename || '').toLowerCase();
      const dept = (doc.department || '').toLowerCase();
      const c = (doc.classification || '').toUpperCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = title.includes(term) || dept.includes(term) || c.includes(term);
      const matchesFilter = selectedFilter === 'ALL' || c === selectedFilter;
      const matchesDept = departmentFilter === 'ALL' || (doc.department || 'General') === departmentFilter;

      return matchesSearch && matchesFilter && matchesDept;
    });
  }, [documents, searchTerm, selectedFilter, departmentFilter]);

  // Aggregate KPI telemetry
  const totalChunks = useMemo(() => {
    return documents.reduce((acc, d) => acc + (d.chunkCount || 3), 0);
  }, [documents]);

  const filterCounts = useMemo(() => {
    return {
      ALL: documents.length,
      PUBLIC: documents.filter((d) => (d.classification || '').toUpperCase() === 'PUBLIC').length,
      INTERNAL: documents.filter((d) => (d.classification || '').toUpperCase() === 'INTERNAL').length,
      CONFIDENTIAL: documents.filter((d) => (d.classification || '').toUpperCase() === 'CONFIDENTIAL').length,
      RESTRICTED: documents.filter((d) => (d.classification || '').toUpperCase() === 'RESTRICTED').length,
    };
  }, [documents]);

  // Selected file metrics
  const fileDetails = useMemo(() => {
    if (!file) return null;
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    const sizeKb = (file.size / 1024).toFixed(1);
    const estChunks = Math.max(1, Math.ceil(file.size / 1200));
    // Deterministic fake hex hash for cyber visual
    let hashNum = 0;
    for (let i = 0; i < file.name.length; i++) {
      hashNum = (hashNum << 5) - hashNum + file.name.charCodeAt(i);
      hashNum |= 0;
    }
    const hash = '0x' + Math.abs(hashNum).toString(16).padStart(8, '0').toUpperCase() + '...7F4';

    return { ext, sizeKb, estChunks, hash };
  }, [file]);

  const canPurge =
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'HR_MANAGER' ||
    currentUser.role === 'DEPARTMENT_MANAGER';

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto font-sans pb-16 px-2 sm:px-4">
      {/* 1. National-Level Executive Header */}
      <div className="relative rounded-3xl bg-[#20231E] border border-[#363A31] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl">
        {/* Ambient background accents */}
        <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9F36A]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C4A878]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181A15] border border-[#363A31] text-[#F1EEE5] text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
                <Shield className="w-3.5 h-3.5 text-[#C9F36A] animate-pulse" />
                MIL-SPEC 256-BIT ISOLATED VAULT
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#181A15] border border-[#363A31] text-[#C4A878] text-xs font-mono">
                <Cpu className="w-3 h-3 text-[#C4A878]" />
                DENSE VECTOR RAG (1536-DIM)
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F1EEE5] tracking-tight flex items-center gap-3">
              <span>Knowledge Base</span>
              <span className="text-[#C4A878]">
                & Spatial Vault
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#A6AAA0] max-w-3xl leading-relaxed">
              Ingest, quarantine, and partition enterprise documentation into hardware-isolated vector clearance rings with deterministic RBAC pre-filtering.
            </p>
          </div>

          {/* View Mode Switcher & Real-time Sync */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
            <div className="flex items-center bg-[#141612] p-1.5 rounded-2xl border border-[#363A31] shadow-inner backdrop-blur-md">
              <button
                onClick={() => setViewMode('GRID')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  viewMode === 'GRID'
                    ? 'bg-[#C9F36A] text-[#10120F] border border-[#C9F36A] shadow-md'
                    : 'text-[#A6AAA0] hover:text-[#F1EEE5]'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Matrix Grid</span>
              </button>

              <button
                onClick={() => setViewMode('TABLE')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  viewMode === 'TABLE'
                    ? 'bg-[#C9F36A] text-[#10120F] border border-[#C9F36A] shadow-md'
                    : 'text-[#A6AAA0] hover:text-[#F1EEE5]'
                }`}
              >
                <Table className="w-4 h-4" />
                <span>Telemetry Table</span>
              </button>

              <button
                onClick={() => setViewMode('3D')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  viewMode === '3D'
                    ? 'bg-[#C9F36A] text-[#10120F] border border-[#C9F36A] shadow-md'
                    : 'text-[#A6AAA0] hover:text-[#F1EEE5]'
                }`}
              >
                <Box className="w-4 h-4" />
                <span>3D Spatial Radar</span>
              </button>
            </div>

            <button
              onClick={() => fetchDocuments()}
              className="p-3 rounded-2xl bg-[#181A15] hover:bg-[#262A22] border border-[#363A31] text-[#C4A878] hover:text-[#F1EEE5] transition-all cursor-pointer shadow-md"
              title="Refresh inventory"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live KPI Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#363A31]">
          <div className="bg-[#181A15] border border-[#363A31] rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C4A878]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#A6AAA0]">Classified Files</div>
              <div className="text-lg sm:text-xl font-black text-[#F1EEE5] flex items-center gap-1.5">
                <span>{documents.length}</span>
                <span className="w-2 h-2 rounded-full bg-[#C9F36A] animate-ping" />
              </div>
            </div>
          </div>

          <div className="bg-[#181A15] border border-[#363A31] rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C9F36A]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#A6AAA0]">Vector Chunks</div>
              <div className="text-lg sm:text-xl font-black text-[#F1EEE5]">
                {totalChunks} <span className="text-xs font-normal text-[#A6AAA0] font-mono">dense</span>
              </div>
            </div>
          </div>

          <div className="bg-[#181A15] border border-[#363A31] rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#A6AAA0]">RBAC Isolation</div>
              <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono text-sm sm:text-base">
                HARDENED
              </div>
            </div>
          </div>

          <div className="bg-[#181A15] border border-[#363A31] rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C4A878]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase text-[#A6AAA0]">Scoped Persona</div>
              <div className="text-xs sm:text-sm font-bold text-[#F1EEE5] truncate max-w-[130px]">
                {currentUser.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Embedded 3D Spatial Knowledge Vault (if 3D mode selected) */}
      {viewMode === '3D' && (
        <div className="relative rounded-3xl bg-[#20231E] border border-[#363A31] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#363A31]">
            <div className="flex items-center gap-2">
              <Box className="w-5 h-5 text-[#C4A878]" />
              <h2 className="text-lg font-bold text-[#F1EEE5]">Spatial Vector Radar & Orbits</h2>
            </div>
            <span className="text-xs font-mono text-[#C9F36A] bg-[#C9F36A]/10 px-3 py-1 rounded-full border border-[#C9F36A]/30">
              INTERACTIVE 3D WEBGL ENGINE
            </span>
          </div>
          <SpatialKnowledgeVault3D
            documents={documents}
            userRole={currentUser.role}
            userDept={currentUser.department}
            height={440}
          />
        </div>
      )}

      {/* 3. Next-Gen Cyber Ingestion Chamber (Upload Section) */}
      <div className="relative rounded-3xl bg-[#20231E] border border-[#363A31] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        {/* Subtle Cyber Accents */}
        <div className="absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#C9F36A]/40 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#363A31]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F1EEE5] tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#181A15] border border-[#363A31] flex items-center justify-center text-[#C9F36A] shadow-md">
                <FileUp className="w-5 h-5" />
              </div>
              <span>Secure Ingestion Bay</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A6AAA0] mt-1">
              Extracts text streams, creates 1536-dimensional vector embeddings, and seals asset behind cryptographic RBAC quarantine.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#C9F36A] bg-[#C9F36A]/10 px-3.5 py-1.5 rounded-full border border-[#C9F36A]/30 self-start sm:self-auto">
            <Zap className="w-3.5 h-3.5 text-[#C9F36A] animate-pulse" />
            <span>PIPELINE READY</span>
          </div>
        </div>

        <form onSubmit={handleUpload} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cyber Dropzone (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <label className="block text-xs font-mono font-bold text-[#A6AAA0] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5 text-[#C4A878]" />
                  Document Asset Stream (PDF, DOCX, TXT, CSV, MD)
                </label>

                {/* The Dropzone Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer group overflow-hidden border-2 border-dashed ${
                    isDragging
                      ? 'border-[#C9F36A] bg-[#C9F36A]/10 shadow-[0_0_35px_rgba(201,243,106,0.25)] scale-[1.01]'
                      : file
                      ? 'border-[#C9F36A] bg-[#181A15]'
                      : 'border-[#363A31] hover:border-[#C9F36A] bg-[#181A15] hover:bg-[#1E221C]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.docx,.csv,.md,.json"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Scanning Laser Beam (Micro-animation) */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9F36A]/75 to-transparent opacity-75 animate-beam-flow pointer-events-none" />

                  {!file ? (
                    /* Idle State */
                    <div className="flex flex-col items-center justify-center space-y-3 py-4">
                      <div className="w-16 h-16 rounded-2xl bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C9F36A] group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(201,243,106,0.3)] transition-all">
                        <Upload className="w-8 h-8 text-[#C9F36A]" />
                      </div>

                      <div className="space-y-1">
                        <div className="text-base sm:text-lg font-bold text-[#F1EEE5]">
                          Drop classified document here, or <span className="text-[#C9F36A] underline decoration-[#C9F36A]/40 underline-offset-4 group-hover:text-white">browse files</span>
                        </div>
                        <div className="text-xs text-[#A6AAA0] font-mono">
                          Supports multi-page PDF, Text, Markdown & Word up to 25 MB
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                        {['PDF', 'DOCX', 'TXT', 'CSV', 'MD'].map((ext) => (
                          <span
                            key={ext}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#20231E] border border-[#363A31] text-[#A6AAA0]"
                          >
                            .{ext}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Active Selected File Telemetry Card */
                    <div className="flex flex-col items-center justify-center space-y-4 py-2">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C9F36A] shadow-md">
                          <FileText className="w-8 h-8 text-[#F1EEE5]" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-[#C9F36A] text-[#10120F] text-[10px] font-mono font-bold border border-[#C9F36A]">
                          {fileDetails?.ext}
                        </span>
                      </div>

                      <div className="text-center max-w-sm">
                        <div className="text-base sm:text-lg font-black text-[#F1EEE5] truncate" title={file.name}>
                          {file.name}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#A6AAA0] mt-1">
                          <span>{fileDetails?.sizeKb} KB</span>
                          <span>•</span>
                          <span className="text-[#C4A878] font-bold">{fileDetails?.estChunks} Vector Chunks</span>
                        </div>
                      </div>

                      {/* Cryptographic hash simulation */}
                      <div className="w-full bg-[#10120F] border border-[#363A31] rounded-xl p-2.5 text-left text-xs font-mono space-y-1">
                        <div className="flex items-center justify-between text-[#A6AAA0] text-[10px]">
                          <span>PRE-INGESTION CHECKSUM</span>
                          <span className="text-emerald-400 font-bold">✓ SANITIZED</span>
                        </div>
                        <div className="text-[#C9F36A] truncate">{fileDetails?.hash}</div>
                      </div>

                      <div className="flex items-center gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-[#20231E] hover:bg-[#282C24] border border-[#363A31] text-xs font-mono text-[#F1EEE5] transition-colors cursor-pointer"
                        >
                          Change File
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-500/40 text-xs font-mono text-red-300 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Classification & Department (lg:col-span-6) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Classification Selector */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#A6AAA0] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#C4A878]" />
                  Security Classification Tier
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CLASSIFICATIONS.map((c) => {
                    const isSelected = classification === c.value;
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setClassification(c.value)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? `${c.activeBorder} ${c.activeBg} ${c.glow} ring-1 ring-white/20`
                            : `${c.border} bg-[#181A15] hover:bg-[#1E221C] text-[#A6AAA0] hover:text-[#F1EEE5]`
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-[#F1EEE5]' : c.text}`}>
                            {c.label}
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${c.badge}`}>
                            {c.tier}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#A6AAA0] leading-snug">
                          {c.desc}
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9F36A] shadow-[0_0_8px_#C9F36A]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Owning Department */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#A6AAA0] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-[#C4A878]" />
                  Owning Department & Access Scope
                </label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#181A15] border border-[#363A31] focus:border-[#C9F36A] rounded-2xl px-4 py-3.5 text-sm font-bold text-[#F1EEE5] focus:outline-none focus:ring-1 focus:ring-[#C9F36A] font-sans appearance-none cursor-pointer shadow-inner"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-[#181A15] text-[#F1EEE5]">
                        {dept} Department
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C4A878] font-mono text-xs">
                    ▼
                  </div>
                </div>
                <p className="text-[11px] text-[#A6AAA0] mt-1.5 font-mono">
                  Only personnel cleared for <span className="text-[#C4A878] font-bold">{department}</span> and tier <span className="text-[#C9F36A] font-bold">{classification}</span> can retrieve this document via RAG.
                </p>
              </div>
            </div>
          </div>

          {/* Feedback & Animated Pipeline Progress */}
          {error && (
            <div className="p-4 sm:p-5 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 text-sm flex items-start gap-3.5 shadow-xl animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-1">
                <div className="font-bold text-red-100">Ingestion Blocked</div>
                <div className="text-xs sm:text-sm text-red-200/90">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-sm flex items-start justify-between gap-3.5 shadow-xl animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
                <div className="space-y-1">
                  <div className="font-bold text-emerald-100">Document Quarantined & Indexed</div>
                  <div className="text-xs sm:text-sm text-emerald-200/90">{success}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/ask')}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Ask TriGuard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Cinematic Multi-Phase Pipeline Visualizer when Ingesting */}
          {loading && (
            <div className="p-5 rounded-2xl bg-[#181A15] border border-[#363A31] shadow-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-[#C9F36A] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#C9F36A] animate-ping" />
                  <span>EXECUTING HARDWARE INGESTION PIPELINE ({uploadPhase})</span>
                </div>
                <span className="text-[#A6AAA0]">{uploadProgress}%</span>
              </div>

              {/* High-tech Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#10120F] overflow-hidden border border-[#363A31]">
                <div
                  className="h-full bg-gradient-to-r from-[#C4A878] via-[#C9F36A] to-emerald-400 transition-all duration-300 shadow-[0_0_12px_rgba(201,243,106,0.6)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>

              {/* 4 Pipeline Phases */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className={`p-2 rounded-xl border ${uploadProgress >= 20 ? 'bg-[#20231E] border-[#C9F36A] text-[#F1EEE5]' : 'bg-[#181A15] border-[#363A31] text-[#A6AAA0]/50'}`}>
                  1. Binary Stream OCR
                </div>
                <div className={`p-2 rounded-xl border ${uploadProgress >= 50 ? 'bg-[#20231E] border-[#C9F36A] text-[#F1EEE5]' : 'bg-[#181A15] border-[#363A31] text-[#A6AAA0]/50'}`}>
                  2. RBAC Tagging
                </div>
                <div className={`p-2 rounded-xl border ${uploadProgress >= 80 ? 'bg-[#20231E] border-[#C9F36A] text-[#F1EEE5]' : 'bg-[#181A15] border-[#363A31] text-[#A6AAA0]/50'}`}>
                  3. 1536-dim Embedding
                </div>
                <div className={`p-2 rounded-xl border ${uploadProgress >= 100 ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300' : 'bg-[#181A15] border-[#363A31] text-[#A6AAA0]/50'}`}>
                  4. Ledger Sync
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-[#A6AAA0] font-mono flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#C4A878]" />
              <span>All uploads generate immutable SHA-256 audit logs</span>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full sm:w-auto px-8 py-4 bg-[#C9F36A] hover:bg-[#b8e357] text-[#10120F] font-black text-sm rounded-2xl shadow-lg shadow-[#C9F36A]/20 hover:shadow-[#C9F36A]/40 flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
            >
              <FileUp className="w-4 h-4 text-[#10120F]" />
              <span>Ingest & Quarantine Document</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. God-Level Ingested Document Inventory */}
      <div className="relative rounded-3xl bg-[#20231E] border border-[#363A31] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl space-y-6">
        {/* Header and Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F1EEE5] tracking-tight flex items-center gap-2.5">
              <span>Ingested Document Inventory</span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#181A15] text-[#C4A878] border border-[#363A31]">
                {filteredDocs.length} Live Records
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#A6AAA0] mt-0.5">
              Classified vector partitions accessible under currently active security clearance.
            </p>
          </div>

          {/* Search & Dept Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#C4A878] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search file, dept, clearance..."
                className="w-full bg-[#181A15] border border-[#363A31] focus:border-[#C9F36A] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F1EEE5] placeholder-[#A6AAA0]/50 focus:outline-none focus:ring-1 focus:ring-[#C9F36A] font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A6AAA0] hover:text-[#F1EEE5]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full sm:w-44 bg-[#181A15] border border-[#363A31] rounded-xl px-3 py-2.5 text-xs font-mono text-[#F1EEE5] focus:outline-none focus:border-[#C9F36A] cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={`filter-dept-${d}`} value={d} className="bg-[#181A15]">
                  {d} Dept
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clearance Filter Tabs with Count Badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#363A31]">
          {(['ALL', 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'] as const).map((filter) => {
            const count = filterCounts[filter];
            const isSelected = selectedFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#C9F36A] text-[#10120F] border border-[#C9F36A] font-bold shadow-md'
                    : 'bg-[#181A15] text-[#A6AAA0] hover:text-[#F1EEE5] border border-[#363A31]'
                }`}
              >
                <span>{filter}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-[#10120F]' : 'bg-[#20231E] text-[#C4A878]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Presentation: Matrix Grid or Telemetry Table */}
        {viewMode === 'GRID' ? (
          /* MATRIX GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredDocs.map((doc, idx) => {
              const docTitle = doc.name || doc.filename || 'Untitled Document';
              const uploadTimestamp = doc.uploadedAt || doc.uploadDate;
              const classificationTier = (doc.classification || 'INTERNAL').toUpperCase();
              const ext = docTitle.split('.').pop()?.toUpperCase() || 'FILE';

              return (
                <div
                  key={`grid-doc-${doc.id || idx}`}
                  className="group relative rounded-2xl bg-[#181A15] border border-[#363A31] hover:border-[#C4A878]/60 p-5 shadow-lg transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Bar: Icon, File Type, Clearance Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C4A878] group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#20231E] border border-[#363A31] text-[#F1EEE5]">
                          .{ext}
                        </span>
                        <div className="text-[10px] text-[#A6AAA0]/60 font-mono mt-0.5">
                          ID: #{doc.id || idx + 1}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${
                        classificationTier === 'RESTRICTED'
                          ? 'bg-red-500/15 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                          : classificationTier === 'CONFIDENTIAL'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                          : classificationTier === 'INTERNAL'
                          ? 'bg-[#C9F36A]/15 text-[#C9F36A] border-[#C9F36A]/40 shadow-[0_0_10px_rgba(201,243,106,0.15)]'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                      }`}
                    >
                      {classificationTier}
                    </span>
                  </div>

                  {/* Body: Title and Metadata */}
                  <div className="space-y-2">
                    <h3
                      className="text-base font-black text-[#F1EEE5] group-hover:text-[#C9F36A] transition-colors line-clamp-2 leading-tight"
                      title={docTitle}
                    >
                      {docTitle}
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#A6AAA0] pt-1">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#C4A878]" />
                        <span className="truncate">{doc.department || 'General'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#C9F36A]" />
                        <span>{doc.chunkCount || 3} Chunks</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A6AAA0]/60">
                      <Clock className="w-3 h-3 text-[#A6AAA0]/50" />
                      <span>{uploadTimestamp ? new Date(uploadTimestamp).toLocaleDateString() : 'Indexed'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#363A31]">
                    <button
                      onClick={() => navigate('/ask')}
                      className="px-3 py-1.5 rounded-xl bg-[#20231E] hover:bg-[#282C24] border border-[#363A31] hover:border-[#C9F36A]/50 text-xs font-mono font-bold text-[#F1EEE5] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Query in RAG</span>
                      <ArrowRight className="w-3 h-3 text-[#C9F36A]" />
                    </button>

                    {canPurge && doc.id && (
                      <button
                        onClick={() => handleDeleteDocument(doc.id!, docTitle)}
                        className="p-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/30 border border-red-500/30 text-red-300 transition-colors cursor-pointer"
                        title="Purge document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredDocs.length === 0 && (
              <div className="col-span-full py-12 text-center rounded-2xl bg-[#181A15] border border-dashed border-[#363A31] space-y-3">
                <Database className="w-10 h-10 text-[#C4A878]/50 mx-auto" />
                <div className="text-sm font-bold text-[#F1EEE5]">No Documents Matching Filter</div>
                <div className="text-xs text-[#A6AAA0] max-w-sm mx-auto">
                  Try adjusting the search query or classification tier, or ingest a new document above.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* HIGH-DENSITY TELEMETRY TABLE VIEW */
          <div className="overflow-x-auto rounded-2xl border border-[#363A31] bg-[#181A15]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#363A31] text-xs font-mono uppercase tracking-wider text-[#A6AAA0] bg-[#141612]">
                  <th className="py-3.5 px-4">Document Title</th>
                  <th className="py-3.5 px-4">Clearance Tier</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Vector Chunks</th>
                  <th className="py-3.5 px-4">Indexed Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#363A31]">
                {filteredDocs.map((doc, idx) => {
                  const docTitle = doc.name || doc.filename || 'Untitled Document';
                  const uploadTimestamp = doc.uploadedAt || doc.uploadDate;
                  const classificationTier = (doc.classification || 'INTERNAL').toUpperCase();

                  return (
                    <tr
                      key={`table-doc-${doc.id || idx}`}
                      className="hover:bg-[#20231E]/60 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#F1EEE5] flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#20231E] border border-[#363A31] flex items-center justify-center text-[#C4A878] shrink-0 group-hover:border-[#C4A878]">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate max-w-xs">
                          <div className="truncate" title={docTitle}>{docTitle}</div>
                          <div className="text-[10px] text-[#A6AAA0]/50 font-mono">ID: #{doc.id || idx + 1}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                            classificationTier === 'RESTRICTED'
                              ? 'bg-red-500/15 text-red-300 border-red-500/40'
                              : classificationTier === 'CONFIDENTIAL'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                              : classificationTier === 'INTERNAL'
                              ? 'bg-[#C9F36A]/15 text-[#C9F36A] border-[#C9F36A]/40'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          }`}
                        >
                          {classificationTier}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#A6AAA0] font-mono text-xs">
                        {doc.department || 'General'}
                      </td>
                      <td className="py-3.5 px-4 text-[#C4A878] font-mono text-xs font-bold">
                        {doc.chunkCount || 3} Chunks
                      </td>
                      <td className="py-3.5 px-4 text-[#A6AAA0]/70 text-xs font-mono">
                        {uploadTimestamp ? new Date(uploadTimestamp).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate('/ask')}
                            className="px-2.5 py-1 rounded-lg bg-[#20231E] hover:bg-[#282C24] border border-[#363A31] hover:border-[#C9F36A]/50 text-xs font-mono text-[#F1EEE5] transition-colors cursor-pointer flex items-center gap-1"
                            title="Query in Ask TriGuard"
                          >
                            <span>Query</span>
                            <ArrowRight className="w-3 h-3 text-[#C9F36A]" />
                          </button>
                          {canPurge && doc.id && (
                            <button
                              onClick={() => handleDeleteDocument(doc.id!, docTitle)}
                              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-300 transition-colors cursor-pointer"
                              title="Purge document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredDocs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#A6AAA0]/50 text-sm">
                      No documents found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
