import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ApiSettings = () => {
  const [apiKeys, setApiKeys] = useState({
    HUME_API_KEY: '',
    HUME_CLIENT_SECRET: '',
    HEYGEN_API_KEY: '',
    HEYGEN_API_URL: '',
    // Add more API keys as needed
  });

  const [newApiName, setNewApiName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    // Fetch current API keys from backend
    // This is a placeholder - you'll need to implement the actual fetching logic
    const fetchApiKeys = async () => {
      // const response = await fetch('/api/getApiKeys');
      // const data = await response.json();
      // setApiKeys(data);
    };

    fetchApiKeys();
  }, []);

  const handleApiKeyChange = (key: string, value: string) => {
    setApiKeys(prevKeys => ({
      ...prevKeys,
      [key]: value
    }));
  };

  const handleSaveApiKeys = async () => {
    // Save API keys to backend
    // This is a placeholder - you'll need to implement the actual saving logic
    // await fetch('/api/saveApiKeys', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(apiKeys),
    // });
    console.log('API keys saved:', apiKeys);
  };

  const handleAddNewApi = () => {
    if (newApiName && newApiKey) {
      setApiKeys(prevKeys => ({
        ...prevKeys,
        [newApiName]: newApiKey
      }));
      setNewApiName('');
      setNewApiKey('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.entries(apiKeys).map(([key, value]) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700">{key}</label>
            <Input
              type="text"
              value={value}
              onChange={(e) => handleApiKeyChange(key, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}

        <div className="mt-6">
          <h3 className="text-lg font-medium">Add New API</h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="API Name"
              value={newApiName}
              onChange={(e) => setNewApiName(e.target.value)}
            />
            <Input
              type="text"
              placeholder="API Key"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
            />
          </div>
          <Button onClick={handleAddNewApi} className="mt-2">Add API</Button>
        </div>

        <Button onClick={handleSaveApiKeys} className="mt-6">Save All API Keys</Button>
      </CardContent>
    </Card>
  );
};

export default ApiSettings;