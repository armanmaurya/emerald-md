interface SettingsViewProps {
  category?: 'general' | 'appearance' | 'shortcuts';
}

const SettingsView = ({ category = 'general' }: SettingsViewProps) => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
        Settings
      </h1>
      <div className="space-y-4">
        <div className="text-text-secondary dark:text-text-secondary-dark">
          <p>Category: <span className="capitalize">{category}</span></p>
        </div>
        <div className="text-text-secondary dark:text-text-secondary-dark">
          Settings interface coming soon...
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
