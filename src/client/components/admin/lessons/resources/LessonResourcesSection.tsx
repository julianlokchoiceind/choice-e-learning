'use client';

import { FC, useState, useEffect } from 'react';
import { 
  DocumentIcon, 
  LinkIcon, 
  CodeBracketIcon,
  PlusIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { LessonResources, LessonResourcesSectionProps, LessonResourceFile, LessonResourceLink, LessonResourceCode } from '@/shared/types/lessons';
import { useLessonMaterialsQuery } from '@/client/hooks/lessons';

const LessonResourcesSection: FC<LessonResourcesSectionProps> = ({ 
  lessonId, 
  courseId, 
  initialResources,
  allowDownload = true,
  onResourcesChange 
}) => {
  const [activeTab, setActiveTab] = useState<'files' | 'links' | 'code'>('files');
  const [resources, setResources] = useState<LessonResources>({
    files: [],
    links: [],
    code: []
  });

  // Lesson materials query hooks
  const { useCreateLessonMaterial } = useLessonMaterialsQuery(lessonId || '');
  const createLessonMaterial = useCreateLessonMaterial();

  // Initialize resources from props (only once)
  useEffect(() => {
    if (initialResources && Object.keys(initialResources).length > 0) {
      setResources(initialResources);
    }
  }, []); // Only run on mount

  // Notify parent of changes (debounced)
  useEffect(() => {
    if (onResourcesChange && resources !== initialResources) {
      const timeoutId = setTimeout(() => {
        onResourcesChange(resources);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [resources]); // Remove onResourcesChange from deps to prevent infinite re-renders

  const handleAddLink = () => {
    const newLink: LessonResourceLink = {
      id: `link_${Date.now()}`,
      title: '',
      url: '',
      description: '',
      order: resources.links.length + 1
    };
    setResources(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const handleUpdateLink = (id: string, updates: Partial<LessonResourceLink>) => {
    setResources(prev => ({
      ...prev,
      links: prev.links.map(link => 
        link.id === id ? { ...link, ...updates } : link
      )
    }));
  };

  const handleDeleteLink = (id: string) => {
    setResources(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  const handleAddCode = () => {
    const newCode: LessonResourceCode = {
      id: `code_${Date.now()}`,
      title: '',
      description: '',
      language: 'javascript',
      content: '',
      isStarterCode: true,
      order: resources.code.length + 1
    };
    setResources(prev => ({
      ...prev,
      code: [...prev.code, newCode]
    }));
  };

  const handleUpdateCode = (id: string, updates: Partial<LessonResourceCode>) => {
    setResources(prev => ({
      ...prev,
      code: prev.code.map(code => 
        code.id === id ? { ...code, ...updates } : code
      )
    }));
  };

  const handleDeleteCode = (id: string) => {
    setResources(prev => ({
      ...prev,
      code: prev.code.filter(code => code.id !== id)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !lessonId) return;

    try {
      // First upload the file to get the URL
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'lesson-material');
      formData.append('lessonId', lessonId);

      const uploadResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const uploadResult = await uploadResponse.json();
      
      // Create filename with choice prefix
      const choiceFileName = `choice-${file.name}`;
      
      // Then create the lesson material record
      await createLessonMaterial.mutateAsync({
        title: choiceFileName,
        fileName: choiceFileName,
        fileSize: file.size,
        fileType: file.name.split('.').pop() || 'unknown',
        mimeType: file.type,
        description: 'Lesson Material',
        url: uploadResult.data.url
      });

      // Add to local resources for immediate UI update
      const newFile: LessonResourceFile = {
        id: `file_${Date.now()}`,
        name: choiceFileName,
        size: file.size,
        type: file.type,
        url: uploadResult.data.url,
        order: resources.files.length + 1
      };

      setResources(prev => ({
        ...prev,
        files: [...prev.files, newFile]
      }));

      // Reset input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const renderFilesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Lesson Files</h4>
        <div>
          <input
            type="file"
            id="lesson-file-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
            onChange={handleFileUpload}
          />
          <label
            htmlFor="lesson-file-upload"
            className="btn-admin-primary cursor-pointer inline-flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Upload File
          </label>
        </div>
      </div>

      {!allowDownload && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-orange-900">Download Disabled</h5>
              <p className="text-sm text-orange-800 mt-1">
                Course settings have disabled file downloads. Students can see files but cannot download them.
              </p>
            </div>
          </div>
        </div>
      )}

      {resources.files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DocumentIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No files uploaded yet</p>
          <p className="text-sm">Upload PDF, ZIP, DOC, XLS, PPT files for students</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <DocumentIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(1)} MB • {file.type}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {allowDownload ? (
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Download"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                    Download disabled
                  </span>
                )}
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderLinksTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Reference Links</h4>
        <button
          type="button"
          onClick={handleAddLink}
          className="btn-admin-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Link
        </button>
      </div>

      {resources.links.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <LinkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No reference links added yet</p>
          <p className="text-sm">Add documentation links, tutorials, or external resources</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.links.map((link) => (
            <div key={link.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                    placeholder="Link title"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(link.id)}
                    className="ml-3 p-2 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                />
                <textarea
                  value={link.description || ''}
                  onChange={(e) => handleUpdateLink(link.id, { description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCodeTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Code Examples</h4>
        <button
          type="button"
          onClick={handleAddCode}
          className="btn-admin-primary"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Code
        </button>
      </div>

      {resources.code.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CodeBracketIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No code examples added yet</p>
          <p className="text-sm">Add starter code templates or completed examples</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resources.code.map((code) => (
            <div key={code.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={code.title}
                    onChange={(e) => handleUpdateCode(code.id, { title: e.target.value })}
                    placeholder="Code title"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCode(code.id)}
                    className="ml-3 p-2 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={code.language}
                    onChange={(e) => handleUpdateCode(code.id, { language: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                  </select>
                  
                  <select
                    value={code.isStarterCode ? 'starter' : 'completed'}
                    onChange={(e) => handleUpdateCode(code.id, { isStarterCode: e.target.value === 'starter' })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                  >
                    <option value="starter">Starter Template</option>
                    <option value="completed">Completed Example</option>
                  </select>
                </div>

                <textarea
                  value={code.description || ''}
                  onChange={(e) => handleUpdateCode(code.id, { description: e.target.value })}
                  placeholder="Code description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500"
                />

                <textarea
                  value={code.content}
                  onChange={(e) => handleUpdateCode(code.id, { content: e.target.value })}
                  placeholder="Paste your code here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-0 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lesson Resources</h3>
        <p className="text-gray-600">
          Add downloadable materials, code files, or reference links for this specific lesson
        </p>
      </div>

      {/* Files Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">Lesson Files</h4>
                <p className="text-sm text-gray-500">Downloadable materials and documents</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                {resources.files.length} files
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {renderFilesTab()}
        </div>
      </div>

      {/* Links Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">Reference Links</h4>
                <p className="text-sm text-gray-500">External resources and documentation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <PlusIcon className="w-3 h-3 mr-1" />
                {resources.links.length} links
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {renderLinksTab()}
        </div>
      </div>

      {/* Code Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CodeBracketIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">Code Examples</h4>
                <p className="text-sm text-gray-500">Starter templates and completed examples</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <CodeBracketIcon className="w-3 h-3 mr-1" />
                {resources.code.length} examples
              </span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {renderCodeTab()}
        </div>
      </div>
    </div>
  );
};

export default LessonResourcesSection;