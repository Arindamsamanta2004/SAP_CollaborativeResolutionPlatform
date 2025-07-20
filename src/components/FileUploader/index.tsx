import React, { useRef, useState } from 'react';
import {
  Button,
  List,
  MessageStrip,
  FlexBox,
  FlexBoxDirection,
  FlexBoxJustifyContent,
  FlexBoxAlignItems,
  ListItemStandard
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/upload.js';
import '@ui5/webcomponents-icons/dist/attachment.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import './styles.css';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  onFileRemoved: (file: File) => void;
  selectedFiles: File[];
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[]; // e.g. ['.jpg', '.png']
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  onFileRemoved,
  selectedFiles,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  acceptedFileTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.mp4']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Validate file types
    const invalidTypeFiles = files.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      return !acceptedFileTypes.includes(fileExtension);
    });
    
    if (invalidTypeFiles.length > 0) {
      setError(`Invalid file type(s). Accepted types: ${acceptedFileTypes.join(', ')}`);
      return;
    }
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    
    if (oversizedFiles.length > 0) {
      setError(`File(s) exceed the maximum size of ${formatFileSize(maxFileSize)}`);
      return;
    }
    
    onFilesSelected(files);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file removal
  const handleRemoveFile = (file: File) => {
    onFileRemoved(file);
  };

  return (
    <div className="file-uploader">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple
        accept={acceptedFileTypes.join(',')}
      />
      
      <FlexBox 
        direction={FlexBoxDirection.Column} 
        className="file-uploader-container"
      >
        <Button 
          icon="upload" 
          onClick={handleButtonClick}
          className="upload-button"
        >
          Upload Files
        </Button>
        
        <div className="file-type-info">
          Accepted file types: {acceptedFileTypes.join(', ')}
          <br />
          Maximum file size: {formatFileSize(maxFileSize)}
        </div>
        
        {error && (
          <MessageStrip
            design="Negative"
            hideCloseButton={false}
            onClose={() => setError(null)}
            className="error-message"
          >
            {error}
          </MessageStrip>
        )}
        
        {selectedFiles.length > 0 && (
          <List
            className="file-list"
            headerText={`Attachments (${selectedFiles.length})`}
          >
            {selectedFiles.map((file, index) => (
              <ListItemStandard
                key={`${file.name}-${index}`}
                icon="attachment"
                description={formatFileSize(file.size)}
                className="file-list-item"
              >
                <FlexBox
                  justifyContent={FlexBoxJustifyContent.SpaceBetween}
                  alignItems={FlexBoxAlignItems.Center}
                  style={{ width: '100%' }}
                >
                  <span>{file.name}</span>
                  <Button
                    icon="delete"
                    design="Transparent"
                    onClick={() => handleRemoveFile(file)}
                    tooltip="Remove file"
                  />
                </FlexBox>
              </ListItemStandard>
            ))}
          </List>
        )}
      </FlexBox>
    </div>
  );
};

export default FileUploader;