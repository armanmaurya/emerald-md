import { useState } from 'react';

interface SettingsViewProps {
  category?: string;
}

const SettingsView = ({ category }: SettingsViewProps) => {
  const [editorPreferences, setEditorPreferences] = useState({
    fontSize: 14,
    lineHeight: 1.5,
    lineNumbers: true,
    wordWrap: true,
    tabSize: 2,
  });

  const handleEditorPrefChange = (key: string, value: any) => {
    setEditorPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderEditorPreferences = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
          Editor Preferences
        </h2>
        
        {/* Font Size */}
        <div className="flex items-center justify-between p-4 bg-surface-elevated dark:bg-surface-elevated-dark rounded-lg">
          <div>
            <label className="block text-text-primary dark:text-text-primary-dark font-medium mb-1">
              Font Size
            </label>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
              Adjust editor font size
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="10"
              max="24"
              value={editorPreferences.fontSize}
              onChange={(e) => handleEditorPrefChange('fontSize', parseInt(e.target.value))}
              className="w-16 px-2 py-1 bg-primary-bg dark:bg-primary-bg-dark border border-border dark:border-border-dark rounded text-text-primary dark:text-text-primary-dark"
            />
            <span className="text-text-secondary dark:text-text-secondary-dark">px</span>
          </div>
        </div>

        {/* Line Height */}
        <div className="flex items-center justify-between p-4 bg-surface-elevated dark:bg-surface-elevated-dark rounded-lg">
          <div>
            <label className="block text-text-primary dark:text-text-primary-dark font-medium mb-1">
              Line Height
            </label>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
              Set spacing between lines
            </p>
          </div>
          <select
            value={editorPreferences.lineHeight}
            onChange={(e) => handleEditorPrefChange('lineHeight', parseFloat(e.target.value))}
            className="px-3 py-1 bg-primary-bg dark:bg-primary-bg-dark border border-border dark:border-border-dark rounded text-text-primary dark:text-text-primary-dark"
          >
            <option value="1">1.0</option>
            <option value="1.2">1.2</option>
            <option value="1.5">1.5</option>
            <option value="2">2.0</option>
          </select>
        </div>

        {/* Tab Size */}
        <div className="flex items-center justify-between p-4 bg-surface-elevated dark:bg-surface-elevated-dark rounded-lg">
          <div>
            <label className="block text-text-primary dark:text-text-primary-dark font-medium mb-1">
              Tab Size
            </label>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
              Number of spaces per tab
            </p>
          </div>
          <select
            value={editorPreferences.tabSize}
            onChange={(e) => handleEditorPrefChange('tabSize', parseInt(e.target.value))}
            className="px-3 py-1 bg-primary-bg dark:bg-primary-bg-dark border border-border dark:border-border-dark rounded text-text-primary dark:text-text-primary-dark"
          >
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
          </select>
        </div>

        {/* Line Numbers */}
        <div className="flex items-center justify-between p-4 bg-surface-elevated dark:bg-surface-elevated-dark rounded-lg">
          <div>
            <label className="block text-text-primary dark:text-text-primary-dark font-medium mb-1">
              Show Line Numbers
            </label>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
              Display line numbers in the editor
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={editorPreferences.lineNumbers}
              onChange={(e) => handleEditorPrefChange('lineNumbers', e.target.checked)}
              className="w-5 h-5"
            />
          </label>
        </div>

        {/* Word Wrap */}
        <div className="flex items-center justify-between p-4 bg-surface-elevated dark:bg-surface-elevated-dark rounded-lg">
          <div>
            <label className="block text-text-primary dark:text-text-primary-dark font-medium mb-1">
              Word Wrap
            </label>
            <p className="text-text-secondary dark:text-text-secondary-dark text-sm">
              Wrap long lines to the editor width
            </p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={editorPreferences.wordWrap}
              onChange={(e) => handleEditorPrefChange('wordWrap', e.target.checked)}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>
    );
  };


  return (
    <div className="p-4">
      {renderEditorPreferences()}
    </div>
  );
};

export default SettingsView;
