import React, { useState, useEffect } from 'react';
import { getAllAppPreferences, setAppPreference, deleteAppPreference } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminPreferencesPage = () => {
  const [preferences, setPreferences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPref, setCurrentPref] = useState({ key: '', value: '', description: '' });
  const [valueType, setValueType] = useState('string');

  const fetchPreferences = async () => {
    try { setIsLoading(true); setError(''); const data = await getAllAppPreferences(); setPreferences(data || []); }
    catch (err) { setError(err.message || 'Failed to load preferences.'); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { fetchPreferences(); }, []);

  const handleInputChange = (e) => { const { name, value } = e.target; setCurrentPref((prev) => ({ ...prev, [name]: value })); };
  const handleValueTypeChange = (e) => { setValueType(e.target.value); setCurrentPref(prev => ({ ...prev, value: '' })); };
  const resetForm = () => { setCurrentPref({ key: '', value: '', description: '' }); setValueType('string'); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccessMessage('');
    if (!currentPref.key || currentPref.value.trim() === '') { setError('Key and Value are required.'); return; }
    let parsedValue = currentPref.value;
    try {
      if (valueType === 'number') { parsedValue = parseFloat(currentPref.value); if (isNaN(parsedValue)) throw new Error('Invalid number for value.'); }
      else if (valueType === 'boolean') { if (currentPref.value.toLowerCase() === 'true') parsedValue = true; else if (currentPref.value.toLowerCase() === 'false') parsedValue = false; else throw new Error("Boolean value must be 'true' or 'false'."); }
      else if (valueType === 'json_array' || valueType === 'json_object') { parsedValue = JSON.parse(currentPref.value); }
    } catch (parseError) { setError(`Error parsing value as ${valueType}: ${parseError.message}. Please ensure correct format.`); return; }
    try {
      await setAppPreference({ key: currentPref.key, value: parsedValue, description: currentPref.description });
      setSuccessMessage(`Preference '${currentPref.key}' saved successfully!`); resetForm(); fetchPreferences();
    } catch (err) { setError(err.message || 'Failed to save preference.'); }
  };

  const handleEdit = (pref) => {
    let valStr = pref.value; let type = 'string';
    if (typeof pref.value === 'number') { type = 'number'; valStr = String(pref.value); }
    else if (typeof pref.value === 'boolean') { type = 'boolean'; valStr = String(pref.value); }
    else if (Array.isArray(pref.value)) { type = 'json_array'; try { valStr = JSON.stringify(pref.value, null, 2); } catch { valStr = '[]';}}
    else if (typeof pref.value === 'object' && pref.value !== null) { type = 'json_object'; try { valStr = JSON.stringify(pref.value, null, 2); } catch { valStr = '{}';}}
    setCurrentPref({ key: pref.key, value: valStr, description: pref.description || '' }); setValueType(type); setSuccessMessage(''); setError('');
  };
  
  const handleDelete = async (preferenceKey) => {
    if (window.confirm(`Are you sure you want to delete the preference: '${preferenceKey}'?`)) {
      setError(''); setSuccessMessage('');
      try { await deleteAppPreference(preferenceKey); setSuccessMessage(`Preference '${preferenceKey}' deleted successfully!`); fetchPreferences(); if(currentPref.key === preferenceKey) resetForm(); }
      catch (err) { setError(err.message || 'Failed to delete preference.'); }
    }
  };

  const renderValue = (value) => {
    if (value === null || value === undefined) return <span className="text-g-tertiary-text italic">N/A</span>;
    if (typeof value === 'object' || Array.isArray(value)) {
      try { return <pre className="text-xs bg-g-primary-bg p-2 rounded whitespace-pre-wrap break-all">{JSON.stringify(value, null, 2)}</pre>; }
      catch (e) { return <pre className="text-xs text-red-400">Error displaying value</pre>; }
    }
    return String(value);
  };
  
  const inputClass = "mt-1";
  const labelClass = "block text-sm font-medium text-g-secondary-text mb-1";

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-g-primary-text mb-8">Manage Application Preferences</h1>

      {successMessage && <p className="mb-4 text-sm text-green-400 bg-green-900 bg-opacity-30 p-3 rounded-md">{successMessage}</p>}
      {error && <p className="mb-4 text-sm text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-md">{error}</p>}

      <div className="bg-g-secondary-bg p-6 rounded-lg shadow-g-card mb-8">
        <h3 className="text-xl font-semibold text-g-primary-text mb-4">Set/Update Preference</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="key" className={labelClass}>Key:</label>
            <input type="text" name="key" value={currentPref.key} onChange={handleInputChange} required className={inputClass} disabled={!!(currentPref.key && preferences.find(p=>p.key === currentPref.key))} />
          </div>
          <div>
            <label htmlFor="valueType" className={labelClass}>Value Type:</label>
            <select name="valueType" value={valueType} onChange={handleValueTypeChange} className={inputClass}>
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean (true/false)</option>
              <option value="json_array">JSON Array</option>
              <option value="json_object">JSON Object</option>
            </select>
          </div>
          <div>
            <label htmlFor="value" className={labelClass}>Value:</label>
            {valueType === 'json_array' || valueType === 'json_object' ? (
              <textarea name="value" value={currentPref.value} onChange={handleInputChange} required rows="5" className={`${inputClass} font-mono text-xs`} placeholder={`Enter valid JSON ${valueType === 'json_array' ? 'Array, e.g., ["item1", 2]' : 'Object, e.g., {"prop": "value"}'}`}/>
            ) : (
              <input type={valueType === 'number' ? 'number' : 'text'} name="value" value={currentPref.value} onChange={handleInputChange} required className={inputClass} placeholder={valueType === 'boolean' ? 'true or false' : ''}/>
            )}
          </div>
          <div>
            <label htmlFor="description" className={labelClass}>Description (Optional):</label>
            <input type="text" name="description" value={currentPref.description} onChange={handleInputChange} className={inputClass}/>
          </div>
          <div className="flex space-x-3 pt-2">
            <button type="submit" className="btn btn-primary">Save Preference</button>
            {currentPref.key && <button type="button" onClick={resetForm} className="btn btn-secondary">Clear Form / Cancel Edit</button>}
          </div>
        </form>
      </div>

      <div className="bg-g-secondary-bg p-6 rounded-lg shadow-g-card">
        <h3 className="text-xl font-semibold text-g-primary-text mb-4">Current Preferences</h3>
        {isLoading ? ( <LoadingSpinner /> ) : 
         preferences.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-g-border">
              <thead className="bg-g-hover-bg">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Key</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Value</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-g-secondary-text uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-g-secondary-bg divide-y divide-g-border">
                {preferences.map((pref) => (
                  <tr key={pref._id} className="hover:bg-g-hover-bg transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-g-primary-text">{pref.key}</td>
                    <td className="px-6 py-4 text-sm text-g-primary-text">{renderValue(pref.value)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-g-secondary-text">{pref.description || <span className="italic text-g-tertiary-text">N/A</span>}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleEdit(pref)} className="btn btn-ghost text-g-accent-blue hover:text-blue-400 px-2 py-1">Edit</button>
                      <button onClick={() => handleDelete(pref.key)} className="btn btn-ghost text-red-400 hover:text-red-300 px-2 py-1">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !error && <p className="text-g-secondary-text">No application preferences currently set.</p>
        )}
        {!isLoading && preferences.length === 0 && error && <p className="text-red-400">Error loading preferences: {error}</p>}
      </div>
    </div>
  );
};

export default AdminPreferencesPage;