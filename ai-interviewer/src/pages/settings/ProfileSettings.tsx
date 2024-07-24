import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileSettings() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Here you would typically send the file to your server
      console.log('Uploading file:', selectedFile);
      // After successful upload, you might want to update the user's profile
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your profile information for the mock interview application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4">
          <div className="flex items-center space-x-4">
            {/* <Avatar className="h-24 w-24">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback>DP</AvatarFallback>
            </Avatar> */}
            <div className="flex flex-col gap-4">
              <Input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="mb-2"
              />
              <Button onClick={handleUpload} disabled={!selectedFile}>
                Upload Photo
              </Button>
            </div>
          </div>
          <Input placeholder="Full Name" />
          <Input placeholder="Email" type="email" />
          <Input placeholder="Preferred Job Role" />
          <Input placeholder="Experience Level" />
        </form>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save Profile</Button>
      </CardFooter>
    </Card>
  );
}

export default ProfileSettings;