import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [classification, setClassification] = useState('INTERNAL');
  const [department, setDepartment] = useState('General');
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('classification', classification);
    formData.append('department', department);

    setLoading(true);
    try {
      await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      fetchDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-widest">KNOWLEDGE BASE</h1>

      <div className="bg-graphite_light border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Upload className="w-5 h-5 mr-2 text-cyan_ai" /> Ingest Document
        </h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-white hover:file:bg-gray-700 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Classification</label>
            <select
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="block w-full bg-[#111] border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:border-cyan_ai"
            >
              <option value="PUBLIC">Public</option>
              <option value="INTERNAL">Internal</option>
              <option value="CONFIDENTIAL">Confidential</option>
              <option value="RESTRICTED">Restricted</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-cyan_ai hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Upload & Embed'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-graphite_light border border-gray-800 rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-[#111]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Document Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Classification</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Department</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-graphite_light">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" />
                  {doc.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    doc.classification === 'RESTRICTED' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                    doc.classification === 'CONFIDENTIAL' ? 'bg-amber-900/30 text-amber-400 border border-amber-800' :
                    'bg-emerald-900/30 text-emerald-400 border border-emerald-800'
                  }`}>
                    {doc.classification}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {doc.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald_auth mr-2" />
                  {doc.status}
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No documents found. Upload a document to build the knowledge base.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
